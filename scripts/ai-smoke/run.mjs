#!/usr/bin/env node

import { fail, printReport } from "./core.mjs";
import { probeAwsBedrock } from "./providers/aws-bedrock.mjs";
import { probeGoogleMaas } from "./providers/google-maas.mjs";
import { probeGoogleVertex } from "./providers/google-vertex.mjs";

const PROVIDERS = {
  "google-vertex": probeGoogleVertex,
  "google-maas": probeGoogleMaas,
  "aws-bedrock": probeAwsBedrock,
};

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const result = fail("runner", error instanceof Error ? error.message : "Argumentos inválidos.");
    printReport("dry-run", [result]);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printHelp();
    return;
  }

  if (options.execute && options.provider === "all") {
    const result = fail(
      "runner",
      "Com --execute, informe exatamente um --provider para evitar chamadas acidentais.",
    );
    printReport("execute", [result]);
    process.exitCode = 1;
    return;
  }

  const selected =
    options.provider === "all"
      ? Object.entries(PROVIDERS)
      : [[options.provider, PROVIDERS[options.provider]]];

  if (!selected[0]?.[1]) {
    const result = fail(
      "runner",
      `Provider inválido. Use: ${Object.keys(PROVIDERS).join(", ")}.`,
    );
    printReport(options.execute ? "execute" : "dry-run", [result]);
    process.exitCode = 1;
    return;
  }

  const results = [];
  for (const [, probe] of selected) {
    results.push(await probe(options));
  }

  const status = printReport(options.execute ? "execute" : "dry-run", results);
  if (status === "FAIL") process.exitCode = 1;
}

function parseArgs(args) {
  const options = {
    execute: false,
    provider: "all",
    project: null,
    publisher: null,
    model: null,
    region: null,
    format: null,
    help: false,
  };
  let sawDryRun = false;
  let sawExecute = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--dry-run") {
      sawDryRun = true;
      continue;
    }
    if (argument === "--execute") {
      sawExecute = true;
      options.execute = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    const key = {
      "--provider": "provider",
      "--project": "project",
      "--publisher": "publisher",
      "--model": "model",
      "--region": "region",
      "--format": "format",
    }[argument];

    if (!key) {
      throw new Error(`Argumento desconhecido: ${argument}`);
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`O argumento ${argument} exige um valor.`);
    }

    options[key] = value;
    index += 1;
  }

  if (sawDryRun && sawExecute) {
    throw new Error("Use --dry-run ou --execute, nunca os dois juntos.");
  }

  return options;
}

function printHelp() {
  process.stdout.write(`JuriAI AI smoke tests

Uso:
  node scripts/ai-smoke/run.mjs [--dry-run]
  node scripts/ai-smoke/run.mjs --provider PROVIDER --execute [opções]

Providers:
  google-vertex
  google-maas
  aws-bedrock

Opções:
  --project ID        Projeto Google opcional; usa o projeto do gcloud se omitido
  --publisher ID      Publisher obrigatório para Google MaaS
  --model ID          Modelo obrigatório em chamadas reais
  --region REGION     Região obrigatória em chamadas reais
  --format FORMAT     Formato obrigatório no Bedrock
  --help              Exibe esta ajuda

O modo padrão é dry-run. Nenhuma chamada real ocorre sem --execute.
`);
}

await main();
