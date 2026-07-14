import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";

import { MosaicNotifier } from "./mosaic.mjs";
import { AgentBusStore } from "./store.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.JURIAI_AGENT_BUS_HOST ?? "127.0.0.1";
const port = Number(process.env.JURIAI_AGENT_BUS_PORT ?? 8766);
const databasePath = path.resolve(
  process.env.JURIAI_AGENT_BUS_DB ?? path.join(here, "..", "data", "agent-bus.sqlite"),
);
const bearerToken = process.env.JURIAI_AGENT_BUS_TOKEN;

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const store = new AgentBusStore(databasePath);
const notifier = new MosaicNotifier();

function result(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function tokensMatch(received, expected) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function notifyAgent(agentId, reason) {
  return notifier.wake(store.getAgent(agentId), reason);
}

function createServer() {
  const server = new McpServer({
    name: "juriai-agent-bus",
    version: "0.1.0",
  });

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
    async (input) => result(store.registerAgent(input)),
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
    async (input) => result(store.listAgents(input)),
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
    async ({ agentId, status }) => result(store.heartbeat(agentId, status)),
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
      const task = store.createTask(input);
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
    async ({ taskId }) => result(store.requireTask(taskId)),
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
    async (input) => result(store.listTasks(input)),
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
      const task = store.assignTask(input);
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
    async (input) => result(store.claimTask(input)),
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
      const handoff = store.handoffTask(input);
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
      const message = store.sendMessage(input);
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
    async (input) => result(store.readInbox(input)),
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
    async (input) => result(store.acknowledgeMessage(input)),
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
      const report = store.reportBlocker(input);
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
    async ({ taskId, agentId, result: taskResult }) =>
      result(store.updateTaskStatus({ taskId, agentId, status: "completed", result: taskResult })),
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
    async ({ taskId, agentId, error }) =>
      result(store.updateTaskStatus({ taskId, agentId, status: "failed", error })),
  );

  return server;
}

const app = createMcpExpressApp({ host });

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "juriai-agent-bus",
    databasePath,
    mosaicWakeEnabled: notifier.enabled,
    registeredAgents: store.listAgents().length,
  });
});

app.use("/mcp", (req, res, next) => {
  if (!bearerToken) return next();
  const authorization = req.headers.authorization ?? "";
  const received = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!received || !tokensMatch(received, bearerToken)) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: null,
    });
  }
  return next();
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
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

for (const method of ["get", "delete"]) {
  app[method]("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed in stateless mode" },
      id: null,
    });
  });
}

const httpServer = app.listen(port, host, (error) => {
  if (error) {
    console.error("Falha ao iniciar o Agent Bus:", error);
    process.exit(1);
  }
  console.log(`JuriAI Agent Bus em http://${host}:${port}/mcp`);
  console.log(`SQLite: ${databasePath}`);
  if (!bearerToken) {
    console.log("Autenticação desativada; mantenha o serviço limitado a 127.0.0.1.");
  }
});

function shutdown() {
  httpServer.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
