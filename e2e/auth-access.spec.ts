import { expect, test } from "@playwright/test";
import { getRedirectUrl } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { config, proxy } from "../proxy";
import {
  createSessionToken,
  SESSION_COOKIE,
  verifySessionToken,
} from "../lib/session-token";

process.env.JURIAI_SESSION_SECRET =
  "juriai-e2e-session-secret-with-at-least-32-characters";

const PRIVATE_ROUTES = [
  "/admin",
  "/admin/subcontas",
  "/workspace",
  "/workspace/casos",
  "/casos/novo",
  "/configuracoes",
  "/onboarding/subconta",
];

test.describe("guard global de autenticação", () => {
  test("matcher cobre somente as áreas privadas do Prompt 1", () => {
    expect(config.matcher).toEqual([
      "/admin/:path*",
      "/workspace/:path*",
      "/casos/:path*",
      "/configuracoes/:path*",
      "/onboarding/:path*",
    ]);
  });

  test("redireciona todas as áreas privadas sem sessão", async () => {
    for (const route of PRIVATE_ROUTES) {
      const response = await proxy(
        new NextRequest(`https://juriai.test${route}`),
      );
      expect(getRedirectUrl(response)).toBe("https://juriai.test/login");
    }
  });

  test("rejeita cookie cru e token adulterado", async () => {
    const validToken = await createSessionToken("user-1", "session", 300);
    const forgedTokens = [
      "user-1",
      `${validToken.slice(0, -1)}${validToken.endsWith("a") ? "b" : "a"}`,
    ];

    for (const token of forgedTokens) {
      const request = authenticatedRequest("/workspace", token);
      const response = await proxy(request);
      expect(getRedirectUrl(response)).toBe("https://juriai.test/login");
    }
  });

  test("aceita sessão assinada válida", async () => {
    const token = await createSessionToken("user-1", "session", 300);
    const response = await proxy(authenticatedRequest("/workspace", token));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  test("token de impersonation não funciona como sessão", async () => {
    const token = await createSessionToken("admin-1", "impersonator", 300);

    expect(await verifySessionToken(token, "impersonator")).toBe("admin-1");
    expect(await verifySessionToken(token, "session")).toBeNull();
    const response = await proxy(authenticatedRequest("/workspace", token));
    expect(getRedirectUrl(response)).toBe("https://juriai.test/login");
  });

  test("home pública renderiza sem sessão", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("JuriAI");
  });
});

function authenticatedRequest(pathname: string, token: string) {
  return new NextRequest(`https://juriai.test${pathname}`, {
    headers: {
      cookie: `${SESSION_COOKIE}=${token}`,
    },
  });
}
