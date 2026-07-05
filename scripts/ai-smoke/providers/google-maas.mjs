import {
  EXPECTED_RESPONSE,
  PROBE_PROMPT,
  commandExists,
  fail,
  fetchJson,
  googleVertexHost,
  pass,
  printReport,
  runCommand,
  skip,
} from "../core.mjs";
import { pathToFileURL } from "node:url";

const PROVIDER = "google-maas";

export async function probeGoogleMaas(options) {
  if (!options.execute) {
    return pass(
      PROVIDER,
      "Dry-run validado. Nenhuma chamada ao Google MaaS foi executada.",
      {
        defaultRegion: "global",
        requiredForExecute: ["model"],
        modelFormat: "publisher/model",
      },
    );
  }

  const region = options.region?.trim() || "global";
  const model = resolveModel(options.publisher, options.model);
  const maxTokens = resolveMaxTokens(options.maxTokens);

  if (!model || !model.includes("/")) {
    return fail(
      PROVIDER,
      "Informe --model no formato publisher/model ou combine --publisher com --model.",
    );
  }

  if (!maxTokens) {
    return fail(
      PROVIDER,
      "--max-tokens deve ser um número inteiro positivo de até 262144.",
    );
  }

  const context = getGoogleContext(options.project);
  if (!context.ok) {
    return skip(PROVIDER, context.reason, {
      model,
      region,
      maxTokens,
    });
  }

  const host = googleVertexHost(region);
  const path = [
    "v1",
    "projects",
    encodeURIComponent(context.project),
    "locations",
    encodeURIComponent(region),
    "endpoints",
    "openapi",
    "chat",
    "completions",
  ].join("/");
  const endpoint = `https://${host}/${path}`;

  const response = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: PROBE_PROMPT }],
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  const sanitizedData = sanitizeMaasResponse(response.data);
  const usage = sanitizeUsage(response.data?.usage);
  const details = {
    model,
    region,
    maxTokens,
  };

  if (!response.ok) {
    return classifyMaasError(response, {
      ...details,
      endpoint,
    });
  }

  const message = sanitizedData?.choices?.[0]?.message;
  const text = typeof message?.content === "string" ? message.content.trim() : "";
  const reasoningContentPresent = hasReasoningContent(
    response.data?.choices?.[0]?.message,
  );

  if (!text) {
    if (reasoningContentPresent) {
      return {
        status: "ACCESS_CONFIRMED_NO_FINAL_CONTENT",
        provider: PROVIDER,
        message:
          "Acesso confirmado com HTTP 200, mas o modelo não produziu conteúdo final. Kimi Thinking pode exigir maior orçamento de raciocínio ou parâmetros adicionais.",
        details: {
          ...details,
          httpStatus: response.status,
          reasoningContentPresent: true,
          usage,
        },
      };
    }

    return fail(PROVIDER, "O modelo MaaS respondeu sem choices[0].message.content.", {
      ...details,
      httpStatus: response.status,
      reasoningContentPresent,
      usage,
    });
  }

  if (text !== EXPECTED_RESPONSE) {
    return fail(PROVIDER, "O modelo respondeu, mas não respeitou a resposta esperada do probe.", {
      ...details,
      httpStatus: response.status,
      content: text,
      responseMatched: false,
      reasoningContentPresent,
      usage,
    });
  }

  return pass(PROVIDER, "Modelo Google MaaS acessível e resposta validada.", {
    ...details,
    httpStatus: response.status,
    content: text,
    responseMatched: true,
    reasoningContentPresent,
    usage,
  });
}

function hasReasoningContent(message) {
  return (
    typeof message?.reasoning_content === "string" &&
    message.reasoning_content.trim().length > 0
  );
}

function sanitizeMaasResponse(data) {
  if (!data || typeof data !== "object") return data;
  return sanitizeReasoningFields(data);
}

function sanitizeReasoningFields(value) {
  if (Array.isArray(value)) return value.map(sanitizeReasoningFields);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            !/reasoning_content|reasoningContent|chain[-_]?of[-_]?thought/i.test(
              key,
            ),
        )
        .map(([key, item]) => [key, sanitizeReasoningFields(item)]),
    );
  }

  return value;
}

function sanitizeUsage(usage) {
  if (!usage || typeof usage !== "object") return undefined;
  return {
    promptTokens: numberOrNull(usage.prompt_tokens),
    completionTokens: numberOrNull(usage.completion_tokens),
    totalTokens: numberOrNull(usage.total_tokens),
  };
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function resolveModel(publisher, model) {
  const normalizedModel = model?.trim();
  if (!normalizedModel) return null;
  if (normalizedModel.includes("/")) return normalizedModel;

  const normalizedPublisher = publisher?.trim();
  return normalizedPublisher
    ? `${normalizedPublisher}/${normalizedModel}`
    : normalizedModel;
}

function resolveMaxTokens(value) {
  if (value === undefined || value === null || value === "") return 128;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 262_144
    ? parsed
    : null;
}

function getGoogleContext(explicitProject) {
  if (!commandExists("gcloud")) {
    return {
      ok: false,
      reason: "gcloud não está disponível para obter token OAuth ou ADC.",
    };
  }

  const tokenCommands = [
    {
      source: "gcloud-user",
      args: ["auth", "print-access-token"],
    },
    {
      source: "application-default-credentials",
      args: ["auth", "application-default", "print-access-token"],
    },
  ];

  let accessToken = "";
  let authSource = null;
  for (const candidate of tokenCommands) {
    const tokenResult = runCommand("gcloud", candidate.args, {
      timeoutMs: 15_000,
    });
    const token = tokenResult.stdout.trim();
    if (tokenResult.ok && token) {
      accessToken = token;
      authSource = candidate.source;
      break;
    }
  }

  if (!accessToken) {
    return {
      ok: false,
      reason: "gcloud está disponível, mas não há autenticação de usuário ou ADC válida.",
    };
  }

  let project = explicitProject?.trim();
  if (!project) {
    const projectResult = runCommand(
      "gcloud",
      ["config", "get-value", "project"],
      { timeoutMs: 10_000 },
    );
    const configuredProject = projectResult.stdout.trim();
    if (projectResult.ok && configuredProject && configuredProject !== "(unset)") {
      project = configuredProject;
    }
  }

  if (!project) {
    return {
      ok: false,
      reason: "Nenhum projeto Google foi informado ou configurado no gcloud.",
    };
  }

  return {
    ok: true,
    accessToken,
    project,
    authSource,
  };
}

function classifyMaasError(response, details) {
  const errorMessage = response.errorMessage || "";
  const normalized = errorMessage.toLowerCase();
  const safeDetails = {
    model: details.model,
    region: details.region,
    httpStatus: response.status,
    error: errorMessage || undefined,
  };

  if (response.status === 404) {
    return skip(
      PROVIDER,
      "O endpoint ou modelo MaaS não foi encontrado. Confirme o identificador e habilite o modelo no Model Garden.",
      {
        ...safeDetails,
        endpoint: details.endpoint,
      },
    );
  }

  if (
    normalized.includes("entitlement") ||
    normalized.includes("marketplace") ||
    normalized.includes("model garden") ||
    normalized.includes("consumer procurement") ||
    normalized.includes("needs to be enabled") ||
    normalized.includes("must be enabled")
  ) {
    return skip(
      PROVIDER,
      "O modelo precisa ser habilitado ou aceito no Model Garden para este projeto.",
      safeDetails,
    );
  }

  if (response.status === 401 || response.status === 403) {
    return skip(
      PROVIDER,
      "A chamada foi recusada por autenticação, IAM ou acesso ao modelo MaaS.",
      safeDetails,
    );
  }

  if (response.status === 429) {
    return skip(
      PROVIDER,
      "O modelo MaaS está sem quota disponível para este projeto.",
      safeDetails,
    );
  }

  if (response.timedOut) {
    return fail(PROVIDER, "Timeout ao consultar o endpoint Google MaaS.", safeDetails);
  }

  if (response.status === 400 || response.status === 422) {
    return fail(
      PROVIDER,
      "O endpoint MaaS rejeitou o formato da requisição.",
      safeDetails,
    );
  }

  return fail(PROVIDER, "A chamada ao endpoint Google MaaS falhou.", safeDetails);
}

function parseStandaloneArgs(args) {
  const options = {
    execute: true,
    model: null,
    publisher: null,
    region: "global",
    project: null,
    maxTokens: 128,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    const key = {
      "--model": "model",
      "--publisher": "publisher",
      "--region": "region",
      "--project": "project",
      "--max-tokens": "maxTokens",
    }[argument];
    if (!key) throw new Error(`Argumento desconhecido: ${argument}`);

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`O argumento ${argument} exige um valor.`);
    }

    options[key] = value;
    index += 1;
  }

  return options;
}

function printStandaloneHelp() {
  process.stdout.write(`Google MaaS model probe

Uso:
  node scripts/ai-smoke/providers/google-maas.mjs --model publisher/model

Opções:
  --model MODEL       Identificador completo publisher/model
  --region REGION     Região do endpoint; padrão: global
  --project PROJECT   Projeto Google; padrão: projeto ativo do gcloud
  --max-tokens N      Limite de saída; padrão: 128
  --help              Exibe esta ajuda

Este comando standalone executa uma chamada real com o prompt fixo do probe.
`);
}

const isStandalone =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isStandalone) {
  try {
    const options = parseStandaloneArgs(process.argv.slice(2));
    if (options.help) {
      printStandaloneHelp();
    } else {
      const result = await probeGoogleMaas(options);
      const status = printReport("execute", [result]);
      if (status === "FAIL") process.exitCode = 1;
    }
  } catch (error) {
    const result = fail(
      PROVIDER,
      error instanceof Error ? error.message : "Argumentos inválidos.",
    );
    printReport("execute", [result]);
    process.exitCode = 1;
  }
}
