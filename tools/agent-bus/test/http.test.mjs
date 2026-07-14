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
  const address = server.address();
  const port = address.port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForHealth(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Agent Bus encerrou com codigo ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // The child process may still be binding the port.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Agent Bus nao respondeu ao health check");
}

function parseResult(result) {
  const item = result.content.find((content) => content.type === "text");
  assert.ok(item, "resultado MCP deve conter texto");
  return JSON.parse(item.text);
}

test("HTTP MCP conecta coordenador e PO com mensagem e confirmacao", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "juriai-agent-bus-http-"));
  const port = await freePort();
  const child = spawn(process.execPath, ["src/server.mjs"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      JURIAI_AGENT_BUS_PORT: String(port),
      JURIAI_AGENT_BUS_DB: path.join(directory, "test.sqlite"),
      JURIAI_MOSAIC_WAKE: "0",
    },
    stdio: "ignore",
  });

  let client;
  t.after(async () => {
    await client?.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const health = await waitForHealth(`http://127.0.0.1:${port}/health`, child);
  assert.equal(health.ok, true);

  client = new Client({ name: "juriai-agent-bus-test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL(`http://127.0.0.1:${port}/mcp`),
  );
  await client.connect(transport);

  const call = async (name, args) =>
    parseResult(await client.callTool({ name, arguments: args }));

  for (const agent of [
    { agentId: "juriai-coordinator", role: "coordinator" },
    { agentId: "juriai-po", role: "po" },
  ]) {
    const registered = await call("register_agent", {
      ...agent,
      provider: "openai",
      model: "test-model",
      capabilities: [],
      status: "idle",
      wakeEnabled: false,
    });
    assert.equal(registered.agentId, agent.agentId);
  }

  const sent = await call("send_message", {
    fromAgent: "juriai-coordinator",
    toAgent: "juriai-po",
    kind: "question",
    body: "PING EQUIPE JURIAI",
    metadata: { smoke: true },
  });
  const inbox = await call("read_inbox", {
    agentId: "juriai-po",
    unreadOnly: true,
    markRead: true,
    limit: 10,
  });
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].body, "PING EQUIPE JURIAI");
  assert.equal(inbox[0].fromAgent, "juriai-coordinator");

  const acknowledged = await call("acknowledge_message", {
    messageId: sent.message.messageId,
    agentId: "juriai-po",
  });
  assert.ok(acknowledged.acknowledgedAt);
});
