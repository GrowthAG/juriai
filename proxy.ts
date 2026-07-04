import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  // Em development, o bootstrap por variáveis JURIAI_* (ver lib/actor-context.ts)
  // provê identidade sem login. O guard só faz sentido fora de development, onde
  // getActorContext também recusa contexto sintético. Manter os dois alinhados.
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const sessionUserId = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    "session",
  );
  if (sessionUserId) return NextResponse.next();

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/workspace/:path*",
    "/casos/:path*",
    "/configuracoes/:path*",
    "/onboarding/:path*",
  ],
};
