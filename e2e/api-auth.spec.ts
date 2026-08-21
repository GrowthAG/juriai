import { expect, test } from "@playwright/test";

test.describe("API auth guards", () => {
  test("rejeita upload de prova sem sessão", async ({ request }) => {
    const response = await request.post("/api/cases/not-a-real-id/evidence");

    expect(response.status()).toBe(401);
    await expectJsonError(response);
  });

  test("rejeita processamento de ingestão sem sessão", async ({ request }) => {
    const response = await request.post(
      "/api/ingestion-jobs/not-a-real-id/process",
    );

    expect(response.status()).toBe(401);
    await expectJsonError(response);
  });

  test("rejeita worker interno sem credenciais da fila", async ({ request }) => {
    const response = await request.post(
      "/api/internal/ingestion-jobs/not-a-real-id/process",
    );

    expect(response.status()).toBe(401);
    await expectJsonError(response);
  });

  test("não revela PDF de minuta sem sessão", async ({ request }) => {
    const response = await request.get("/api/drafts/not-a-real-id/export");

    expect(response.status()).toBe(404);
    await expectJsonError(response);
  });

  test("não revela arquivo de prova sem sessão", async ({ request }) => {
    const response = await request.get(
      "/api/evidence/not-a-real-id/download",
    );

    expect(response.status()).toBe(404);
    await expectJsonError(response);
  });

  test("rejeita probe de monitoramento sem sessão", async ({ request }) => {
    const response = await request.post("/api/monitoring/probe");

    expect(response.status()).toBe(401);
    await expectJsonError(response);
  });

  test("rejeita consulta processual sem sessão", async ({ request }) => {
    const response = await request.post("/api/processos/consulta");

    expect(response.status()).toBe(401);
    await expectJsonError(response);
  });
});

async function expectJsonError(response: { headers(): Record<string, string>; json(): Promise<unknown> }) {
  expect(response.headers()["content-type"]).toContain("application/json");
  const body = await response.json();
  expect(body).toEqual(expect.objectContaining({ error: expect.any(String) }));
}
