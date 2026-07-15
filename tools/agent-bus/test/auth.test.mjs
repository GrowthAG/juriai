import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadAgentCredentials } from "../src/auth.mjs";

function writeCredentials(directory, agents) {
  const filename = path.join(directory, "credentials.json");
  fs.writeFileSync(
    filename,
    JSON.stringify({ schemaVersion: 1, projectId: "allowlist-test", agents }),
    { mode: 0o600 },
  );
  return filename;
}

test("credenciais devem corresponder exatamente a allowlist do manifesto", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "juriai-agent-auth-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const token = "x".repeat(64);
  const allowedAgents = new Map([
    ["juriai-coordinator", "coordinator"],
    ["juriai-po", "po"],
  ]);

  const extraCredential = writeCredentials(directory, {
    "juriai-coordinator": { role: "coordinator", token },
    "juriai-po": { role: "po", token: "p".repeat(64) },
    "juriai-rogue": { role: "fullstack", token: "r".repeat(64) },
  });
  assert.throws(
    () => loadAgentCredentials(extraCredential, "allowlist-test", allowedAgents),
    /Credencial fora da allowlist: juriai-rogue/,
  );

  const missingCredential = writeCredentials(directory, {
    "juriai-coordinator": { role: "coordinator", token },
  });
  assert.throws(
    () => loadAgentCredentials(missingCredential, "allowlist-test", allowedAgents),
    /Credencial obrigatoria ausente: juriai-po/,
  );
});
