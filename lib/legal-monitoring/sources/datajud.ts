import { 
  DATAJUD_TRIBUNALS, 
  DatajudTribunalKey, 
  normalizeProcessNumber, 
  normalizeTribunal 
} from "../../datajud";
import {
  MonitoringExternalError,
  MonitoringInputError,
  ProbeResult,
  NormalizedItem,
} from "../types";

const DATAJUD_BASE_URL = "https://api-publica.datajud.cnj.jus.br";

export async function probeDatajud(params: {
  tribunal?: string;
  numeroProcesso?: string;
  oab?: string;
  ufOab?: string;
}): Promise<ProbeResult> {
  const apiKey = process.env.DATAJUD_API_KEY;
  const warnings: string[] = [];
  
  if (!apiKey) {
    throw new MonitoringExternalError("O serviço DataJud não está configurado.", 503);
  }

  const query: { query: { bool: { must: Array<Record<string, unknown>> } } } = {
    query: {
      bool: {
        must: []
      }
    }
  };

  if (params.numeroProcesso) {
    query.query.bool.must.push({
      match: { numeroProcesso: normalizeProcessNumber(params.numeroProcesso) }
    });
  }

  // Probe experimental: Testar busca por OAB no DataJud
  if (params.oab) {
    // Nota: O mapeamento exato varia por tribunal. 
    // Tentamos o padrão comum sugerido na documentação CNJ.
    query.query.bool.must.push({
      match: { "dadosBasicos.advogado.numeroOAB": params.oab }
    });
    warnings.push("Busca por OAB no DataJud é experimental e depende de indexação específica do tribunal.");
  }

  let tribunalKey: DatajudTribunalKey;
  if (params.tribunal) {
    const normalized = normalizeTribunal(params.tribunal);
    if (!normalized) {
      throw new MonitoringInputError(
        "Tribunal inválido. Use uma sigla suportada, como TJSP, TJRJ, TRF1, TRT2 ou STJ.",
      );
    }
    tribunalKey = normalized;
  } else {
    tribunalKey = "TJSP";
    warnings.push(
      "Nenhum tribunal informado: a consulta foi restrita a TJSP por padrão, não é uma busca nacional.",
    );
  }
  const alias = DATAJUD_TRIBUNALS[tribunalKey];

  let response: Response;
  try {
    response = await fetch(`${DATAJUD_BASE_URL}/${alias}/_search`, {
      method: "POST",
      headers: {
        Authorization: `APIKey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
      cache: "no-store",
    });
  } catch {
    throw new MonitoringExternalError("O serviço DataJud está temporariamente indisponível.", 503);
  }

  if (!response.ok) {
    const status = response.status === 429 || response.status >= 500 ? 503 : 502;
    throw new MonitoringExternalError("Não foi possível consultar o serviço DataJud.", status);
  }

  let data: { hits?: { hits?: Array<{ _id: string; _index: string; _source: Record<string, unknown> }> } };
  try {
    data = await response.json() as typeof data;
  } catch {
    throw new MonitoringExternalError("O serviço DataJud retornou uma resposta inválida.");
  }
  const hits = data.hits?.hits ?? [];

  const items: NormalizedItem[] = hits.map((hit) => {
    const src = hit._source;
    return {
      source: "datajud",
      externalId: hit._id,
      sourceUrl: "",
      tribunal: String((src.tribunal as string) || tribunalKey),
      numeroProcesso: (src.numeroProcesso as string) || "",
      dataDisponibilizacao: "",
      dataPublicacao: (src.dataHoraUltimaAtualizacao as string) || "",
      tipo: (src.classe as Record<string, unknown>)?.nome as string || "Movimentação",
      texto: (src.movimentos as Array<{ nome?: string }>)?.map((m) => m.nome).join(" | ") || "",
      destinatarios: [],
      advogados: (src.dadosBasicos as Record<string, unknown>)?.advogado ? ((src.dadosBasicos as Record<string, unknown>).advogado as Array<{ nome?: string }>)?.map((a) => a.nome).filter((n): n is string => !!n) : [],
      raw: hit as unknown as Record<string, unknown>
    };
  });

  return {
    source: "datajud",
    query,
    items,
    warnings,
    capabilities: {
      supportsNumeroProcesso: true,
      supportsOab: true, // Experimental
      supportsNome: false,
      supportsDateRange: false
    }
  };
}
