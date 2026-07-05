import { NextRequest, NextResponse } from "next/server";
import { runProbe, ProbeParams } from "@/lib/legal-monitoring/probe";
import {
  MonitoringExternalError,
  MonitoringInputError,
  SanitizedProbeResult,
} from "@/lib/legal-monitoring/types";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json(
      { error: "Sessão expirada ou inexistente." },
      { status: 401 },
    );
  }

  try {
    const context = await getActorContext();
    if (context.actorId !== sessionUserId) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 },
      );
    }

    if (!context.isSuperAdmin && context.workspaceRole !== "WORKSPACE_ADMIN") {
      return NextResponse.json(
        { error: "Você não tem permissão para realizar esta consulta." },
        { status: 403 },
      );
    }

    let body: ProbeParams;
    try {
      body = await request.json() as ProbeParams;
    } catch {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 },
      );
    }

    const result = await runProbe(body as ProbeParams);
    
    // Sanitização para o frontend: remove o campo 'raw' de cada item
    const sanitizedResult: SanitizedProbeResult = {
      ...result,
      items: result.items.map((item) => ({
        source: item.source,
        externalId: item.externalId,
        sourceUrl: item.sourceUrl,
        tribunal: item.tribunal,
        numeroProcesso: item.numeroProcesso,
        dataDisponibilizacao: item.dataDisponibilizacao,
        dataPublicacao: item.dataPublicacao,
        tipo: item.tipo,
        texto: item.texto,
        destinatarios: item.destinatarios,
        advogados: item.advogados,
      })),
    };

    return NextResponse.json(sanitizedResult);
  } catch (error) {
    if (error instanceof MonitoringInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof MonitoringExternalError) {
      console.error("Falha ao consultar fonte externa no probe:", error.message);
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Erro interno no probe:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a consulta." },
      { status: 500 },
    );
  }
}
