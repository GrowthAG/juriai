import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "team.json"), "utf8"),
);
const credentials = JSON.parse(
  fs.readFileSync(
    path.join(root, "tools", "agent-bus", "data", "runtime", "credentials.json"),
    "utf8",
  ),
);
const origin = `http://${manifest.agentBus.host}:${manifest.agentBus.port}`;
const taskId = "PILOTO-001";
const clients = new Map();

async function connect(agentId) {
  const credential = credentials.agents?.[agentId];
  if (!credential?.token) throw new Error(`Credencial ausente para ${agentId}`);
  const client = new Client({ name: `pilot-${agentId}`, version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`), {
    requestInit: {
      headers: { Authorization: `Bearer ${credential.token}` },
    },
  });
  await client.connect(transport);
  clients.set(agentId, client);
  return client;
}

function parse(result) {
  if (result.isError) {
    const detail = result.content?.find((item) => item.type === "text")?.text;
    throw new Error(detail ?? "Falha MCP sem detalhe");
  }
  const text = result.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("Resultado MCP sem texto");
  return JSON.parse(text);
}

async function call(agentId, name, args) {
  const client = clients.get(agentId) ?? (await connect(agentId));
  return parse(await client.callTool({ name, arguments: args }));
}

function baseline() {
  return execFileSync("git", ["status", "--short"], {
    cwd: root,
    encoding: "utf8",
  });
}

const coordinator = "juriai-coordinator";
const po = "juriai-po";
const cyber = "juriai-cybersecurity";
const fullstack = "juriai-fullstack";
const before = baseline();

try {
  try {
    const existing = await call(coordinator, "get_task", { taskId });
    console.log(`Piloto ja existe com estado ${existing.status}.`);
    process.exitCode = existing.status === "completed" ? 0 : 1;
  } catch (error) {
    const message = String(error.message);
    if (!message.includes("Tarefa") || !message.includes("encontrada")) throw error;

    await call(coordinator, "create_task", {
      taskId,
      title: "Politica minima de expiracao de presenca do Agent Bus",
      description:
        "Validar o fluxo coordenador -> PO -> ciberseguranca -> fullstack e recomendar uma politica de presenca sem alterar arquivos.",
      createdBy: coordinator,
      assignedTo: po,
      priority: 10,
      writeScope: [],
      context: {
        mode: "read-only",
        acceptance: [
          "handoff explicito por PO, cyber e fullstack",
          "arquivos alterados: nenhum",
          "recomendacao, riscos e testes verificaveis",
        ],
      },
    });

    await call(po, "read_inbox", {
      agentId: po,
      unreadOnly: true,
      markRead: true,
      limit: 20,
    });
    await call(po, "claim_task", { taskId, agentId: po, allowConflict: false });
    await call(po, "handoff_task", {
      taskId,
      fromAgent: po,
      toAgent: cyber,
      allowConflict: false,
      note: [
        "STATUS: concluido",
        "RESULTADO: definir online, stale e offline; heartbeat renova lastSeen; falha do bus nao prova abandono.",
        "EVIDENCIAS: TEAM.md, BOARD.md e store.mjs.",
        "ARQUIVOS ALTERADOS: nenhum.",
        "RISCOS/PENDENCIAS: presenca forjada, terminal morto online, falso offline e clock skew.",
        "PROXIMA ACAO: Cyber definir controles e testes.",
      ].join("\n"),
    });

    await call(cyber, "read_inbox", {
      agentId: cyber,
      unreadOnly: true,
      markRead: true,
      limit: 20,
    });
    await call(cyber, "claim_task", { taskId, agentId: cyber, allowConflict: false });
    await call(cyber, "handoff_task", {
      taskId,
      fromAgent: cyber,
      toAgent: fullstack,
      allowConflict: false,
      note: [
        "STATUS: concluido",
        "RESULTADO: TTL recomendado de 300s; status efetivo offline apos expiracao; chamada autenticada renova presenca.",
        "EVIDENCIAS: identidade deriva do bearer; lastSeenAt persiste no SQLite; notifier consulta status efetivo.",
        "ARQUIVOS ALTERADOS: nenhum.",
        "RISCOS/PENDENCIAS: replay local, falso offline por pausa longa e auditoria nao inviolavel ao dono do SO.",
        "CONTROLES: token por agente, clock testavel, lastSeen exposto ao coordenador, wake negado a stale.",
        "PROXIMA ACAO: Fullstack validar pontos de implementacao e testes.",
      ].join("\n"),
    });

    await call(fullstack, "read_inbox", {
      agentId: fullstack,
      unreadOnly: true,
      markRead: true,
      limit: 20,
    });
    await call(fullstack, "claim_task", {
      taskId,
      agentId: fullstack,
      allowConflict: false,
    });
    await call(fullstack, "complete_task", {
      taskId,
      agentId: fullstack,
      result: {
        status: "concluido",
        recommendation:
          "Usar TTL padrao de 300s calculado sobre lastSeenAt, preservar reportedStatus e expor stale; renovar por heartbeat/chamada autenticada.",
        inspected: [
          "tools/agent-bus/src/store.mjs: effectivePresence/getAgent/listAgents/heartbeat",
          "tools/agent-bus/src/server.mjs: autenticacao e health",
          "tools/agent-bus/src/mosaic.mjs: wake",
          "scripts/team-bus.mjs: status",
        ],
        tests: [
          "clock injetavel antes/depois de 300s",
          "heartbeat restaura idle",
          "includeOffline respeita status efetivo",
          "notifier nao acorda stale",
        ],
        filesChanged: [],
        decisionNeeded: "Coordenador humano aprovar TTL de 300s como politica inicial.",
      },
    });

    const completed = await call(coordinator, "get_task", { taskId });
    const events = await call(coordinator, "list_events", { taskId, limit: 100 });
    const after = baseline();
    console.log(`Piloto ${completed.status}: ${events.length} eventos auditados.`);
    console.log(`Worktree preservado durante o piloto: ${before === after ? "sim" : "houve mudanca concorrente"}.`);
  }
} finally {
  for (const agentId of [po, cyber, fullstack, coordinator]) {
    try {
      if (clients.has(agentId)) {
        await call(agentId, "heartbeat", { agentId, status: "offline" });
      }
    } catch {
      // Cleanup must not hide the pilot result.
    }
  }
  await Promise.all([...clients.values()].map((client) => client.close()));
}
