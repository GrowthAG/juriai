import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";
import { isDevBypassEnabled, isLocalhostHost } from "@/lib/dev-bypass";

export async function proxy(request: NextRequest) {
  // O bootstrap por variáveis JURIAI_* (ver lib/actor-context.ts) provê
  // identidade sem login, mas só quando o bypass de dev está explicitamente
  // autorizado (NODE_ENV=development + JURIAI_ALLOW_DEV_BYPASS=true) e a
  // requisição parece vir de localhost. Fora disso, o guard normal roda.
  if (isDevBypassEnabled() && isLocalhostHost(request.headers.get("host"))) {
    return NextResponse.next();
  }

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
