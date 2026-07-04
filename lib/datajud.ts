type DatajudClasse = {
  codigo?: number;
  nome?: string;
};

type DatajudAssunto = {
  codigo?: number;
  nome?: string;
};

type DatajudOrgaoJulgador = {
  codigo?: number;
  codigoMunicipioIBGE?: number;
  nome?: string;
};

type DatajudMovimento = {
  codigo?: number;
  nome?: string;
  dataHora?: string;
  complementosTabelados?: Array<{
    codigo?: number;
    descricao?: string;
    valor?: number;
    nome?: string;
  }>;
  orgaoJulgador?: {
    codigoOrgao?: number;
    nomeOrgao?: string;
  };
};

type DatajudProcessSource = {
  id?: string;
  tribunal?: string;
  numeroProcesso?: string;
  dataAjuizamento?: string;
  grau?: string;
  nivelSigilo?: number;
  classe?: DatajudClasse;
  assuntos?: DatajudAssunto[];
  orgaoJulgador?: DatajudOrgaoJulgador;
  movimentos?: DatajudMovimento[];
  formato?: {
    codigo?: number;
    nome?: string;
  };
  sistema?: {
    codigo?: number;
    nome?: string;
  };
  dataHoraUltimaAtualizacao?: string;
  "@timestamp"?: string;
};

type DatajudHit = {
  _index: string;
  _id: string;
  _score?: number;
  _source: DatajudProcessSource;
};

type DatajudSearchResponse = {
  took?: number;
  timed_out?: boolean;
  hits?: {
    total?: {
      value?: number;
      relation?: string;
    };
    hits?: DatajudHit[];
  };
};

export type DatajudTribunalKey = keyof typeof DATAJUD_TRIBUNALS;

export type DatajudProcess = {
  id: string;
  sourceIndex: string;
  score: number | null;
  tribunal: string | null;
  numeroProcesso: string | null;
  dataAjuizamento: string | null;
  grau: string | null;
  nivelSigilo: number | null;
  classe: DatajudClasse | null;
  assuntos: DatajudAssunto[];
  orgaoJulgador: DatajudOrgaoJulgador | null;
  movimentos: DatajudMovimento[];
  formato: DatajudProcessSource["formato"] | null;
  sistema: DatajudProcessSource["sistema"] | null;
  dataHoraUltimaAtualizacao: string | null;
};

export type DatajudLookupResult = {
  tribunal: DatajudTribunalKey;
  alias: string;
  numeroProcesso: string;
  total: number;
  timedOut: boolean;
  tookMs: number | null;
  processos: DatajudProcess[];
};

export const DATAJUD_TRIBUNALS = {
  STJ: "api_publica_stj",
  TST: "api_publica_tst",
  TSE: "api_publica_tse",
  STM: "api_publica_stm",
  TRF1: "api_publica_trf1",
  TRF2: "api_publica_trf2",
  TRF3: "api_publica_trf3",
  TRF4: "api_publica_trf4",
  TRF5: "api_publica_trf5",
  TRF6: "api_publica_trf6",
  TJAC: "api_publica_tjac",
  TJAL: "api_publica_tjal",
  TJAM: "api_publica_tjam",
  TJAP: "api_publica_tjap",
  TJBA: "api_publica_tjba",
  TJCE: "api_publica_tjce",
  TJDFT: "api_publica_tjdft",
  TJES: "api_publica_tjes",
  TJGO: "api_publica_tjgo",
  TJMA: "api_publica_tjma",
  TJMG: "api_publica_tjmg",
  TJMS: "api_publica_tjms",
  TJMT: "api_publica_tjmt",
  TJPA: "api_publica_tjpa",
  TJPB: "api_publica_tjpb",
  TJPE: "api_publica_tjpe",
  TJPI: "api_publica_tjpi",
  TJPR: "api_publica_tjpr",
  TJRJ: "api_publica_tjrj",
  TJRN: "api_publica_tjrn",
  TJRO: "api_publica_tjro",
  TJRR: "api_publica_tjrr",
  TJRS: "api_publica_tjrs",
  TJSC: "api_publica_tjsc",
  TJSE: "api_publica_tjse",
  TJSP: "api_publica_tjsp",
  TJTO: "api_publica_tjto",
  TRT1: "api_publica_trt1",
  TRT2: "api_publica_trt2",
  TRT3: "api_publica_trt3",
  TRT4: "api_publica_trt4",
  TRT5: "api_publica_trt5",
  TRT6: "api_publica_trt6",
  TRT7: "api_publica_trt7",
  TRT8: "api_publica_trt8",
  TRT9: "api_publica_trt9",
  TRT10: "api_publica_trt10",
  TRT11: "api_publica_trt11",
  TRT12: "api_publica_trt12",
  TRT13: "api_publica_trt13",
  TRT14: "api_publica_trt14",
  TRT15: "api_publica_trt15",
  TRT16: "api_publica_trt16",
  TRT17: "api_publica_trt17",
  TRT18: "api_publica_trt18",
  TRT19: "api_publica_trt19",
  TRT20: "api_publica_trt20",
  TRT21: "api_publica_trt21",
  TRT22: "api_publica_trt22",
  TRT23: "api_publica_trt23",
  TRT24: "api_publica_trt24",
  TREAC: "api_publica_tre-ac",
  TREAL: "api_publica_tre-al",
  TREAM: "api_publica_tre-am",
  TREAP: "api_publica_tre-ap",
  TREBA: "api_publica_tre-ba",
  TRECE: "api_publica_tre-ce",
  TREDFT: "api_publica_tre-dft",
  TREES: "api_publica_tre-es",
  TREGO: "api_publica_tre-go",
  TREMA: "api_publica_tre-ma",
  TREMG: "api_publica_tre-mg",
  TREMS: "api_publica_tre-ms",
  TREMT: "api_publica_tre-mt",
  TREPA: "api_publica_tre-pa",
  TREPB: "api_publica_tre-pb",
  TREPE: "api_publica_tre-pe",
  TREPI: "api_publica_tre-pi",
  TREPR: "api_publica_tre-pr",
  TRERJ: "api_publica_tre-rj",
  TRERN: "api_publica_tre-rn",
  TRERO: "api_publica_tre-ro",
  TRERR: "api_publica_tre-rr",
  TRERS: "api_publica_tre-rs",
  TRESC: "api_publica_tre-sc",
  TRESE: "api_publica_tre-se",
  TRESP: "api_publica_tre-sp",
  TRETO: "api_publica_tre-to",
  TJMMG: "api_publica_tjmmg",
  TJMRS: "api_publica_tjmrs",
  TJMSP: "api_publica_tjmsp",
} as const;

const DATAJUD_BASE_URL =
  process.env.DATAJUD_BASE_URL ?? "https://api-publica.datajud.cnj.jus.br";

export function normalizeProcessNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeTribunal(value: string): DatajudTribunalKey | null {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (normalized in DATAJUD_TRIBUNALS) {
    return normalized as DatajudTribunalKey;
  }
  return null;
}

export function listDatajudTribunals() {
  return Object.keys(DATAJUD_TRIBUNALS) as DatajudTribunalKey[];
}

export async function lookupDatajudProcess(params: {
  tribunal: string;
  numeroProcesso: string;
}): Promise<DatajudLookupResult> {
  const tribunal = normalizeTribunal(params.tribunal);
  if (!tribunal) {
    throw new DatajudInputError(
      `Tribunal inválido. Use uma sigla suportada, como TJSP, TJRJ, TRF1, TRT2 ou STJ.`
    );
  }

  const numeroProcesso = normalizeProcessNumber(params.numeroProcesso);
  if (numeroProcesso.length !== 20) {
    throw new DatajudInputError(
      "Número de processo inválido. Informe a numeração única CNJ com 20 dígitos."
    );
  }

  const apiKey = process.env.DATAJUD_API_KEY;
  if (!apiKey) {
    throw new DatajudConfigError(
      "DATAJUD_API_KEY não configurada no ambiente."
    );
  }

  const alias = DATAJUD_TRIBUNALS[tribunal];
  const response = await fetch(`${DATAJUD_BASE_URL}/${alias}/_search`, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        match: {
          numeroProcesso,
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new DatajudUpstreamError(response.status, detail.slice(0, 500));
  }

  const data = (await response.json()) as DatajudSearchResponse;
  const hits = data.hits?.hits ?? [];

  return {
    tribunal,
    alias,
    numeroProcesso,
    total: data.hits?.total?.value ?? hits.length,
    timedOut: Boolean(data.timed_out),
    tookMs: typeof data.took === "number" ? data.took : null,
    processos: hits.map(normalizeDatajudHit),
  };
}

function normalizeDatajudHit(hit: DatajudHit): DatajudProcess {
  const source = hit._source;
  return {
    id: source.id ?? hit._id,
    sourceIndex: hit._index,
    score: typeof hit._score === "number" ? hit._score : null,
    tribunal: source.tribunal ?? null,
    numeroProcesso: source.numeroProcesso ?? null,
    dataAjuizamento: source.dataAjuizamento ?? null,
    grau: source.grau ?? null,
    nivelSigilo: typeof source.nivelSigilo === "number" ? source.nivelSigilo : null,
    classe: source.classe ?? null,
    assuntos: source.assuntos ?? [],
    orgaoJulgador: source.orgaoJulgador ?? null,
    movimentos: source.movimentos ?? [],
    formato: source.formato ?? null,
    sistema: source.sistema ?? null,
    dataHoraUltimaAtualizacao:
      source.dataHoraUltimaAtualizacao ?? source["@timestamp"] ?? null,
  };
}

export class DatajudInputError extends Error {
  status = 400;
}

export class DatajudConfigError extends Error {
  status = 500;
}

export class DatajudUpstreamError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(`DataJud retornou HTTP ${status}: ${detail}`);
    this.status = status;
  }
}
