import {
  EXPECTED_RESPONSE,
  PROBE_PROMPT,
  commandExists,
  fail,
  pass,
  runCommand,
  skip,
} from "../core.mjs";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PROVIDER = "aws-bedrock";
const FORMATS = new Set([
  "anthropic",
  "amazon-nova",
  "amazon-titan",
  "meta",
  "mistral",
  "cohere",
]);

export async function probeAwsBedrock(options) {
  if (!options.execute) {
    return pass(
      PROVIDER,
      "Dry-run validado. Nenhum comando autenticado da AWS foi executado.",
      { requiredForExecute: ["model", "region", "format"] },
    );
  }

  if (!options.model || !options.region || !options.format) {
    return fail(
      PROVIDER,
      "--model, --region e --format são obrigatórios com --execute.",
    );
  }

  if (!FORMATS.has(options.format)) {
    return fail(PROVIDER, `Formato Bedrock inválido. Use: ${[...FORMATS].join(", ")}.`);
  }

  if (!commandExists("aws")) {
    return skip(PROVIDER, "AWS CLI não está disponível no ambiente.");
  }

  const identity = runCommand(
    "aws",
    ["sts", "get-caller-identity", "--output", "json", "--no-cli-pager"],
    { timeoutMs: 20_000 },
  );

  if (!identity.ok) {
    return skip(PROVIDER, "AWS CLI está disponível, mas não há credencial válida.");
  }

  const listing = runCommand(
    "aws",
    [
      "bedrock",
      "list-foundation-models",
      "--region",
      options.region,
      "--output",
      "json",
      "--no-cli-pager",
    ],
    { timeoutMs: 30_000 },
  );

  if (!listing.ok) {
    return classifyAwsCommandError(
      listing,
      "Não foi possível listar os modelos Bedrock na região informada.",
      options,
    );
  }

  let models;
  try {
    const parsed = JSON.parse(listing.stdout);
    models = parsed.modelSummaries?.map((item) => item.modelId).filter(Boolean) || [];
  } catch {
    return fail(PROVIDER, "AWS CLI retornou uma lista de modelos inválida.", {
      model: options.model,
      region: options.region,
    });
  }

  if (!models.includes(options.model)) {
    return skip(PROVIDER, "O modelo não foi encontrado na região Bedrock informada.", {
      model: options.model,
      region: options.region,
    });
  }

  const directory = mkdtempSync(join(tmpdir(), "juriai-ai-smoke-"));
  const requestPath = join(directory, "request.json");
  const responsePath = join(directory, "response.json");

  try {
    writeFileSync(requestPath, JSON.stringify(buildBedrockBody(options.format)), {
      encoding: "utf8",
      mode: 0o600,
    });

    const invocation = runCommand(
      "aws",
      [
        "bedrock-runtime",
        "invoke-model",
        "--region",
        options.region,
        "--model-id",
        options.model,
        "--content-type",
        "application/json",
        "--accept",
        "application/json",
        "--body",
        `fileb://${requestPath}`,
        responsePath,
        "--output",
        "json",
        "--no-cli-pager",
      ],
      { timeoutMs: 90_000 },
    );

    if (!invocation.ok) {
      return classifyAwsCommandError(
        invocation,
        "A invocação do modelo Bedrock falhou.",
        options,
      );
    }

    let response;
    try {
      response = JSON.parse(readFileSync(responsePath, "utf8"));
    } catch {
      return fail(PROVIDER, "O Bedrock retornou uma resposta inválida.", {
        model: options.model,
        region: options.region,
      });
    }

    const text = extractBedrockText(options.format, response)?.trim();
    if (!text) {
      return fail(PROVIDER, "O Bedrock respondeu sem conteúdo de texto reconhecível.", {
        model: options.model,
        region: options.region,
      });
    }

    if (text !== EXPECTED_RESPONSE) {
      return fail(PROVIDER, "O modelo respondeu, mas não respeitou a resposta esperada do probe.", {
        model: options.model,
        region: options.region,
        responseMatched: false,
      });
    }

    return pass(PROVIDER, "Modelo AWS Bedrock acessível e resposta validada.", {
      model: options.model,
      region: options.region,
      responseMatched: true,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function buildBedrockBody(format) {
  switch (format) {
    case "anthropic":
      return {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 128,
        temperature: 0,
        messages: [{ role: "user", content: PROBE_PROMPT }],
      };
    case "amazon-nova":
      return {
        messages: [{ role: "user", content: [{ text: PROBE_PROMPT }] }],
        inferenceConfig: { maxTokens: 128, temperature: 0 },
      };
    case "amazon-titan":
      return {
        inputText: PROBE_PROMPT,
        textGenerationConfig: { maxTokenCount: 128, temperature: 0 },
      };
    case "meta":
      return { prompt: PROBE_PROMPT, max_gen_len: 128, temperature: 0 };
    case "mistral":
      return { prompt: PROBE_PROMPT, max_tokens: 128, temperature: 0 };
    case "cohere":
      return { message: PROBE_PROMPT, max_tokens: 128, temperature: 0 };
  }
}

function extractBedrockText(format, response) {
  switch (format) {
    case "anthropic":
      return response?.content?.find?.((item) => item?.type === "text")?.text;
    case "amazon-nova":
      return response?.output?.message?.content?.[0]?.text;
    case "amazon-titan":
      return response?.results?.[0]?.outputText;
    case "meta":
      return response?.generation;
    case "mistral":
      return response?.outputs?.[0]?.text;
    case "cohere":
      return response?.generations?.[0]?.text || response?.text;
  }
}

function classifyAwsCommandError(command, fallbackMessage, options) {
  const details = {
    model: options.model,
    region: options.region,
  };
  const error = command.stderr.toLowerCase();

  if (command.timedOut) {
    return fail(PROVIDER, "Timeout ao executar o comando da AWS.", details);
  }

  if (
    error.includes("credential") ||
    error.includes("expiredtoken") ||
    error.includes("unrecognizedclient")
  ) {
    return skip(PROVIDER, "A credencial da AWS está ausente, inválida ou expirada.", details);
  }

  if (error.includes("accessdenied") || error.includes("not authorized")) {
    return skip(PROVIDER, "A credencial não tem permissão para acessar o Bedrock.", details);
  }

  if (
    error.includes("resourcenotfound") ||
    error.includes("model access") ||
    error.includes("throttl")
  ) {
    return skip(PROVIDER, "O modelo Bedrock não está acessível ou está sem quota.", details);
  }

  if (error.includes("validationexception")) {
    return fail(PROVIDER, "O Bedrock rejeitou o formato da requisição de smoke test.", details);
  }

  return fail(PROVIDER, fallbackMessage, details);
}
