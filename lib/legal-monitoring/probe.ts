import { probeDatajud } from "./sources/datajud";
import { probeDjen } from "./sources/djen";
import { MonitoringInputError, ProbeResult } from "./types";

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

export async function runProbe(params: ProbeParams): Promise<ProbeResult> {
  if (!params || (params.source !== "datajud" && params.source !== "djen")) {
    throw new MonitoringInputError("Fonte inválida. Use \"djen\" ou \"datajud\".");
  }

  switch (params.source) {
    case "datajud":
      return probeDatajud({
        tribunal: params.tribunal,
        numeroProcesso: params.numeroProcesso,
        oab: params.oab,
        ufOab: params.ufOab
      });
    case "djen":
      return probeDjen({
        numeroProcesso: params.numeroProcesso,
        oab: params.oab,
        ufOab: params.ufOab,
        nomeParte: params.nomeParte,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        limit: params.limit
      });
  }
}
