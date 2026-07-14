import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AgentBusStore } from "../tools/agent-bus/src/store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "team.json"), "utf8"),
);
const databasePath = path.resolve(
  process.env.JURIAI_AGENT_BUS_DB ??
    path.join(root, "tools", "agent-bus", "data", "agent-bus.sqlite"),
);
const command = process.argv[2] ?? "status";

function bootstrap(store) {
  for (const role of manifest.roles) {
    const current = store.getAgent(role.agentId);
    if (current) continue;
    store.registerAgent({
      agentId: role.agentId,
      provider: "unassigned",
      model: "unassigned",
      role: role.key,
      cwd: root,
      capabilities: role.capabilities,
      status: "offline",
      wakeEnabled: false,
    });
  }
  console.log(`Registro preparado: ${manifest.roles.length} papeis em ${databasePath}`);
}

function status(store) {
  const agents = new Map(store.listAgents().map((agent) => [agent.agentId, agent]));
  const now = Date.now();
  const rows = manifest.roles.map((role) => {
    const agent = agents.get(role.agentId);
    const ageSeconds = agent
      ? Math.max(0, Math.round((now - Date.parse(agent.lastSeenAt)) / 1000))
      : null;
    const stale = ageSeconds !== null && ageSeconds > 120 && agent.status !== "offline";
    return {
      papel: role.key,
      agente: role.agentId,
      estado: !agent ? "nao registrado" : stale ? `${agent.status} (stale)` : agent.status,
      provedor: agent?.provider ?? "-",
      modelo: agent?.model ?? "-",
      ultimaPresenca: ageSeconds === null ? "-" : `${ageSeconds}s`,
    };
  });
  console.table(rows);
}

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const store = new AgentBusStore(databasePath);
try {
  if (command === "bootstrap") bootstrap(store);
  else if (command === "status") status(store);
  else {
    console.error(`Comando invalido: ${command}. Use bootstrap ou status.`);
    process.exitCode = 1;
  }
} finally {
  store.close();
}
