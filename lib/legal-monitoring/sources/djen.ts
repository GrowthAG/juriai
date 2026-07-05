import {
  MonitoringExternalError,
  MonitoringInputError,
  ProbeResult,
  NormalizedItem,
} from "../types";

const DJEN_BASE_URL = "https://comunicaapi.pje.jus.br/api/v1";

export async function probeDjen(params: {
  numeroProcesso?: string;
  oab?: string;
  ufOab?: string;
  nomeParte?: string;
  dataInicio?: string;
  dataFim?: string;
  dateFrom?: string; // Alias
  dateTo?: string;   // Alias
  limit?: number;
}): Promise<ProbeResult> {
  const url = new URL(`${DJEN_BASE_URL}/comunicacao`);
  
  const from = params.dataInicio || params.dateFrom;
  const to = params.dataFim || params.dateTo;
  const limit = Math.min(params.limit || 10, 20); // Cap at 20 for safety

  if (!from || !to) {
    throw new MonitoringInputError("dateFrom e dateTo são obrigatórios para consulta DJEN.");
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const dFrom = new Date(`${from}T00:00:00.000Z`);
  const dTo = new Date(`${to}T00:00:00.000Z`);

  if (
    !datePattern.test(from) ||
    !datePattern.test(to) ||
    Number.isNaN(dFrom.getTime()) ||
    Number.isNaN(dTo.getTime())
  ) {
    throw new MonitoringInputError("dateFrom e dateTo devem usar o formato YYYY-MM-DD.");
  }

  if (dFrom > dTo) {
    throw new MonitoringInputError("dateFrom deve ser anterior ou igual a dateTo.");
  }

  const diffTime = dTo.getTime() - dFrom.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 7) {
    throw new MonitoringInputError("O período máximo permitido para consulta DJEN é de 7 dias.");
  }

  if (params.numeroProcesso) url.searchParams.set("numeroProcesso", params.numeroProcesso.replace(/\D/g, ""));
  if (params.oab) url.searchParams.set("numeroOab", params.oab);
  if (params.ufOab) url.searchParams.set("ufOab", params.ufOab);
  if (params.nomeParte) url.searchParams.set("nomeParte", params.nomeParte);
  if (from) url.searchParams.set("dataDisponibilizacaoInicio", from);
  if (to) url.searchParams.set("dataDisponibilizacaoFim", to);
  
  // DJEN API costuma aceitar 'paginacao' ou 'tamanho'
  url.searchParams.set("itensPorPagina", Math.min(limit, 50).toString());

  // DJEN API costuma ser pública e não exigir API Key no header da mesma forma que DataJud,
  // ou pode usar a mesma chave se for via gateway do CNJ.
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new MonitoringExternalError("A consulta ao DJEN demorou demais (timeout). Tente um período menor.", 503);
    }
    throw new MonitoringExternalError("O serviço DJEN está temporariamente indisponível ou inacessível.", 503);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errorData = await response.json() as { message?: string, detail?: string };
      detail = errorData.message || errorData.detail || "";
    } catch {
      // ignore
    }
    
    const status = response.status === 429 || response.status >= 500 ? 503 : 502;
    const msg = detail ? `DJEN retornou erro: ${detail}` : "Não foi possível consultar o serviço DJEN (erro na fonte).";
    throw new MonitoringExternalError(msg, status);
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json() as Record<string, unknown>;
  } catch {
    throw new MonitoringExternalError("O serviço DJEN retornou uma resposta inválida.");
  }
  // A estrutura do DJEN costuma ter um campo 'items' ou 'content'
  const rawItems = (data.items as Array<Record<string, unknown>>) || (data.content as Array<Record<string, unknown>>) || (Array.isArray(data) ? data : []);

  const items: NormalizedItem[] = (rawItems as Array<Record<string, unknown>>).map((item) => {
    const text = (item.texto as string) || "";
    let extractedNumero = 
      (item.numeroprocessocommascara as string) || 
      (item.numeroProcesso as string) || 
      "";

    // Se não encontrou nos campos camelCase, tenta snake_case e formata
    if (!extractedNumero && item.numero_processo) {
      const rawNum = (item.numero_processo as string).replace(/\D/g, "");
      if (rawNum.length === 20) {
        extractedNumero = `${rawNum.slice(0, 7)}-${rawNum.slice(7, 9)}.${rawNum.slice(9, 13)}.${rawNum.slice(13, 14)}.${rawNum.slice(14, 16)}.${rawNum.slice(16, 20)}`;
      } else {
        extractedNumero = rawNum;
      }
    }

    // Fallback: extração por Regex do texto
    if (!extractedNumero) {
      const cnjRegex = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
      const match = text.match(cnjRegex);
      if (match) {
        extractedNumero = match[0];
      }
    }

    // Normalização de Datas
    const normalizeDate = (d: unknown) => {
      if (typeof d !== "string" || !d) return "";
      // Converte DD/MM/YYYY para YYYY-MM-DD
      const brMatch = d.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
      return d.split("T")[0]; // Remove time se houver
    };

    const dataDisp = normalizeDate(
      item.datadisponibilizacao || 
      item.dataDisponibilizacao || 
      item.data_disponibilizacao
    );

    const dataPub = normalizeDate(
      item.datapublicacao || 
      item.dataPublicacao || 
      item.data_publicacao
    );

    // Normalização de Advogados
    const lawyers: string[] = [];
    const destAdv = item.destinatarioadvogados as Array<{ advogado?: { nome?: string, numero_oab?: string, uf_oab?: string } }>;
    if (Array.isArray(destAdv)) {
      destAdv.forEach(da => {
        const adv = da.advogado;
        if (adv?.nome) {
          const oab = adv.numero_oab ? `(OAB ${adv.numero_oab}/${adv.uf_oab || ""})` : "";
          lawyers.push(`${adv.nome} ${oab}`.trim());
        }
      });
    }

    // Fallback: extração do texto após "ADV:"
    if (lawyers.length === 0) {
      const advMatches = text.match(/ADV:\s*([^.\n-]+)/gi);
      if (advMatches) {
        advMatches.forEach(m => {
          const names = m.replace(/ADV:\s*/i, "").split(",").map(n => n.trim()).filter(Boolean);
          lawyers.push(...names);
        });
      }
    }

    return {
      source: "djen",
      externalId: (item.id as string | number)?.toString() || "",
      sourceUrl: `https://comunica.pje.jus.br/consulta?id=${item.id}`,
      tribunal: (item.siglaTribunal as string) || "",
      numeroProcesso: extractedNumero,
      dataDisponibilizacao: dataDisp,
      dataPublicacao: dataPub,
      tipo: (item.tipoComunicacao as string) || "Publicação",
      texto: text,
      destinatarios: (item.destinatarios as Array<{ nome?: string }>)?.map((d) => d.nome).filter((n): n is string => !!n) || [],
      advogados: Array.from(new Set(lawyers)),
      raw: item
    };
  });

  return {
    source: "djen",
    query: Object.fromEntries(url.searchParams.entries()),
    items,
    warnings: [],
    capabilities: {
      supportsNumeroProcesso: true,
      supportsOab: true,
      supportsNome: true,
      supportsDateRange: true
    }
  };
}
