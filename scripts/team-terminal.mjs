import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "team.json"), "utf8"),
);
const roleKey = process.argv[2];
const role = manifest.roles.find((candidate) => candidate.key === roleKey);

if (!role) {
  console.error("Informe um papel valido:");
  for (const candidate of manifest.roles) {
    console.error(`  npm run team:terminal -- ${candidate.key}`);
  }
  process.exit(1);
}

try {
  const response = await fetch("http://127.0.0.1:8765/health", {
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch (error) {
  console.error("O JuriAI Agent Bus nao esta acessivel em 127.0.0.1:8765.");
  console.error("Inicie-o em outro terminal com: npm run team:bus");
  console.error(`Detalhe: ${error.message}`);
  process.exit(1);
}

const prompt = [
  `Inicialize este terminal como ${role.name}.`,
  `Seu agentId estavel e ${role.agentId} e seu papel e ${role.key}.`,
  `Leia .agents/TEAM.md, .agents/PRODUCT_STATE.md e ${role.roleFile}.`,
  "Leia MOSAIC_SURFACE_ID e MOSAIC_WORKSPACE_ID do ambiente.",
  "Registre-se no MCP juriai-agent-bus, leia o inbox e informe seu estado ao coordenador.",
  "Nao inicie nem altere trabalho sem uma tarefa atribuida e reivindicada.",
].join(" ");

const child = spawn(
  "codex",
  [
    "-C",
    root,
    "-c",
    "mcp_servers.juriai_agent_bus.required=true",
    prompt,
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      JURIAI_AGENT_ID: role.agentId,
      JURIAI_AGENT_ROLE: role.key,
    },
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error(`Falha ao iniciar Codex: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Codex encerrado pelo sinal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 0;
});
