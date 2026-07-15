import { randomBytes } from "node:crypto";
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
const runtimeDirectory = path.join(root, "tools", "agent-bus", "data", "runtime");
const credentialsPath = path.join(runtimeDirectory, "credentials.json");

function writePrivateJson(filename, value) {
  const temporary = `${filename}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fs.chmodSync(temporary, 0o600);
  fs.renameSync(temporary, filename);
  fs.chmodSync(filename, 0o600);
}

function bootstrapCredentials({ rotate = false } = {}) {
  fs.mkdirSync(runtimeDirectory, { recursive: true, mode: 0o700 });
  fs.chmodSync(runtimeDirectory, 0o700);
  const existing = fs.existsSync(credentialsPath)
    ? JSON.parse(fs.readFileSync(credentialsPath, "utf8"))
    : { schemaVersion: 1, projectId: manifest.agentBus.projectId, agents: {} };
  existing.schemaVersion = 1;
  existing.projectId = manifest.agentBus.projectId;
  const previous = existing.agents ?? {};
  existing.agents = {};
  for (const role of manifest.roles) {
    existing.agents[role.agentId] = {
      role: role.key,
      token:
        !rotate && previous[role.agentId]?.token
          ? previous[role.agentId].token
          : randomBytes(32).toString("hex"),
    };
  }
  writePrivateJson(credentialsPath, existing);
  return credentialsPath;
}

function bootstrap(store) {
  const credentials = bootstrapCredentials();
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
  console.log(`Credenciais privadas: ${credentials}`);
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

fs.mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 });
fs.chmodSync(path.dirname(databasePath), 0o700);
const store = new AgentBusStore(databasePath);
try {
  if (command === "bootstrap") bootstrap(store);
  else if (command === "rotate") {
    const credentials = bootstrapCredentials({ rotate: true });
    console.log(`Credenciais rotacionadas em ${credentials}. Reinicie com team:down e team:up.`);
  }
  else if (command === "status") status(store);
  else {
    console.error(`Comando invalido: ${command}. Use bootstrap, rotate ou status.`);
    process.exitCode = 1;
  }
} finally {
  store.close();
  for (const filename of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) {
    if (fs.existsSync(filename)) fs.chmodSync(filename, 0o600);
  }
}
