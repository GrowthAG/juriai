import { NextResponse } from "next/server";
import { processIngestionJob } from "@/lib/ingestion";
import { isAuthorizedCloudTask } from "@/lib/task-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const maxDuration = 900;

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthorizedCloudTask(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id: jobId } = await context.params;
  const result = await processIngestionJob(jobId);

  if (!result.ok) {
    if (
      !result.caseId ||
      ("terminal" in result && result.terminal === true)
    ) {
      // Jobs removidos ou bloqueados pela segurança não devem manter retry.
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
