import { NextRequest, NextResponse } from "next/server";
import {
  DatajudConfigError,
  DatajudInputError,
  DatajudUpstreamError,
  listDatajudTribunals,
  lookupDatajudProcess,
} from "@/lib/datajud";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json(
      { error: "Sessão expirada ou inexistente." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = body as {
    tribunal?: unknown;
    numeroProcesso?: unknown;
  };

  if (
    typeof payload.tribunal !== "string" ||
    typeof payload.numeroProcesso !== "string"
  ) {
    return NextResponse.json(
      {
        error: "Informe tribunal e numeroProcesso como strings.",
        tribunaisSuportados: listDatajudTribunals(),
      },
      { status: 400 }
    );
  }

  try {
    const result = await lookupDatajudProcess({
      tribunal: payload.tribunal,
      numeroProcesso: payload.numeroProcesso,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof DatajudInputError ||
      error instanceof DatajudConfigError ||
      error instanceof DatajudUpstreamError
    ) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Falha inesperada ao consultar o DataJud." },
      { status: 500 }
    );
  }
}
