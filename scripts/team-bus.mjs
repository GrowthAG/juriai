import { spawn } from "node:child_process";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AgentBusStore } from "../tools/agent-bus/src/store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "team.json"), "utf8"),
);
const bus = {
  ...manifest.agentBus,
  host: process.env.JURIAI_AGENT_BUS_HOST ?? manifest.agentBus.host,
  port: Number(process.env.JURIAI_AGENT_BUS_PORT ?? manifest.agentBus.port),
  projectId: process.env.JURIAI_AGENT_BUS_PROJECT_ID ?? manifest.agentBus.projectId,
};
const origin = `http://${bus.host}:${bus.port}`;
const runtimeDirectory = path.join(root, "tools", "agent-bus", "data", "runtime");
const runtimePath = path.join(runtimeDirectory, "agent-bus.json");
const credentialsPath = path.join(runtimeDirectory, "credentials.json");
const logPath = path.join(runtimeDirectory, "agent-bus.log");
const startLockPath = path.join(runtimeDirectory, "start.lock");
const databasePath = path.join(root, "tools", "agent-bus", "data", "agent-bus.sqlite");
const serverPath = path.join(root, "tools", "agent-bus", "src", "server.mjs");
const command = process.argv[2] ?? "status";

function privateDirectory() {
  fs.mkdirSync(runtimeDirectory, { recursive: true, mode: 0o700 });
  fs.chmodSync(runtimeDirectory, 0o700);
}

function writeRuntime(value) {
  privateDirectory();
  const temporary = `${runtimePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
  fs.chmodSync(temporary, 0o600);
  fs.renameSync(temporary, runtimePath);
  fs.chmodSync(runtimePath, 0o600);
}

function readRuntime() {
  if (!fs.existsSync(runtimePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  } catch (error) {
    throw new Error(`Runtime invalido em ${runtimePath}: ${error.message}`);
  }
}

function acquireStartLock() {
  privateDirectory();
  let descriptor;
  try {
    descriptor = fs.openSync(startLockPath, "wx", 0o600);
    fs.writeFileSync(
      descriptor,
      `${JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })}\n`,
    );
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(
        `Outro start esta em andamento (${startLockPath}). Remova o lock apenas apos confirmar que nao ha start ativo.`,
      );
    }
    throw error;
  }
  return () => {
    fs.closeSync(descriptor);
    fs.rmSync(startLockPath, { force: true });
  };
}

async function tcpProbe() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: bus.host, port: bus.port });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1000, () => finish({ state: "unknown", reason: "timeout" }));
    socket.once("connect", () => finish({ state: "open" }));
    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED") finish({ state: "closed" });
      else finish({ state: "unknown", reason: error.code ?? error.message });
    });
  });
}

async function health(timeoutMs = 1500) {
  try {
    const response = await fetch(`${origin}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.json().catch(() => null);
    if (
      response.ok &&
      body?.service === "juriai-agent-bus" &&
      body.projectId === bus.projectId &&
      body.protocolVersion === bus.protocolVersion &&
      body.authMode === "agent-token"
    ) {
      return { state: body.ready === true ? "running" : "degraded", body };
    }
    if (response.ok && body?.service === "juriai-agent-bus") {
      return { state: "legacy", body };
    }
    return { state: "foreign", status: response.status, body };
  } catch (error) {
    const probe = await tcpProbe();
    if (probe.state === "closed") return { state: "stopped" };
    if (probe.state === "open") return { state: "foreign", reason: "tcp_open_http_unreadable" };
    return { state: "restricted", reason: probe.reason ?? error.cause?.code ?? error.message };
  }
}

function challengeSignature(runtime, response, nonce) {
  return createHmac("sha256", runtime.controlToken)
    .update(
      [nonce, response.instanceId, String(response.pid), response.projectId, response.startedAt].join(":"),
      "utf8",
    )
    .digest();
}

async function proveOwnership(runtime) {
  const nonce = randomBytes(32).toString("hex");
  const response = await fetch(`${origin}/admin/challenge?nonce=${nonce}`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`admin/challenge retornou HTTP ${response.status}`);
  const body = await response.json();
  const expected = challengeSignature(runtime, body, nonce);
  const received = Buffer.from(String(body.signature ?? ""), "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new Error("Assinatura de ownership invalida; segredo nao foi enviado");
  }
  assertOwned(runtime, body);
  return body;
}

function assertOwned(runtime, status) {
  if (
    status.instanceId !== runtime.instanceId ||
    status.pid !== runtime.pid ||
    status.projectId !== bus.projectId
  ) {
    throw new Error("A instancia ativa nao corresponde ao runtime local; operacao recusada");
  }
}

async function waitForManaged(runtime) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const current = await health(500);
    if (current.state === "running") {
      const status = await proveOwnership(runtime);
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Agent Bus nao ficou pronto; consulte ${logPath}`);
}

async function start() {
  const releaseLock = acquireStartLock();
  try {
  if (!fs.existsSync(credentialsPath)) {
    throw new Error("Credenciais ausentes. Execute npm run team:bootstrap primeiro.");
  }
  const current = await health();
  const runtime = readRuntime();
  if (current.state === "running") {
    if (!runtime) {
      throw new Error(
        `Agent Bus compativel esta ativo em ${origin}, mas nao e gerenciado; start recusado.`,
      );
    }
    const status = await proveOwnership(runtime);
    console.log(`Agent Bus ja esta ativo e gerenciado (PID ${status.pid}).`);
    return;
  }
  if (current.state !== "stopped") {
    throw new Error(
      `Porta ${bus.port} nao esta comprovadamente livre (${current.state}). Nenhum processo foi alterado.`,
    );
  }

  privateDirectory();
  const managed = {
    schemaVersion: 1,
    projectId: bus.projectId,
    instanceId: randomUUID(),
    controlToken: randomBytes(32).toString("hex"),
    host: bus.host,
    port: bus.port,
    startedAt: new Date().toISOString(),
  };
  const logFd = fs.openSync(logPath, "a", 0o600);
  fs.chmodSync(logPath, 0o600);
  const child = spawn(process.execPath, [serverPath], {
    cwd: root,
    detached: true,
    env: {
      ...process.env,
      JURIAI_AGENT_BUS_HOST: bus.host,
      JURIAI_AGENT_BUS_PORT: String(bus.port),
      JURIAI_AGENT_BUS_PROJECT_ID: bus.projectId,
      JURIAI_AGENT_BUS_DB: databasePath,
      JURIAI_AGENT_BUS_CREDENTIALS: credentialsPath,
      JURIAI_AGENT_BUS_INSTANCE_ID: managed.instanceId,
      JURIAI_AGENT_BUS_CONTROL_TOKEN: managed.controlToken,
      JURIAI_AGENT_BUS_ALLOW_INSECURE_LOCAL: "0",
    },
    stdio: ["ignore", logFd, logFd],
  });
  fs.closeSync(logFd);
  child.unref();
  managed.pid = child.pid;
  const status = await waitForManaged(managed);
  writeRuntime(managed);
  console.log(`Agent Bus autenticado iniciado em ${origin} (PID ${status.pid}).`);
  } finally {
    releaseLock();
  }
}

function registryRows() {
  if (!fs.existsSync(databasePath)) return [];
  const store = new AgentBusStore(databasePath);
  try {
    const agents = new Map(store.listAgents().map((agent) => [agent.agentId, agent]));
    return manifest.roles.map((role) => {
      const agent = agents.get(role.agentId);
      return {
        papel: role.key,
        estado: agent?.status ?? "nao registrado",
        stale: agent?.stale ?? false,
        provedor: agent?.provider ?? "-",
        modelo: agent?.model ?? "-",
        ultimaPresenca: agent?.lastSeenAt ?? "-",
      };
    });
  } finally {
    store.close();
  }
}

async function status() {
  const current = await health();
  const runtime = readRuntime();
  let ownership = "nao gerenciado";
  let owned = false;
  if (current.state === "running" && runtime) {
    try {
      const admin = await proveOwnership(runtime);
      ownership = `gerenciado, PID ${admin.pid}`;
      owned = true;
    } catch {
      ownership = "runtime divergente";
    }
  }
  console.log(`Agent Bus: ${current.state} (${ownership}) em ${origin}`);
  const rows = registryRows();
  if (rows.length) console.table(rows);
  if (current.state === "running" ? !owned : current.state !== "stopped") {
    process.exitCode = 1;
  }
}

async function stop() {
  const runtime = readRuntime();
  if (!runtime) {
    throw new Error("Nao existe instancia gerenciada. Nenhum processo foi encerrado.");
  }
  const current = await health();
  if (!["running", "degraded"].includes(current.state)) {
    throw new Error(`Servico nao esta identificado (${current.state}); encerramento recusado.`);
  }
  await proveOwnership(runtime);
  const response = await fetch(`${origin}/admin/shutdown`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtime.controlToken}`,
      "X-JuriAI-Instance-Id": runtime.instanceId,
    },
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`shutdown recusado: HTTP ${response.status}`);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const after = await health(300);
    if (after.state === "stopped") {
      fs.rmSync(runtimePath, { force: true });
      console.log("Agent Bus encerrado com confirmacao de identidade.");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Shutdown solicitado, mas a porta nao foi confirmada como fechada.");
}

function mode(filename) {
  return fs.existsSync(filename) ? fs.statSync(filename).mode & 0o777 : null;
}

async function doctor() {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ check: name, status: ok ? "ok" : "falha", detail });
  add("Node >= 20", Number(process.versions.node.split(".")[0]) >= 20, process.versions.node);
  add("manifesto", Boolean(bus?.host && bus?.port && bus?.projectId), origin);
  add("credenciais", fs.existsSync(credentialsPath), credentialsPath);
  if (fs.existsSync(credentialsPath)) {
    add("credenciais 0600", mode(credentialsPath) === 0o600, mode(credentialsPath)?.toString(8));
  }
  add(
    "perfis",
    manifest.roles.every((role) => fs.existsSync(path.join(root, role.roleFile))),
    `${manifest.roles.length} papeis`,
  );
  const current = await health();
  add("health autenticado", current.state === "running", current.state);
  if (current.state === "running") {
    add("database ready", current.body.ready === true, String(current.body.ready));
  }
  if (fs.existsSync(databasePath)) {
    add("SQLite 0600", mode(databasePath) === 0o600, mode(databasePath)?.toString(8));
  }
  const codexConfig = fs.readFileSync(path.join(root, ".codex", "config.toml"), "utf8");
  add("Codex bearer", codexConfig.includes("bearer_token_env_var"), ".codex/config.toml");
  const runtime = readRuntime();
  add("runtime gerenciado", Boolean(runtime), runtimePath);
  if (current.state === "running" && runtime) {
    try {
      const ownership = await proveOwnership(runtime);
      add("ownership HMAC", true, `PID ${ownership.pid}`);
    } catch (error) {
      add("ownership HMAC", false, error.message);
    }
  }
  console.table(checks);
  if (checks.some((check) => check.status === "falha")) process.exitCode = 1;
}

try {
  if (command === "start") await start();
  else if (command === "status") await status();
  else if (command === "stop") await stop();
  else if (command === "doctor") await doctor();
  else throw new Error(`Comando invalido: ${command}. Use start, status, stop ou doctor.`);
} catch (error) {
  console.error(`team-bus: ${error.message}`);
  process.exitCode = 1;
}
