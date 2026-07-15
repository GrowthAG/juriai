import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MosaicNotifier } from "../src/mosaic.mjs";
import { AgentBusStore, internals } from "../src/store.mjs";

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "juriai-agent-bus-"));
  const store = new AgentBusStore(path.join(directory, "test.sqlite"));
  t.after(() => {
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  store.registerAgent({
    agentId: "coordinator",
    provider: "openai",
    model: "gpt-5",
    role: "coordinator",
    capabilities: ["planning"],
  });
  store.registerAgent({
    agentId: "implementer",
    provider: "anthropic",
    model: "claude-sonnet",
    role: "implementation",
    capabilities: ["code"],
  });
  store.registerAgent({
    agentId: "reviewer",
    provider: "google",
    model: "gemini-pro",
    role: "review",
    capabilities: ["review"],
  });
  return store;
}

test("registra agentes de provedores diferentes e atualiza presença", (t) => {
  const store = fixture(t);
  assert.equal(store.listAgents().length, 3);
  assert.equal(store.getAgent("implementer").provider, "anthropic");

  const updated = store.heartbeat("reviewer", "working");
  assert.equal(updated.status, "working");
});

test("cria, entrega, assume e conclui uma tarefa", (t) => {
  const store = fixture(t);
  const task = store.createTask({
    title: "Implementar endpoint",
    description: "Criar o endpoint e os testes.",
    createdBy: "coordinator",
    assignedTo: "implementer",
    writeScope: ["app/api/cases", "lib/cases.ts"],
    context: { acceptance: ["status 200"] },
  });

  assert.equal(task.status, "assigned");
  const inbox = store.readInbox({ agentId: "implementer" });
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].taskId, task.taskId);
  assert.ok(inbox[0].readAt);

  const claimed = store.claimTask({ taskId: task.taskId, agentId: "implementer" });
  assert.equal(claimed.task.status, "in_progress");

  const completed = store.updateTaskStatus({
    taskId: task.taskId,
    agentId: "implementer",
    status: "completed",
    result: { files: ["app/api/cases/route.ts"], tests: "passed" },
  });
  assert.equal(completed.status, "completed");
  assert.equal(completed.result.tests, "passed");
  assert.equal(store.getAgent("implementer").status, "idle");
});

test("handoff passa propriedade e contexto para outro modelo", (t) => {
  const store = fixture(t);
  const task = store.createTask({
    title: "Revisar autorização",
    description: "Implemente e passe para revisão.",
    createdBy: "coordinator",
    assignedTo: "implementer",
    writeScope: ["lib/auth"],
  });
  store.claimTask({ taskId: task.taskId, agentId: "implementer" });

  const handoff = store.handoffTask({
    taskId: task.taskId,
    fromAgent: "implementer",
    toAgent: "reviewer",
    note: "Implementação pronta; revise a validação de tenant.",
  });

  assert.equal(handoff.task.assignedTo, "reviewer");
  assert.equal(handoff.task.status, "assigned");
  const messages = store.readInbox({ agentId: "reviewer", unreadOnly: false });
  assert.ok(messages.some((message) => message.kind === "handoff"));
  assert.ok(messages.some((message) => message.body.includes("tenant")));
});

test("impede dois agentes de assumirem escopos de escrita sobrepostos", (t) => {
  const store = fixture(t);
  const first = store.createTask({
    title: "Alterar rotas",
    description: "Primeira alteração.",
    createdBy: "coordinator",
    assignedTo: "implementer",
    writeScope: ["app/api"],
  });
  store.claimTask({ taskId: first.taskId, agentId: "implementer" });

  const second = store.createTask({
    title: "Alterar casos",
    description: "Segunda alteração.",
    createdBy: "coordinator",
    assignedTo: "reviewer",
    writeScope: ["app/api/cases"],
  });
  assert.throws(
    () => store.claimTask({ taskId: second.taskId, agentId: "reviewer" }),
    /Conflito de escopo de escrita/,
  );
});

test("normaliza escopos e bloqueia caminhos fora do projeto", () => {
  assert.equal(internals.normalizeScope("./app/api/"), "app/api");
  assert.equal(internals.scopesOverlap("app/api", "app/api/cases"), true);
  assert.throws(() => internals.normalizeScope("../secrets"), /inválido/);
});

test("notificador não toca no terminal quando o wake global está desligado", async () => {
  const notifier = new MosaicNotifier({ enabled: false });
  const response = await notifier.wake(
    { agentId: "reviewer", surfaceId: "surface-1", status: "idle", wakeEnabled: true },
    "nova mensagem",
  );
  assert.deepEqual(response, { sent: false, reason: "wake_disabled_globally" });
});

test("presenca expira pelo TTL e volta com heartbeat", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "juriai-agent-presence-"));
  let currentTime = Date.parse("2026-07-14T12:00:00.000Z");
  const store = new AgentBusStore(path.join(directory, "test.sqlite"), {
    clock: () => currentTime,
    presenceTtlSeconds: 300,
  });
  t.after(() => {
    store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  store.registerAgent({
    agentId: "presence-agent",
    provider: "openai",
    model: "test",
    role: "po",
    status: "idle",
  });
  assert.equal(store.getAgent("presence-agent").status, "idle");
  assert.equal(store.getAgent("presence-agent").stale, false);

  currentTime += 301_000;
  const expired = store.getAgent("presence-agent");
  assert.equal(expired.status, "offline");
  assert.equal(expired.reportedStatus, "idle");
  assert.equal(expired.stale, true);

  const touched = store.touchPresence("presence-agent");
  assert.equal(touched.status, "idle");
  assert.equal(touched.stale, false);

  currentTime += 301_000;
  const renewed = store.heartbeat("presence-agent", "idle");
  assert.equal(renewed.status, "idle");
  assert.equal(renewed.stale, false);
});

test("papel registrado e imutavel e auditoria pode ser consultada", (t) => {
  const store = fixture(t);
  assert.throws(
    () =>
      store.registerAgent({
        agentId: "coordinator",
        provider: "openai",
        model: "test",
        role: "attacker",
      }),
    /Papel imutavel/,
  );
  const events = store.listEvents({ actorAgent: "coordinator", limit: 20 });
  assert.ok(events.some((event) => event.eventType === "agent.registered"));
});
