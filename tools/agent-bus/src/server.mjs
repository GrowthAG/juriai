import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";

import {
  authenticateBearer,
  loadAgentCredentials,
  safeSecretEqual,
  securePath,
  signControlChallenge,
} from "./auth.mjs";
import { MosaicNotifier } from "./mosaic.mjs";
import { AgentBusStore } from "./store.mjs";

process.umask(0o077);

const here = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.JURIAI_AGENT_BUS_HOST ?? "127.0.0.1";
const port = Number(process.env.JURIAI_AGENT_BUS_PORT ?? 8766);
const protocolVersion = 1;
const projectId = process.env.JURIAI_AGENT_BUS_PROJECT_ID ?? "juriai-app";
const instanceId = process.env.JURIAI_AGENT_BUS_INSTANCE_ID ?? `manual-${process.pid}`;
const startedAt = new Date().toISOString();
const databasePath = path.resolve(
  process.env.JURIAI_AGENT_BUS_DB ?? path.join(here, "..", "data", "agent-bus.sqlite"),
);
const credentialsPath = path.resolve(
  process.env.JURIAI_AGENT_BUS_CREDENTIALS ??
    path.join(here, "..", "data", "runtime", "credentials.json"),
);
const manifestPath = path.resolve(
  process.env.JURIAI_AGENT_BUS_MANIFEST ??
    path.join(here, "..", "..", "..", ".agents", "team.json"),
);
const allowInsecureLocal =
  process.env.NODE_ENV === "test" &&
  process.env.JURIAI_AGENT_BUS_ALLOW_INSECURE_LOCAL === "1";
const controlToken = process.env.JURIAI_AGENT_BUS_CONTROL_TOKEN;
const presenceTtlSeconds = Number(
  process.env.JURIAI_AGENT_BUS_PRESENCE_TTL_SECONDS ?? 300,
);
const loopbackHosts = new Set(["127.0.0.1", "::1", "localhost"]);

if (!loopbackHosts.has(host)) {
  throw new Error(`Agent Bus recusa bind fora de loopback: ${host}`);
}

fs.mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 });
fs.chmodSync(path.dirname(databasePath), 0o700);

const store = new AgentBusStore(databasePath, { presenceTtlSeconds });
for (const filename of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) {
  securePath(filename, 0o600);
}
const teamManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (teamManifest.agentBus?.projectId !== projectId) {
  store.close();
  throw new Error(`Manifesto pertence a outro projeto: ${teamManifest.agentBus?.projectId}`);
}
const allowedAgents = new Map(
  teamManifest.roles.map((role) => [role.agentId, role.key]),
);
const credentials = loadAgentCredentials(credentialsPath, projectId, allowedAgents);
if (!credentials && !allowInsecureLocal) {
  store.close();
  throw new Error(
    `Credenciais ausentes em ${credentialsPath}. Execute npm run team:bootstrap ou habilite explicitamente JURIAI_AGENT_BUS_ALLOW_INSECURE_LOCAL=1.`,
  );
}
const notifier = new MosaicNotifier();

function result(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

async function notifyAgent(agentId, reason) {
  return notifier.wake(store.getAgent(agentId), reason);
}

function createServer(principal) {
  const server = new McpServer({
    name: "juriai-agent-bus",
    version: "0.2.0",
  });

  function deny(action, reason, taskId) {
    store.event("authorization.denied", principal?.agentId ?? null, taskId ?? null, {
      action,
      reason,
    });
    throw new Error(`Nao autorizado: ${reason}`);
  }

  function requireSelf(input, field, action) {
    if (principal && input[field] !== principal.agentId) {
      deny(action, `${principal.agentId} nao pode agir como ${input[field]}`, input.taskId);
    }
  }

  function requireCoordinator(action, taskId) {
    if (principal && principal.agentId !== "juriai-coordinator") {
      deny(action, "somente o coordenador pode executar esta acao", taskId);
    }
  }

  function rejectConflictOverride(input, action) {
    if (principal && input.allowConflict && principal.agentId !== "juriai-coordinator") {
      deny(action, "allowConflict exige coordenador", input.taskId);
    }
  }

  function requireTaskVisibility(taskId, action) {
    const task = store.requireTask(taskId);
    if (
      principal &&
      principal.agentId !== "juriai-coordinator" &&
      task.createdBy !== principal.agentId &&
      task.assignedTo !== principal.agentId
    ) {
      deny(action, "tarefa nao pertence ao agente", taskId);
    }
    return task;
  }

  function requireAssignee(taskId, action) {
    const task = store.requireTask(taskId);
    if (principal && task.assignedTo !== principal.agentId) {
      deny(action, "somente o responsavel atual pode executar esta transicao", taskId);
    }
    return task;
  }

  server.registerTool(
    "register_agent",
    {
      description:
        "Registra ou atualiza um agente/terminal no barramento. No Mosaic, informe MOSAIC_SURFACE_ID e MOSAIC_WORKSPACE_ID do próprio terminal.",
      inputSchema: {
        agentId: z.string().min(1).describe("Identificador estável e único, por exemplo codex-backend-1"),
        provider: z.string().min(1).describe("Provedor, por exemplo openai, anthropic ou google"),
        model: z.string().min(1).describe("Nome do modelo em uso"),
        role: z.string().min(1).describe("Especialidade ou responsabilidade do agente"),
        surfaceId: z.string().min(1).optional().describe("MOSAIC_SURFACE_ID deste terminal"),
        workspaceId: z.string().min(1).optional().describe("MOSAIC_WORKSPACE_ID deste terminal"),
        cwd: z.string().optional().describe("Diretório de trabalho ou worktree do agente"),
        capabilities: z.array(z.string()).default([]),
        status: z.enum(["idle", "working", "waiting", "offline"]).default("idle"),
        wakeEnabled: z.boolean().default(false).describe("Autoriza o barramento a digitar um aviso curto neste terminal quando ele estiver ocioso"),
      },
    },
    async (input) => {
      requireSelf(input, "agentId", "register_agent");
      if (principal && input.role !== principal.role) {
        deny("register_agent", `papel esperado ${principal.role}`, null);
      }
      return result(
        store.registerAgent({
          ...input,
          agentId: principal?.agentId ?? input.agentId,
          role: principal?.role ?? input.role,
        }),
      );
    },
  );

  server.registerTool(
    "list_agents",
    {
      description: "Lista agentes registrados, seus modelos, papéis, terminais e estado atual.",
      inputSchema: {
        workspaceId: z.string().optional(),
        includeOffline: z.boolean().default(true),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      if (principal && principal.agentId !== "juriai-coordinator") {
        const agent = store.getAgent(principal.agentId);
        return result(agent ? [{ ...agent, surfaceId: null, cwd: null }] : []);
      }
      return result(store.listAgents(input));
    },
  );

  server.registerTool(
    "heartbeat",
    {
      description: "Atualiza a presença do agente. Use working antes de atuar e idle ao ficar disponível.",
      inputSchema: {
        agentId: z.string().min(1),
        status: z.enum(["idle", "working", "waiting", "offline"]).default("idle"),
      },
    },
    async ({ agentId, status }) => {
      requireSelf({ agentId }, "agentId", "heartbeat");
      return result(store.heartbeat(principal?.agentId ?? agentId, status));
    },
  );

  server.registerTool(
    "create_task",
    {
      description: "Cria uma tarefa compartilhada e, opcionalmente, já a atribui a outro agente.",
      inputSchema: {
        taskId: z.string().min(1).optional(),
        title: z.string().min(1),
        description: z.string().min(1),
        createdBy: z.string().min(1),
        assignedTo: z.string().min(1).optional(),
        priority: z.number().int().min(-10).max(10).default(0),
        parentTaskId: z.string().min(1).optional(),
        writeScope: z.array(z.string().min(1)).default([]).describe("Arquivos ou diretórios relativos que o agente poderá alterar"),
        context: z.record(z.string(), z.unknown()).default({}),
      },
    },
    async (input) => {
      requireCoordinator("create_task", input.parentTaskId);
      if (principal) requireSelf(input, "createdBy", "create_task");
      const normalized = {
        ...input,
        createdBy: principal?.agentId ?? input.createdBy,
      };
      const task = store.createTask(normalized);
      const wake = input.assignedTo
        ? await notifyAgent(input.assignedTo, `nova tarefa ${task.taskId}`)
        : { sent: false, reason: "unassigned" };
      return result({ task, wake });
    },
  );

  server.registerTool(
    "get_task",
    {
      description: "Obtém todos os dados atuais de uma tarefa.",
      inputSchema: { taskId: z.string().min(1) },
      annotations: { readOnlyHint: true },
    },
    async ({ taskId }) => result(requireTaskVisibility(taskId, "get_task")),
  );

  server.registerTool(
    "list_tasks",
    {
      description: "Lista tarefas, com filtros opcionais por agente e estado.",
      inputSchema: {
        agentId: z.string().min(1).optional(),
        status: z
          .enum(["pending", "assigned", "in_progress", "blocked", "completed", "failed", "cancelled"])
          .optional(),
        limit: z.number().int().min(1).max(200).default(50),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      if (principal && principal.agentId !== "juriai-coordinator") {
        return result(store.listTasks({ ...input, agentId: principal.agentId }));
      }
      return result(store.listTasks(input));
    },
  );

  server.registerTool(
    "assign_task",
    {
      description: "Atribui uma tarefa ao agente destinatário, verificando conflito de escopo de escrita.",
      inputSchema: {
        taskId: z.string().min(1),
        fromAgent: z.string().min(1),
        toAgent: z.string().min(1),
        allowConflict: z.boolean().default(false),
      },
    },
    async (input) => {
      requireCoordinator("assign_task", input.taskId);
      if (principal) requireSelf(input, "fromAgent", "assign_task");
      const normalized = {
        ...input,
        fromAgent: principal?.agentId ?? input.fromAgent,
      };
      const task = store.assignTask(normalized);
      const wake = await notifyAgent(input.toAgent, `tarefa atribuída ${input.taskId}`);
      return result({ task, wake });
    },
  );

  server.registerTool(
    "claim_task",
    {
      description: "Assume atomicamente uma tarefa e muda seu estado para in_progress.",
      inputSchema: {
        taskId: z.string().min(1),
        agentId: z.string().min(1),
        allowConflict: z.boolean().default(false),
      },
    },
    async (input) => {
      requireSelf(input, "agentId", "claim_task");
      rejectConflictOverride(input, "claim_task");
      const task = store.requireTask(input.taskId);
      if (principal && task.assignedTo !== principal.agentId) {
        deny("claim_task", "tarefa deve ser atribuida pelo coordenador", input.taskId);
      }
      return result(
        store.claimTask({ ...input, agentId: principal?.agentId ?? input.agentId }),
      );
    },
  );

  server.registerTool(
    "handoff_task",
    {
      description: "Passa uma tarefa, seu contexto persistido e uma nota de transição para outro agente/modelo.",
      inputSchema: {
        taskId: z.string().min(1),
        fromAgent: z.string().min(1),
        toAgent: z.string().min(1),
        note: z.string().min(1),
        allowConflict: z.boolean().default(false),
      },
    },
    async (input) => {
      requireSelf(input, "fromAgent", "handoff_task");
      rejectConflictOverride(input, "handoff_task");
      const handoff = store.handoffTask({
        ...input,
        fromAgent: principal?.agentId ?? input.fromAgent,
      });
      const wake = await notifyAgent(input.toAgent, `handoff da tarefa ${input.taskId}`);
      return result({ ...handoff, wake });
    },
  );

  server.registerTool(
    "send_message",
    {
      description: "Envia uma mensagem persistente de um agente para outro, opcionalmente vinculada a uma tarefa.",
      inputSchema: {
        fromAgent: z.string().min(1),
        toAgent: z.string().min(1),
        taskId: z.string().min(1).optional(),
        kind: z.enum(["message", "question", "answer", "review", "decision"]).default("message"),
        body: z.string().min(1),
        metadata: z.record(z.string(), z.unknown()).default({}),
      },
    },
    async (input) => {
      requireSelf(input, "fromAgent", "send_message");
      if (input.taskId) {
        const task = requireTaskVisibility(input.taskId, "send_message");
        const participants = new Set([task.createdBy, task.assignedTo].filter(Boolean));
        if (principal && !participants.has(input.toAgent)) {
          deny("send_message", "destinatario nao participa da tarefa", input.taskId);
        }
      }
      const message = store.sendMessage({
        ...input,
        fromAgent: principal?.agentId ?? input.fromAgent,
      });
      const wake = await notifyAgent(input.toAgent, `${input.kind} de ${input.fromAgent}`);
      return result({ message, wake });
    },
  );

  server.registerTool(
    "read_inbox",
    {
      description: "Lê a caixa de entrada de um agente. Por padrão marca as mensagens retornadas como lidas.",
      inputSchema: {
        agentId: z.string().min(1),
        unreadOnly: z.boolean().default(true),
        markRead: z.boolean().default(true),
        limit: z.number().int().min(1).max(200).default(50),
      },
    },
    async (input) => {
      requireSelf(input, "agentId", "read_inbox");
      return result(
        store.readInbox({ ...input, agentId: principal?.agentId ?? input.agentId }),
      );
    },
  );

  server.registerTool(
    "acknowledge_message",
    {
      description: "Confirma explicitamente que o destinatário processou uma mensagem.",
      inputSchema: {
        messageId: z.string().min(1),
        agentId: z.string().min(1),
      },
    },
    async (input) => {
      requireSelf(input, "agentId", "acknowledge_message");
      return result(
        store.acknowledgeMessage({
          ...input,
          agentId: principal?.agentId ?? input.agentId,
        }),
      );
    },
  );

  server.registerTool(
    "report_blocker",
    {
      description: "Marca uma tarefa como bloqueada, registra o motivo e avisa o criador ou outro agente.",
      inputSchema: {
        taskId: z.string().min(1),
        agentId: z.string().min(1),
        toAgent: z.string().min(1).optional(),
        blocker: z.string().min(1),
      },
    },
    async (input) => {
      requireSelf(input, "agentId", "report_blocker");
      requireAssignee(input.taskId, "report_blocker");
      const report = store.reportBlocker({
        ...input,
        agentId: principal?.agentId ?? input.agentId,
      });
      const target = input.toAgent ?? report.task.createdBy;
      const wake = await notifyAgent(target, `bloqueio na tarefa ${input.taskId}`);
      return result({ ...report, wake });
    },
  );

  server.registerTool(
    "complete_task",
    {
      description: "Conclui uma tarefa e persiste um resultado estruturado para o próximo agente ou coordenador.",
      inputSchema: {
        taskId: z.string().min(1),
        agentId: z.string().min(1),
        result: z.unknown().optional(),
      },
    },
    async ({ taskId, agentId, result: taskResult }) => {
      requireSelf({ taskId, agentId }, "agentId", "complete_task");
      requireAssignee(taskId, "complete_task");
      return result(
        store.updateTaskStatus({
          taskId,
          agentId: principal?.agentId ?? agentId,
          status: "completed",
          result: taskResult,
        }),
      );
    },
  );

  server.registerTool(
    "fail_task",
    {
      description: "Encerra uma tarefa como falha e persiste o erro.",
      inputSchema: {
        taskId: z.string().min(1),
        agentId: z.string().min(1),
        error: z.string().min(1),
      },
    },
    async ({ taskId, agentId, error }) => {
      requireSelf({ taskId, agentId }, "agentId", "fail_task");
      requireAssignee(taskId, "fail_task");
      return result(
        store.updateTaskStatus({
          taskId,
          agentId: principal?.agentId ?? agentId,
          status: "failed",
          error,
        }),
      );
    },
  );

  server.registerTool(
    "cancel_task",
    {
      description: "Cancela uma tarefa. Somente o coordenador pode executar esta acao.",
      inputSchema: {
        taskId: z.string().min(1),
        agentId: z.string().min(1),
        reason: z.string().min(1).optional(),
      },
    },
    async (input) => {
      requireCoordinator("cancel_task", input.taskId);
      if (principal) requireSelf(input, "agentId", "cancel_task");
      return result(
        store.cancelTask({
          ...input,
          agentId: principal?.agentId ?? input.agentId,
        }),
      );
    },
  );

  server.registerTool(
    "list_events",
    {
      description: "Lista eventos de auditoria. Disponivel somente ao coordenador.",
      inputSchema: {
        actorAgent: z.string().min(1).optional(),
        taskId: z.string().min(1).optional(),
        eventType: z.string().min(1).optional(),
        limit: z.number().int().min(1).max(500).default(100),
      },
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      requireCoordinator("list_events", input.taskId);
      return result(store.listEvents(input));
    },
  );

  return server;
}

const app = createMcpExpressApp({ host });

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "juriai-agent-bus",
    protocolVersion,
    projectId,
    ready: store.ping(),
    authMode: allowInsecureLocal ? "test-insecure" : "agent-token",
  });
});

app.use("/mcp", (req, res, next) => {
  if (allowInsecureLocal) {
    req.juriaiPrincipal = null;
    return next();
  }
  const principal = authenticateBearer(req.headers.authorization, credentials);
  if (!principal) {
    store.event("authorization.denied", null, null, {
      action: "mcp.authenticate",
      reason: "missing_or_invalid_bearer",
    });
    return res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: null,
    });
  }
  req.juriaiPrincipal = principal;
  if (store.getAgent(principal.agentId)) store.touchPresence(principal.agentId);
  return next();
});

app.post("/mcp", async (req, res) => {
  const server = createServer(req.juriaiPrincipal);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Erro ao processar requisição MCP:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  } finally {
    res.on("close", () => {
      transport.close();
      server.close();
    });
  }
});

app.get("/admin/status", (req, res) => {
  const authorization = req.headers.authorization ?? "";
  const received = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!safeSecretEqual(received, controlToken)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  return res.json({
    ok: true,
    service: "juriai-agent-bus",
    protocolVersion,
    projectId,
    instanceId,
    pid: process.pid,
    startedAt,
    host,
    port,
    registeredAgents: store.listAgents().length,
    mosaicWakeEnabled: notifier.enabled,
  });
});

app.get("/admin/challenge", (req, res) => {
  const nonce = String(req.query.nonce ?? "");
  if (!controlToken || !/^[a-f0-9]{64}$/.test(nonce)) {
    return res.status(400).json({ ok: false, error: "Invalid challenge" });
  }
  const values = [nonce, instanceId, String(process.pid), projectId, startedAt];
  return res.json({
    ok: true,
    service: "juriai-agent-bus",
    protocolVersion,
    projectId,
    instanceId,
    pid: process.pid,
    startedAt,
    signature: signControlChallenge(controlToken, values),
  });
});

app.post("/admin/shutdown", (req, res) => {
  const authorization = req.headers.authorization ?? "";
  const received = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const requestedInstance = req.headers["x-juriai-instance-id"];
  if (
    !safeSecretEqual(received, controlToken) ||
    !safeSecretEqual(requestedInstance, instanceId)
  ) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  res.json({ ok: true, instanceId, shuttingDown: true });
  setImmediate(shutdown);
});

for (const method of ["get", "delete"]) {
  app[method]("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed in stateless mode" },
      id: null,
    });
  });
}

const httpServer = app.listen(port, host, () => {
  console.log(`JuriAI Agent Bus em http://${host}:${port}/mcp`);
  console.log(`SQLite: ${databasePath}`);
  if (allowInsecureLocal) {
    console.log("AVISO: autenticacao desativada por opt-in explicito.");
  }
});

httpServer.on("error", (error) => {
  console.error("Falha ao iniciar o Agent Bus:", error);
  store.close();
  process.exitCode = 1;
});

let shuttingDown = false;
let storeClosed = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const finish = () => {
    if (!storeClosed) {
      storeClosed = true;
      store.close();
    }
    process.exit(0);
  };
  httpServer.close(finish);
  httpServer.closeIdleConnections?.();
  setTimeout(() => {
    httpServer.closeAllConnections?.();
    finish();
  }, 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
