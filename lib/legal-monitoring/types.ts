export interface ProbeParams {
  source: "datajud" | "djen";
  tribunal?: string;
  numeroProcesso?: string;
  oab?: string;
  ufOab?: string;
  nomeParte?: string;
  dataInicio?: string;
  dataFim?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface NormalizedItem {
  source: "datajud" | "djen";
  externalId: string;
  sourceUrl: string;
  tribunal: string;
  numeroProcesso: string;
  dataDisponibilizacao: string;
  dataPublicacao: string;
  tipo: string;
  texto: string;
  destinatarios: string[];
  advogados: string[];
  raw?: Record<string, unknown>; // Opcional para permitir sanitização
}

export type SanitizedItem = Omit<NormalizedItem, "raw">;

export interface ProbeResult {
  source: "datajud" | "djen";
  query: Record<string, unknown>;
  items: NormalizedItem[];
  warnings: string[];
  capabilities: {
    supportsNumeroProcesso: boolean;
    supportsOab: boolean;
    supportsNome: boolean;
    supportsDateRange: boolean;
  };
}

export type SanitizedProbeResult = Omit<ProbeResult, "items"> & {
  items: SanitizedItem[];
};

export class MonitoringInputError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "MonitoringInputError";
  }
}

export class MonitoringExternalError extends Error {
  readonly status: 502 | 503 | 504;

  constructor(message: string, status: 502 | 503 | 504 = 502) {
    super(message);
    this.name = "MonitoringExternalError";
    this.status = status;
  }
}
