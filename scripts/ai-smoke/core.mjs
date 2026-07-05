import { spawnSync } from "node:child_process";

export const PROBE_PROMPT = "Responda apenas: JuriAI model probe OK";
export const EXPECTED_RESPONSE = "JuriAI model probe OK";

const SECRET_PATTERNS = [
  /\bBearer\s+\S+/gi,
  /\bya29\.[A-Za-z0-9._-]+/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bASIA[A-Z0-9]{16}\b/g,
  /\b(?:access|identity|session|refresh)[_-]?token\b\s*[:=]\s*\S+/gi,
  /\b(?:secret|password|authorization|cookie)\b\s*[:=]\s*\S+/gi,
];

export function sanitizeMessage(value, fallback = "Erro não detalhado.") {
  let message = typeof value === "string" ? value : fallback;

  for (const pattern of SECRET_PATTERNS) {
    message = message.replace(pattern, "[REDACTED]");
  }

  return message.replace(/\s+/g, " ").trim().slice(0, 320) || fallback;
}

export function pass(provider, message, details = {}) {
  return result("PASS", provider, message, details);
}

export function skip(provider, message, details = {}) {
  return result("SKIP", provider, message, details);
}

export function fail(provider, message, details = {}) {
  return result("FAIL", provider, message, details);
}

function result(status, provider, message, details) {
  return {
    status,
    provider,
    message: sanitizeMessage(message),
    details: sanitizeDetails(details),
  };
}

function sanitizeDetails(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeDetails);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            !/(token|secret|password|cookie|authorization|header|payload|reasoning_content|reasoningContent|chain[-_]?of[-_]?thought|raw|response|data)/i.test(
              key,
            ),
        )
        .map(([key, item]) => [key, sanitizeDetails(item)]),
    );
  }

  return typeof value === "string" ? sanitizeMessage(value, "") : value;
}

export function commandExists(command) {
  const check = spawnSync(command, ["--version"], {
    encoding: "utf8",
    stdio: ["ignore", "ignore", "ignore"],
    timeout: 5_000,
  });

  return !check.error || check.error.code !== "ENOENT";
}

export function runCommand(command, args, { timeoutMs = 20_000 } = {}) {
  const execution = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
    env: process.env,
  });

  return {
    ok: execution.status === 0 && !execution.error,
    status: execution.status,
    timedOut: execution.error?.code === "ETIMEDOUT",
    unavailable: execution.error?.code === "ENOENT",
    stdout: execution.stdout || "",
    stderr: sanitizeMessage(execution.stderr || execution.error?.message || "", ""),
  };
}

export function getGcloudContext(explicitProject) {
  if (!commandExists("gcloud")) {
    return {
      ok: false,
      reason: "gcloud não está disponível no ambiente.",
    };
  }

  const tokenResult = runCommand("gcloud", ["auth", "print-access-token"], {
    timeoutMs: 15_000,
  });
  const accessToken = tokenResult.stdout.trim();

  if (!tokenResult.ok || !accessToken) {
    return {
      ok: false,
      reason: "gcloud está disponível, mas não há autenticação válida.",
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

  return { ok: true, accessToken, project };
}

export function googleVertexHost(region) {
  if (region === "global") return "aiplatform.googleapis.com";
  if (region === "us") return "aiplatform.us.rep.googleapis.com";
  if (region === "eu") return "aiplatform.eu.rep.googleapis.com";
  return `${region}-aiplatform.googleapis.com`;
}

export async function fetchJson(url, init, { timeoutMs = 60_000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    const errorMessage =
      data?.error?.message ||
      data?.message ||
      (response.ok ? null : `A fonte respondeu com HTTP ${response.status}.`);

    return {
      ok: response.ok,
      status: response.status,
      data,
      errorMessage: errorMessage ? sanitizeMessage(errorMessage) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        status: null,
        data: null,
        timedOut: true,
        errorMessage: "A chamada excedeu o tempo limite.",
      };
    }

    return {
      ok: false,
      status: null,
      data: null,
      timedOut: false,
      errorMessage: "Não foi possível conectar ao provedor.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function classifyGoogleError(provider, response, details) {
  if (response.timedOut) {
    return fail(provider, "Timeout ao consultar o Google Vertex.", details);
  }

  if (response.status === 401) {
    return skip(provider, "A credencial do gcloud foi rejeitada.", {
      ...details,
      httpStatus: 401,
    });
  }

  if (response.status === 403) {
    return skip(provider, "O projeto não tem permissão para acessar o modelo.", {
      ...details,
      httpStatus: 403,
    });
  }

  if (response.status === 404) {
    return skip(provider, "O modelo não está disponível para o publisher ou região informados.", {
      ...details,
      httpStatus: 404,
    });
  }

  if (response.status === 429) {
    return skip(provider, "O modelo está sem quota disponível para este projeto.", {
      ...details,
      httpStatus: 429,
    });
  }

  if (response.status === 400 || response.status === 422) {
    return fail(provider, "O provedor rejeitou o formato da requisição de smoke test.", {
      ...details,
      httpStatus: response.status,
      error: response.errorMessage,
    });
  }

  return fail(provider, "A chamada ao Google Vertex falhou.", {
    ...details,
    httpStatus: response.status,
    error: response.errorMessage,
  });
}

export function printReport(mode, results) {
  const status = results.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";
  const report = {
    status,
    mode,
    prompt: PROBE_PROMPT,
    results,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return status;
}
