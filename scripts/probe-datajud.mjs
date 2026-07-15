import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[m[1]] = v;
}

const BASE =
  process.env.DATAJUD_BASE_URL ?? "https://api-publica.datajud.cnj.jus.br";
const APIKEY = process.env.DATAJUD_API_KEY;
const LIB_TIMEOUT_MS = 8000;

if (!APIKEY) {
  console.error("DATAJUD_API_KEY ausente em .env.local");
  process.exit(1);
}

function normalizeProcessNumber(value) {
  return value.replace(/\D/g, "");
}

async function search({ alias, body, timeoutMs, label }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}/${alias}/_search`, {
      method: "POST",
      headers: {
        Authorization: `APIKey ${APIKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    const hits = json?.hits?.hits ?? [];
    const first = hits[0]?._source;
    return {
      label,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      total: json?.hits?.total?.value ?? hits.length,
      took: json?.took ?? null,
      timedOut: Boolean(json?.timed_out),
      first: first
        ? {
            numero: first.numeroProcesso,
            tribunal: first.tribunal,
            grau: first.grau,
            classe: first.classe,
            orgao: first.orgaoJulgador,
            movimentos: (first.movimentos ?? []).length,
            dataAjuizamento: first.dataAjuizamento,
          }
        : null,
      errorSnippet: !res.ok ? text.slice(0, 250) : undefined,
      bodyHead: !json ? text.slice(0, 250) : undefined,
    };
  } catch (error) {
    return {
      label,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      error:
        error?.name === "AbortError"
          ? `timeout ${timeoutMs}ms`
          : error?.message ?? String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const embargos = normalizeProcessNumber("4102620-08.2026.8.26.0100");

const tests = [
  {
    label: "1) lib-like: embargos TJSP (timeout 8s da app)",
    alias: "api_publica_tjsp",
    timeoutMs: LIB_TIMEOUT_MS,
    body: { query: { match: { numeroProcesso: embargos } } },
  },
  {
    label: "2) lib-like: TRF3 smoke (numero zero, timeout 8s)",
    alias: "api_publica_trf3",
    timeoutMs: LIB_TIMEOUT_MS,
    body: { query: { match: { numeroProcesso: "00000000000000000000" } } },
  },
  {
    label: "3) diagnostico: embargos TJSP 40s",
    alias: "api_publica_tjsp",
    timeoutMs: 40000,
    body: { query: { match: { numeroProcesso: embargos } } },
  },
  {
    label: "4) diagnostico: TJSP health size:0 40s",
    alias: "api_publica_tjsp",
    timeoutMs: 40000,
    body: { size: 0, query: { match_all: {} } },
  },
  {
    label: "5) diagnostico: TRF3 health size:0 25s",
    alias: "api_publica_trf3",
    timeoutMs: 25000,
    body: { size: 0, query: { match_all: {} } },
  },
  {
    label: "6) auth: chave valida no TRF3 (deve 200)",
    alias: "api_publica_trf3",
    timeoutMs: 25000,
    body: { size: 0, query: { match_all: {} } },
  },
];

console.log(
  JSON.stringify(
    {
      base: BASE,
      keyLen: APIKEY.length,
      embargosDigits: embargos,
      embargosLen: embargos.length,
    },
    null,
    2,
  ),
);

for (const test of tests) {
  const result = await search(test);
  console.log(JSON.stringify(result, null, 2));
}
