import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import fs from "node:fs";

function digest(value) {
  return createHash("sha256").update(String(value)).digest();
}

export function loadAgentCredentials(filename, expectedProjectId, allowedAgents) {
  if (!fs.existsSync(filename)) return null;
  fs.chmodSync(filename, 0o600);
  const document = JSON.parse(fs.readFileSync(filename, "utf8"));
  if (document.schemaVersion !== 1) {
    throw new Error(`Versao de credenciais nao suportada: ${document.schemaVersion}`);
  }
  if (document.projectId !== expectedProjectId) {
    throw new Error(`Credenciais pertencem a outro projeto: ${document.projectId}`);
  }

  const credentials = [];
  for (const [agentId, entry] of Object.entries(document.agents ?? {})) {
    if (!entry?.role || typeof entry.token !== "string" || entry.token.length < 64) {
      throw new Error(`Credencial invalida para ${agentId}`);
    }
    credentials.push({ agentId, role: entry.role, tokenDigest: digest(entry.token) });
  }
  if (!credentials.length) throw new Error("Nenhuma credencial de agente configurada");
  if (allowedAgents) {
    for (const credential of credentials) {
      const expectedRole = allowedAgents.get(credential.agentId);
      if (!expectedRole || expectedRole !== credential.role) {
        throw new Error(`Credencial fora da allowlist: ${credential.agentId}`);
      }
    }
    for (const [agentId, role] of allowedAgents) {
      if (!credentials.some((credential) => credential.agentId === agentId && credential.role === role)) {
        throw new Error(`Credencial obrigatoria ausente: ${agentId}`);
      }
    }
  }
  return credentials;
}

export function authenticateBearer(authorization, credentials) {
  if (!credentials?.length || !authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7);
  if (!token) return null;
  const received = digest(token);
  for (const credential of credentials) {
    if (timingSafeEqual(received, credential.tokenDigest)) {
      return { agentId: credential.agentId, role: credential.role };
    }
  }
  return null;
}

export function safeSecretEqual(received, expected) {
  if (!received || !expected) return false;
  return timingSafeEqual(digest(received), digest(expected));
}

export function signControlChallenge(secret, values) {
  return createHmac("sha256", secret).update(values.join(":"), "utf8").digest("hex");
}

export function securePath(filename, mode) {
  if (fs.existsSync(filename)) fs.chmodSync(filename, mode);
}
