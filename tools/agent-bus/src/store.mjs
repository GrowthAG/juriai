import { randomUUID } from "node:crypto";
import path from "node:path";

import Database from "better-sqlite3";

const ACTIVE_TASK_STATUSES = ["assigned", "in_progress", "blocked"];
const TASK_STATUSES = new Set([
  "pending",
  "assigned",
  "in_progress",
  "blocked",
  "completed",
  "failed",
  "cancelled",
]);
const AGENT_STATUSES = new Set(["idle", "working", "waiting", "offline"]);

function stringify(value, fallback) {
  return JSON.stringify(value ?? fallback);
}

function parse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeScope(scope) {
  const normalized = path.posix
    .normalize(String(scope).replaceAll("\\", "/"))
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\/$/, "");

  if (!normalized || normalized === ".") return "*";
  if (normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Escopo de escrita inválido: ${scope}`);
  }
  return normalized;
}

function scopesOverlap(left, right) {
  if (left === "*" || right === "*") return true;
  return (
    left === right ||
    left.startsWith(`${right}/`) ||
    right.startsWith(`${left}/`)
  );
}

function mapAgent(row) {
  if (!row) return null;
  return {
    agentId: row.id,
    provider: row.provider,
    model: row.model,
    role: row.role,
    surfaceId: row.surface_id,
    workspaceId: row.workspace_id,
    cwd: row.cwd,
    capabilities: parse(row.capabilities_json, []),
    status: row.status,
    wakeEnabled: Boolean(row.wake_enabled),
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTask(row) {
  if (!row) return null;
  return {
    taskId: row.id,
    title: row.title,
    description: row.description,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    status: row.status,
    priority: row.priority,
    parentTaskId: row.parent_task_id,
    writeScope: parse(row.write_scope_json, []),
    context: parse(row.context_json, {}),
    result: parse(row.result_json, null),
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    claimedAt: row.claimed_at,
    completedAt: row.completed_at,
  };
}

function mapMessage(row) {
  if (!row) return null;
  return {
    messageId: row.id,
    fromAgent: row.from_agent,
    toAgent: row.to_agent,
    taskId: row.task_id,
    kind: row.kind,
    body: row.body,
    metadata: parse(row.metadata_json, {}),
    readAt: row.read_at,
    acknowledgedAt: row.acknowledged_at,
    createdAt: row.created_at,
  };
}

function mapEvent(row) {
  if (!row) return null;
  return {
    eventId: row.id,
    eventType: row.event_type,
    actorAgent: row.actor_agent,
    taskId: row.task_id,
    payload: parse(row.payload_json, {}),
    createdAt: row.created_at,
  };
}

function effectivePresence(agent, { nowMs, staleAfterSeconds }) {
  if (!agent) return null;
  const ageMs = Math.max(0, nowMs - Date.parse(agent.lastSeenAt));
  const stale = agent.status !== "offline" && ageMs > staleAfterSeconds * 1000;
  return {
    ...agent,
    reportedStatus: agent.status,
    status: stale ? "offline" : agent.status,
    stale,
  };
}

export class AgentBusStore {
  constructor(filename, { clock = Date.now, presenceTtlSeconds = 300 } = {}) {
    this.clock = clock;
    this.presenceTtlSeconds = presenceTtlSeconds;
    this.db = new Database(filename);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.migrate();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        role TEXT NOT NULL,
        surface_id TEXT,
        workspace_id TEXT,
        cwd TEXT,
        capabilities_json TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'idle',
        wake_enabled INTEGER NOT NULL DEFAULT 0,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES agents(id),
        assigned_to TEXT REFERENCES agents(id),
        status TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 0,
        parent_task_id TEXT REFERENCES tasks(id),
        write_scope_json TEXT NOT NULL DEFAULT '[]',
        context_json TEXT NOT NULL DEFAULT '{}',
        result_json TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        claimed_at TEXT,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        from_agent TEXT NOT NULL REFERENCES agents(id),
        to_agent TEXT NOT NULL REFERENCES agents(id),
        task_id TEXT REFERENCES tasks(id),
        kind TEXT NOT NULL,
        body TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        read_at TEXT,
        acknowledged_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        actor_agent TEXT,
        task_id TEXT,
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status
        ON tasks(assigned_to, status, updated_at);
      CREATE INDEX IF NOT EXISTS idx_messages_inbox
        ON messages(to_agent, read_at, created_at);
      CREATE INDEX IF NOT EXISTS idx_events_task
        ON events(task_id, created_at);
    `);
  }

  close() {
    this.db.close();
  }

  timestamp() {
    return new Date(this.clock()).toISOString();
  }

  ping() {
    return this.db.prepare("SELECT 1 AS ok").get().ok === 1;
  }

  event(eventType, actorAgent, taskId, payload = {}) {
    this.db
      .prepare(`
        INSERT INTO events(event_type, actor_agent, task_id, payload_json, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        eventType,
        actorAgent ?? null,
        taskId ?? null,
        stringify(payload, {}),
        this.timestamp(),
      );
  }

  listEvents({ actorAgent, taskId, eventType, limit = 100 } = {}) {
    const conditions = [];
    const values = [];
    if (actorAgent) {
      conditions.push("actor_agent = ?");
      values.push(actorAgent);
    }
    if (taskId) {
      conditions.push("task_id = ?");
      values.push(taskId);
    }
    if (eventType) {
      conditions.push("event_type = ?");
      values.push(eventType);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(Math.min(Math.max(limit, 1), 500));
    return this.db
      .prepare(`SELECT * FROM events ${where} ORDER BY id DESC LIMIT ?`)
      .all(...values)
      .map(mapEvent);
  }

  requireAgent(agentId) {
    const agent = this.getAgent(agentId);
    if (!agent) throw new Error(`Agente não registrado: ${agentId}`);
    return agent;
  }

  requireTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) throw new Error(`Tarefa não encontrada: ${taskId}`);
    return task;
  }

  registerAgent(input) {
    const current = this.getAgent(input.agentId);
    if (current && current.role !== input.role) {
      throw new Error(
        `Papel imutavel para ${input.agentId}: esperado ${current.role}, recebido ${input.role}`,
      );
    }
    const timestamp = this.timestamp();
    const status = input.status ?? "idle";
    if (!AGENT_STATUSES.has(status)) {
      throw new Error(`Status de agente inválido: ${status}`);
    }

    this.db
      .prepare(`
        INSERT INTO agents(
          id, provider, model, role, surface_id, workspace_id, cwd,
          capabilities_json, status, wake_enabled, last_seen_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          provider = excluded.provider,
          model = excluded.model,
          role = excluded.role,
          surface_id = excluded.surface_id,
          workspace_id = excluded.workspace_id,
          cwd = excluded.cwd,
          capabilities_json = excluded.capabilities_json,
          status = excluded.status,
          wake_enabled = excluded.wake_enabled,
          last_seen_at = excluded.last_seen_at,
          updated_at = excluded.updated_at
      `)
      .run(
        input.agentId,
        input.provider,
        input.model,
        input.role,
        input.surfaceId ?? null,
        input.workspaceId ?? null,
        input.cwd ?? null,
        stringify(input.capabilities, []),
        status,
        input.wakeEnabled ? 1 : 0,
        timestamp,
        timestamp,
        timestamp,
      );

    this.event("agent.registered", input.agentId, null, {
      provider: input.provider,
      model: input.model,
      surfaceId: input.surfaceId ?? null,
    });
    return this.getAgent(input.agentId);
  }

  getAgent(agentId) {
    return effectivePresence(
      mapAgent(this.db.prepare("SELECT * FROM agents WHERE id = ?").get(agentId)),
      { nowMs: this.clock(), staleAfterSeconds: this.presenceTtlSeconds },
    );
  }

  listAgents({ workspaceId, includeOffline = true } = {}) {
    const conditions = [];
    const values = [];
    if (workspaceId) {
      conditions.push("workspace_id = ?");
      values.push(workspaceId);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const agents = this.db
      .prepare(`SELECT * FROM agents ${where} ORDER BY updated_at DESC`)
      .all(...values)
      .map(mapAgent)
      .map((agent) =>
        effectivePresence(agent, {
          nowMs: this.clock(),
          staleAfterSeconds: this.presenceTtlSeconds,
        }),
      );
    return includeOffline ? agents : agents.filter((agent) => agent.status !== "offline");
  }

  heartbeat(agentId, status = "idle") {
    this.requireAgent(agentId);
    if (!AGENT_STATUSES.has(status)) {
      throw new Error(`Status de agente inválido: ${status}`);
    }
    const timestamp = this.timestamp();
    this.db
      .prepare("UPDATE agents SET status = ?, last_seen_at = ?, updated_at = ? WHERE id = ?")
      .run(status, timestamp, timestamp, agentId);
    this.event("agent.heartbeat", agentId, null, { status });
    return this.getAgent(agentId);
  }

  touchPresence(agentId) {
    this.requireAgent(agentId);
    const timestamp = this.timestamp();
    this.db
      .prepare("UPDATE agents SET last_seen_at = ?, updated_at = ? WHERE id = ?")
      .run(timestamp, timestamp, agentId);
    return this.getAgent(agentId);
  }

  createTask(input) {
    this.requireAgent(input.createdBy);
    if (input.assignedTo) this.requireAgent(input.assignedTo);
    if (input.parentTaskId) this.requireTask(input.parentTaskId);

    const taskId = input.taskId ?? randomUUID();
    const timestamp = this.timestamp();
    const writeScope = (input.writeScope ?? []).map(normalizeScope);
    const status = input.assignedTo ? "assigned" : "pending";
    this.db
      .prepare(`
        INSERT INTO tasks(
          id, title, description, created_by, assigned_to, status, priority,
          parent_task_id, write_scope_json, context_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        taskId,
        input.title,
        input.description,
        input.createdBy,
        input.assignedTo ?? null,
        status,
        input.priority ?? 0,
        input.parentTaskId ?? null,
        stringify(writeScope, []),
        stringify(input.context, {}),
        timestamp,
        timestamp,
      );
    this.event("task.created", input.createdBy, taskId, {
      assignedTo: input.assignedTo ?? null,
      writeScope,
    });
    if (input.assignedTo) {
      this.insertMessage({
        fromAgent: input.createdBy,
        toAgent: input.assignedTo,
        taskId,
        kind: "task",
        body: `Nova tarefa: ${input.title}`,
      });
    }
    return this.getTask(taskId);
  }

  getTask(taskId) {
    return mapTask(this.db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId));
  }

  listTasks({ agentId, status, limit = 50 } = {}) {
    const conditions = [];
    const values = [];
    if (agentId) {
      this.requireAgent(agentId);
      conditions.push("(assigned_to = ? OR created_by = ?)");
      values.push(agentId, agentId);
    }
    if (status) {
      if (!TASK_STATUSES.has(status)) throw new Error(`Status de tarefa inválido: ${status}`);
      conditions.push("status = ?");
      values.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(Math.min(Math.max(limit, 1), 200));
    return this.db
      .prepare(`SELECT * FROM tasks ${where} ORDER BY priority DESC, updated_at DESC LIMIT ?`)
      .all(...values)
      .map(mapTask);
  }

  findWriteScopeConflicts(taskId, agentId) {
    const task = this.requireTask(taskId);
    if (!task.writeScope.length) return [];
    const placeholders = ACTIVE_TASK_STATUSES.map(() => "?").join(", ");
    return this.db
      .prepare(`
        SELECT * FROM tasks
        WHERE id != ?
          AND assigned_to IS NOT NULL
          AND assigned_to != ?
          AND status IN (${placeholders})
      `)
      .all(taskId, agentId, ...ACTIVE_TASK_STATUSES)
      .map(mapTask)
      .filter((candidate) =>
        task.writeScope.some((left) =>
          candidate.writeScope.some((right) => scopesOverlap(left, right)),
        ),
      )
      .map((candidate) => ({
        taskId: candidate.taskId,
        assignedTo: candidate.assignedTo,
        writeScope: candidate.writeScope,
      }));
  }

  assignTask({ taskId, fromAgent, toAgent, allowConflict = false, suppressMessage = false }) {
    this.requireAgent(fromAgent);
    this.requireAgent(toAgent);
    const task = this.requireTask(taskId);
    if (["completed", "failed", "cancelled"].includes(task.status)) {
      throw new Error(`Tarefa ${taskId} já está encerrada com status ${task.status}`);
    }
    if (task.createdBy !== fromAgent && task.assignedTo !== fromAgent) {
      throw new Error(`${fromAgent} não pode reatribuir a tarefa ${taskId}`);
    }
    const conflicts = this.findWriteScopeConflicts(taskId, toAgent);
    if (conflicts.length && !allowConflict) {
      throw new Error(`Conflito de escopo de escrita: ${JSON.stringify(conflicts)}`);
    }

    this.db
      .prepare("UPDATE tasks SET assigned_to = ?, status = 'assigned', updated_at = ? WHERE id = ?")
      .run(toAgent, this.timestamp(), taskId);
    this.event("task.assigned", fromAgent, taskId, { toAgent, conflicts });
    if (!suppressMessage) {
      this.insertMessage({
        fromAgent,
        toAgent,
        taskId,
        kind: "task",
        body: `Tarefa atribuída: ${task.title}`,
        metadata: { conflicts },
      });
    }
    return this.getTask(taskId);
  }

  claimTask({ taskId, agentId, allowConflict = false }) {
    this.requireAgent(agentId);
    const claim = this.db.transaction(() => {
      const task = this.requireTask(taskId);
      if (!["pending", "assigned", "blocked"].includes(task.status)) {
        throw new Error(`A tarefa ${taskId} não pode ser assumida no status ${task.status}`);
      }
      if (task.assignedTo && task.assignedTo !== agentId) {
        throw new Error(`A tarefa ${taskId} está atribuída a ${task.assignedTo}`);
      }
      const conflicts = this.findWriteScopeConflicts(taskId, agentId);
      if (conflicts.length && !allowConflict) {
        throw new Error(`Conflito de escopo de escrita: ${JSON.stringify(conflicts)}`);
      }
      const timestamp = this.timestamp();
      this.db
        .prepare(`
          UPDATE tasks
          SET assigned_to = ?, status = 'in_progress', claimed_at = ?, updated_at = ?
          WHERE id = ?
        `)
        .run(agentId, timestamp, timestamp, taskId);
      this.heartbeat(agentId, "working");
      this.event("task.claimed", agentId, taskId, { conflicts });
      return { task: this.getTask(taskId), conflicts };
    });
    return claim();
  }

  handoffTask({ taskId, fromAgent, toAgent, note, allowConflict = false }) {
    const task = this.assignTask({
      taskId,
      fromAgent,
      toAgent,
      allowConflict,
      suppressMessage: true,
    });
    const message = this.insertMessage({
      fromAgent,
      toAgent,
      taskId,
      kind: "handoff",
      body: note,
    });
    this.heartbeat(fromAgent, "idle");
    this.event("task.handed_off", fromAgent, taskId, {
      toAgent,
      noteLength: note.length,
    });
    return { task, message };
  }

  updateTaskStatus({ taskId, agentId, status, result, error }) {
    if (!TASK_STATUSES.has(status)) throw new Error(`Status de tarefa inválido: ${status}`);
    this.requireAgent(agentId);
    const task = this.requireTask(taskId);
    if (task.assignedTo !== agentId && task.createdBy !== agentId) {
      throw new Error(`${agentId} não pode atualizar a tarefa ${taskId}`);
    }
    const terminal = ["completed", "failed", "cancelled"].includes(status);
    const timestamp = this.timestamp();
    this.db
      .prepare(`
        UPDATE tasks
        SET status = ?, result_json = ?, error = ?, completed_at = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        status,
        result === undefined ? task.result && stringify(task.result, null) : stringify(result, null),
        error ?? null,
        terminal ? timestamp : null,
        timestamp,
        taskId,
      );
    if (terminal) this.heartbeat(agentId, "idle");
    this.event(`task.${status}`, agentId, taskId, {
      hasResult: result !== undefined,
      hasError: Boolean(error),
    });
    return this.getTask(taskId);
  }

  reportBlocker({ taskId, agentId, toAgent, blocker }) {
    const task = this.updateTaskStatus({ taskId, agentId, status: "blocked", error: blocker });
    const recipient = toAgent ?? task.createdBy;
    const message = this.insertMessage({
      fromAgent: agentId,
      toAgent: recipient,
      taskId,
      kind: "blocker",
      body: blocker,
    });
    this.heartbeat(agentId, "waiting");
    return { task, message };
  }

  insertMessage(input) {
    const messageId = input.messageId ?? randomUUID();
    this.db
      .prepare(`
        INSERT INTO messages(
          id, from_agent, to_agent, task_id, kind, body, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        messageId,
        input.fromAgent,
        input.toAgent,
        input.taskId ?? null,
        input.kind ?? "message",
        input.body,
        stringify(input.metadata, {}),
        this.timestamp(),
      );
    this.event("message.sent", input.fromAgent, input.taskId, {
      messageId,
      toAgent: input.toAgent,
      kind: input.kind ?? "message",
    });
    return this.getMessage(messageId);
  }

  sendMessage(input) {
    this.requireAgent(input.fromAgent);
    this.requireAgent(input.toAgent);
    if (input.taskId) this.requireTask(input.taskId);
    return this.insertMessage(input);
  }

  getMessage(messageId) {
    return mapMessage(this.db.prepare("SELECT * FROM messages WHERE id = ?").get(messageId));
  }

  readInbox({ agentId, unreadOnly = true, markRead = true, limit = 50 }) {
    this.requireAgent(agentId);
    const unread = unreadOnly ? "AND read_at IS NULL" : "";
    const messages = this.db
      .prepare(`
        SELECT * FROM messages
        WHERE to_agent = ? ${unread}
        ORDER BY created_at ASC
        LIMIT ?
      `)
      .all(agentId, Math.min(Math.max(limit, 1), 200))
      .map(mapMessage);

    if (markRead && messages.length) {
      const timestamp = this.timestamp();
      const update = this.db.prepare("UPDATE messages SET read_at = ? WHERE id = ? AND read_at IS NULL");
      const mark = this.db.transaction((items) => {
        for (const message of items) update.run(timestamp, message.messageId);
      });
      mark(messages);
      for (const message of messages) message.readAt ??= timestamp;
    }
    this.heartbeat(agentId, "working");
    this.event("inbox.read", agentId, null, {
      count: messages.length,
      messageIds: messages.map((message) => message.messageId),
    });
    return messages;
  }

  acknowledgeMessage({ messageId, agentId }) {
    this.requireAgent(agentId);
    const message = this.getMessage(messageId);
    if (!message) throw new Error(`Mensagem não encontrada: ${messageId}`);
    if (message.toAgent !== agentId) throw new Error(`${agentId} não é o destinatário da mensagem`);
    const timestamp = this.timestamp();
    this.db
      .prepare(`
        UPDATE messages
        SET read_at = COALESCE(read_at, ?), acknowledged_at = ?
        WHERE id = ?
      `)
      .run(timestamp, timestamp, messageId);
    this.event("message.acknowledged", agentId, message.taskId, { messageId });
    return this.getMessage(messageId);
  }

  cancelTask({ taskId, agentId, reason }) {
    return this.updateTaskStatus({
      taskId,
      agentId,
      status: "cancelled",
      error: reason ?? "Cancelada pelo coordenador",
    });
  }
}

export const internals = { effectivePresence, normalizeScope, scopesOverlap };
