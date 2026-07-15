import { readFile, unlink } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002";

test.describe("provas e revisão humana", () => {
  test.skip(
    !new URL(baseURL).hostname.match(/^(localhost|127\.0\.0\.1)$/),
    "O smoke com escrita roda apenas contra o servidor local.",
  );

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("salva, baixa e revisa com isolamento", async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsDevelopmentUser(page);
    const actor = await prisma.user.findUniqueOrThrow({
      where: { email: "dev@juriai.local" },
      select: { id: true, workspaceId: true },
    });
    const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fixture = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: `Cliente smoke ${marker}`,
          workspaceId: actor.workspaceId,
        },
        select: { id: true },
      });
      const caso = await tx.case.create({
        data: {
          title: `Caso smoke ${marker}`,
          clientName: `Cliente smoke ${marker}`,
          domain: "CIVIL",
          workspaceId: actor.workspaceId,
          ownerId: actor.id,
          clientId: client.id,
        },
        select: { id: true },
      });
      return { caseId: caso.id, clientId: client.id };
    });
    const caseId = fixture.caseId;
    const evidenceLabel = `Prova smoke ${marker}`;
    const sourceFileName = `prova-smoke-${marker}.txt`;
    const fileContent = `Contrato de teste funcional ${marker}`;
    let evidenceId: string | null = null;
    let auditId: string | null = null;
    let storagePath: string | null = null;

    try {
      await page.goto(`/casos/${caseId}`);
      await page.locator("summary", { hasText: "Adicionar prova" }).click();
      await page.locator('input[name="file"]').setInputFiles({
        name: "arquivo-invalido.exe",
        mimeType: "application/octet-stream",
        buffer: Buffer.from("MZ-invalid-smoke"),
      });
      await page.locator('input[name="label"]').fill("Arquivo inválido");
      await page.getByRole("button", { name: "Salvar Prova" }).click();
      await page.waitForURL(/uploadError=/);
      await expect(
        page.getByRole("alert").filter({ hasText: "Formato não permitido" }),
      ).toBeVisible();

      await page.goto(`/casos/${caseId}`);
      await page.locator("summary", { hasText: "Adicionar prova" }).click();
      await page.locator('input[name="file"]').setInputFiles({
        name: sourceFileName,
        mimeType: "text/plain",
        buffer: Buffer.from(fileContent),
      });
      await page.locator('input[name="label"]').fill(evidenceLabel);
      await page.getByRole("button", { name: "Salvar Prova" }).click();
      await page.waitForURL(/upload=queued/);
      await expect(page.getByRole("status")).toContainText("Prova salva");

      const evidence = await prisma.evidence.findFirstOrThrow({
        where: { caseId, label: evidenceLabel },
        select: { id: true, storagePath: true, scanStatus: true },
      });
      evidenceId = evidence.id;
      storagePath = evidence.storagePath;
      expect(evidence.scanStatus).toBe("CLEAN");

      await prisma.evidence.update({
        where: { id: evidence.id },
        data: { scanStatus: "PENDING", scannedAt: null },
      });
      await page.reload();
      await expect(
        page
          .locator(`[data-evidence-id="${evidence.id}"]`)
          .getByText("Verificação de segurança em andamento"),
      ).toBeVisible();
      await expect(
        page
          .locator(`[data-evidence-id="${evidence.id}"]`)
          .getByRole("link", { name: "Baixar" }),
      ).toHaveCount(0);
      expect(
        (await page.request.get(`/api/evidence/${evidence.id}/download`)).status(),
      ).toBe(404);

      await prisma.evidence.update({
        where: { id: evidence.id },
        data: { scanStatus: "CLEAN", scannedAt: new Date() },
      });
      await page.reload();

      const downloadPromise = page.waitForEvent("download");
      await page
        .locator(`[data-evidence-id="${evidence.id}"]`)
        .getByRole("link", { name: "Baixar" })
        .click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(sourceFileName);
      const downloadedPath = await download.path();
      expect(downloadedPath).not.toBeNull();
      expect(await readFile(downloadedPath!, "utf8")).toBe(fileContent);

      const audit = await prisma.auditEntry.create({
        data: {
          action: "SUGGEST_STRATEGY",
          model: `smoke-test-${marker}`,
          groundedOn: [evidenceLabel],
          confidence: "ALTA",
          unresolvedGaps: [],
          caseId,
        },
        select: { id: true },
      });
      auditId = audit.id;

      await page.reload();
      const auditRow = page.locator(`[data-audit-id="${audit.id}"]`);
      await auditRow
        .getByRole("button", { name: "Marcar como revisado" })
        .click();
      await page.waitForURL((url) =>
        url.pathname === `/casos/${caseId}` && url.search === "",
      );
      await expect(auditRow.getByText(/Revisado por/)).toBeVisible();

      const reviewed = await prisma.auditEntry.findUniqueOrThrow({
        where: { id: audit.id },
        select: { reviewedById: true },
      });
      expect(reviewed.reviewedById).not.toBeNull();
    } finally {
      if (auditId) {
        await prisma.auditEntry.deleteMany({ where: { id: auditId } });
      }
      if (evidenceId) {
        await prisma.ingestionJob.deleteMany({ where: { evidenceId } });
        await prisma.evidence.deleteMany({ where: { id: evidenceId } });
      }
      if (storagePath) {
        await unlink(storagePath).catch(() => undefined);
      }
      await prisma.case.deleteMany({ where: { id: fixture.caseId } });
      await prisma.client.deleteMany({ where: { id: fixture.clientId } });
    }
  });
});
