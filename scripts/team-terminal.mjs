import { spawn } from "node:child_process";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, ".agents", "team.json"), "utf8"),
);
const args = process.argv.slice(2);
const roleKey = args.find((argument) => !argument.startsWith("--"));
const dryRun = args.includes("--dry-run");
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const providerAliases = {
  openai: "codex",
  anthropic: "claude",
  google: "gemini",
};
const provider = providerAliases[option("--provider")] ?? option("--provider") ?? "codex";
const model = option("--model");
const providers = {
  codex: { binary: "codex", providerName: "openai" },
  claude: { binary: "claude", providerName: "anthropic" },
  gemini: { binary: "gemini", providerName: "google" },
};
const selectedProvider = providers[provider];
const role = manifest.roles.find((candidate) => candidate.key === roleKey);
const bus = manifest.agentBus;
const busOrigin = `http://${bus.host}:${bus.port}`;
const runtimePath = path.join(
  root,
  "tools",
  "agent-bus",
  "data",
  "runtime",
  "agent-bus.json",
);

if (!role) {
  console.error("Informe um papel valido:");
  for (const candidate of manifest.roles) {
    console.error(`  npm run team:terminal -- ${candidate.key}`);
  }
  process.exit(1);
}

if (!selectedProvider) {
  console.error(`Provedor invalido: ${provider}`);
  console.error("Use --provider codex, --provider claude ou --provider gemini.");
  process.exit(1);
}

try {
  const response = await fetch(`${busOrigin}/health`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const health = await response.json();
  if (
    health.service !== "juriai-agent-bus" ||
    health.projectId !== bus.projectId ||
    health.protocolVersion !== bus.protocolVersion ||
    health.authMode !== "agent-token" ||
    health.ready !== true
  ) {
    throw new Error("servico incompatível ou legado");
  }
} catch (error) {
  console.error(`O JuriAI Agent Bus seguro nao esta acessivel em ${busOrigin}.`);
  console.error("Inicie-o com: npm run team:up");
  console.error(`Detalhe: ${error.message}`);
  process.exit(1);
}

if (!fs.existsSync(runtimePath)) {
  console.error("Agent Bus ativo, mas sem runtime gerenciado; launcher recusado.");
  process.exit(1);
}
const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
const nonce = randomBytes(32).toString("hex");
try {
  const response = await fetch(`${busOrigin}/admin/challenge?nonce=${nonce}`, {
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const challenge = await response.json();
  if (
    challenge.instanceId !== runtime.instanceId ||
    challenge.pid !== runtime.pid ||
    challenge.projectId !== bus.projectId
  ) {
    throw new Error("runtime e servidor divergem");
  }
  const expected = createHmac("sha256", runtime.controlToken)
    .update(
      [nonce, challenge.instanceId, String(challenge.pid), challenge.projectId, challenge.startedAt].join(":"),
      "utf8",
    )
    .digest();
  const received = Buffer.from(String(challenge.signature ?? ""), "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new Error("assinatura HMAC invalida");
  }
} catch (error) {
  console.error(`Ownership do Agent Bus nao comprovado: ${error.message}`);
  process.exit(1);
}

const credentialsPath = path.join(
  root,
  "tools",
  "agent-bus",
  "data",
  "runtime",
  "credentials.json",
);
if (!fs.existsSync(credentialsPath)) {
  console.error("Credenciais da equipe ausentes. Execute: npm run team:bootstrap");
  process.exit(1);
}
const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
const credential = credentials.agents?.[role.agentId];
if (!credential?.token || credential.role !== role.key) {
  console.error(`Credencial invalida ou ausente para ${role.agentId}.`);
  process.exit(1);
}

function claudeMcpConfig() {
  const filename = path.join(
    root,
    "tools",
    "agent-bus",
    "data",
    "runtime",
    `${role.agentId}.claude.mcp.json`,
  );
  fs.writeFileSync(
    filename,
    `${JSON.stringify(
      {
        mcpServers: {
          "juriai-agent-bus": {
            type: "http",
            url: `${busOrigin}/mcp`,
            headers: { Authorization: `Bearer ${credential.token}` },
          },
        },
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );
  fs.chmodSync(filename, 0o600);
  return filename;
}

const prompt = [
  `Inicialize este terminal como ${role.name}.`,
  `Seu agentId estavel e ${role.agentId} e seu papel e ${role.key}.`,
  `Seu provedor e ${selectedProvider.providerName}; registre o nome real do modelo ativo${model ? ` (${model})` : ""}.`,
  `Leia .agents/TEAM.md, .agents/PRODUCT_STATE.md e ${role.roleFile}.`,
  "Leia MOSAIC_SURFACE_ID e MOSAIC_WORKSPACE_ID do ambiente.",
  "Registre-se no MCP juriai-agent-bus, leia o inbox e informe seu estado ao coordenador.",
  "Nao inicie nem altere trabalho sem uma tarefa atribuida e reivindicada.",
].join(" ");

function launchConfiguration() {
  if (provider === "codex") {
    const launchArgs = [
      "-C",
      root,
      "-c",
      "mcp_servers.juriai_agent_bus.required=true",
      "-c",
      'mcp_servers.juriai_agent_bus.bearer_token_env_var="JURIAI_AGENT_BUS_TOKEN"',
    ];
    if (model) launchArgs.push("--model", model);
    launchArgs.push(prompt);
    return { binary: "codex", args: launchArgs };
  }

  if (provider === "claude") {
    const launchArgs = [
      "--mcp-config",
      claudeMcpConfig(),
      "--name",
      role.agentId,
    ];
    if (model) launchArgs.push("--model", model);
    launchArgs.push(prompt);
    return { binary: "claude", args: launchArgs };
  }

  const launchArgs = [
    "--prompt-interactive",
    prompt,
    "--allowed-mcp-server-names",
    "juriai-agent-bus",
  ];
  if (model) launchArgs.push("--model", model);
  return { binary: "gemini", args: launchArgs };
}

const launch = launchConfiguration();

if (dryRun) {
  console.log(`Papel: ${role.name}`);
  console.log(`Agent ID: ${role.agentId}`);
  console.log(`Perfil: ${role.roleFile}`);
  console.log(`Provedor: ${selectedProvider.providerName}`);
  console.log(`CLI: ${launch.binary}`);
  console.log(`Modelo: ${model ?? "padrao do CLI"}`);
  console.log("Agent Bus: conectado");
  console.log(`Launcher: valido (${launch.binary} nao foi iniciado por causa de --dry-run)`);
  process.exit(0);
}

const child = spawn(
  launch.binary,
  launch.args,
  {
    cwd: root,
    env: {
      ...process.env,
      JURIAI_AGENT_ID: role.agentId,
      JURIAI_AGENT_ROLE: role.key,
      JURIAI_AGENT_PROVIDER: selectedProvider.providerName,
      JURIAI_AGENT_MODEL: model ?? "default",
      JURIAI_AGENT_BUS_TOKEN: credential.token,
    },
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error(`Falha ao iniciar ${launch.binary}: ${error.message}`);
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
