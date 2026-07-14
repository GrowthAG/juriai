import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForHealth(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`servidor encerrou: ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // The child process may still be binding the port.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("health check indisponivel");
}

async function connectClient(url, token, name) {
  const client = new Client({ name, version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  await client.connect(transport);
  return client;
}

function parseResult(result) {
  const item = result.content.find((content) => content.type === "text");
  assert.ok(item);
  return JSON.parse(item.text);
}

test("tokens por agente e RBAC impedem impersonacao", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "juriai-agent-security-"));
  const port = await freePort();
  const coordinatorToken = "c".repeat(64);
  const poToken = "p".repeat(64);
  const credentialsPath = path.join(directory, "credentials.json");
  fs.writeFileSync(
    credentialsPath,
    JSON.stringify({
      schemaVersion: 1,
      projectId: "security-test",
      agents: {
        "juriai-coordinator": { role: "coordinator", token: coordinatorToken },
        "juriai-po": { role: "po", token: poToken },
      },
    }),
    { mode: 0o600 },
  );
  const child = spawn(process.execPath, ["src/server.mjs"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      JURIAI_AGENT_BUS_PORT: String(port),
      JURIAI_AGENT_BUS_DB: path.join(directory, "test.sqlite"),
      JURIAI_AGENT_BUS_PROJECT_ID: "security-test",
      JURIAI_AGENT_BUS_CREDENTIALS: credentialsPath,
      JURIAI_AGENT_BUS_INSTANCE_ID: "security-instance",
      JURIAI_AGENT_BUS_CONTROL_TOKEN: "control-secret",
      JURIAI_MOSAIC_WAKE: "0",
    },
    stdio: "ignore",
  });

  const clients = [];
  t.after(async () => {
    await Promise.all(clients.map((client) => client.close()));
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.once("exit", resolve));
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const origin = `http://127.0.0.1:${port}`;
  const health = await waitForHealth(`${origin}/health`, child);
  assert.deepEqual(health, {
    ok: true,
    service: "juriai-agent-bus",
    protocolVersion: 1,
    projectId: "security-test",
    ready: true,
    authMode: "agent-token",
  });

  const unauthorized = await fetch(`${origin}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
  });
  assert.equal(unauthorized.status, 401);

  const coordinator = await connectClient(`${origin}/mcp`, coordinatorToken, "coordinator");
  const po = await connectClient(`${origin}/mcp`, poToken, "po");
  clients.push(coordinator, po);
  const call = async (client, name, args) =>
    client.callTool({ name, arguments: args });

  for (const [client, agent] of [
    [coordinator, { agentId: "juriai-coordinator", role: "coordinator" }],
    [po, { agentId: "juriai-po", role: "po" }],
  ]) {
    const registered = parseResult(
      await call(client, "register_agent", {
        ...agent,
        provider: "openai",
        model: "test-model",
        capabilities: [],
        status: "idle",
        wakeEnabled: false,
      }),
    );
    assert.equal(registered.agentId, agent.agentId);
  }

  const impersonation = await call(po, "send_message", {
    fromAgent: "juriai-coordinator",
    toAgent: "juriai-po",
    kind: "message",
    body: "spoof",
    metadata: {},
  });
  assert.equal(impersonation.isError, true);

  const forbiddenCreate = await call(po, "create_task", {
    title: "nao autorizado",
    description: "PO nao pode criar",
    createdBy: "juriai-po",
    assignedTo: "juriai-po",
    writeScope: [],
    context: {},
  });
  assert.equal(forbiddenCreate.isError, true);

  const created = parseResult(
    await call(coordinator, "create_task", {
      title: "piloto seguro",
      description: "validar RBAC",
      createdBy: "juriai-coordinator",
      assignedTo: "juriai-po",
      writeScope: [],
      context: {},
    }),
  );
  const claimed = parseResult(
    await call(po, "claim_task", {
      taskId: created.task.taskId,
      agentId: "juriai-po",
      allowConflict: false,
    }),
  );
  assert.equal(claimed.task.status, "in_progress");

  const foreignInbox = await call(po, "read_inbox", {
    agentId: "juriai-coordinator",
    unreadOnly: true,
    markRead: true,
    limit: 10,
  });
  assert.equal(foreignInbox.isError, true);

  const foreignAudit = await call(po, "list_events", { limit: 20 });
  assert.equal(foreignAudit.isError, true);
  const audit = parseResult(await call(coordinator, "list_events", { limit: 50 }));
  assert.ok(audit.some((event) => event.eventType === "authorization.denied"));
});
