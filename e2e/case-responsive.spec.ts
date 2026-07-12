import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

const prisma = new PrismaClient();
let responsiveCaseId: string | null = null;
let responsiveClientId: string | null = null;
let createdResponsiveCase = false;

async function openResponsiveCase(page: Page) {
  await loginAsDevelopmentUser(page);

  if (!responsiveCaseId) {
    const user = await prisma.user.findUnique({
      where: { email: "dev@juriai.local" },
      select: { id: true, workspaceId: true },
    });

    if (!user) {
      throw new Error("Usuário de desenvolvimento não encontrado.");
    }

    const accessible = await prisma.caseMember.findFirst({
      where: { userId: user.id },
      select: { caseId: true },
    });

    if (accessible) {
      responsiveCaseId = accessible.caseId;
    } else {
      const suffix = Date.now().toString(36);
      const client = await prisma.client.create({
        data: {
          name: `Responsive Smoke ${suffix}`,
          workspaceId: user.workspaceId,
        },
        select: { id: true },
      });
      responsiveClientId = client.id;
      const created = await prisma.case.create({
        data: {
          title: `Responsive Smoke ${suffix}`,
          clientName: "Responsive Smoke",
          domain: "CONSUMIDOR",
          workspaceId: user.workspaceId,
          ownerId: user.id,
          clientId: client.id,
        },
        select: { id: true },
      });
      responsiveCaseId = created.id;
      createdResponsiveCase = true;
      await prisma.caseMember.create({
        data: { caseId: created.id, userId: user.id },
      });
    }
  }

  await page.goto(`/casos/${responsiveCaseId}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function getTitleBox(page: Page, text: string) {
  const locator = page.getByRole("heading", { name: text });
  await expect(locator).toBeVisible();
  return locator;
}

test.describe("Dossiê responsivo", () => {
  test.afterAll(async () => {
    if (createdResponsiveCase && responsiveCaseId) {
      await prisma.case.delete({ where: { id: responsiveCaseId } }).catch(() => {});
    }
    if (responsiveClientId) {
      await prisma.client.delete({ where: { id: responsiveClientId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  test.describe("desktop", () => {
    test.use({ viewport: { width: 1440, height: 1000 } });

    test("mantém o assistente à direita e sem overflow horizontal", async ({
      page,
    }) => {
      await openResponsiveCase(page);

      const dossierTitle = await getTitleBox(page, "Rascunhos e redação");
      const assistantTitle = page.getByText("Assistente do caso", { exact: true });
      await expect(assistantTitle).toBeVisible();

      const [dossierBox, assistantBox] = await Promise.all([
        dossierTitle.boundingBox(),
        assistantTitle.boundingBox(),
      ]);

      expect(dossierBox).not.toBeNull();
      expect(assistantBox).not.toBeNull();
      expect(assistantBox!.x).toBeGreaterThan(dossierBox!.x);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      );
      expect(overflow).toBeTruthy();

      await expect(page.locator("summary", { hasText: "Nova minuta" })).toBeVisible();
      await expect(page.locator("summary", { hasText: "Adicionar prova" })).toBeVisible();
    });
  });

  test.describe("mobile", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test("empilha o dossiê antes do assistente e sem overflow horizontal", async ({
      page,
    }) => {
      await openResponsiveCase(page);

      const dossierTitle = await getTitleBox(page, "Rascunhos e redação");
      const assistantTitle = page.getByText("Assistente do caso", { exact: true });
      await expect(assistantTitle).toBeVisible();

      const [dossierBox, assistantBox] = await Promise.all([
        dossierTitle.boundingBox(),
        assistantTitle.boundingBox(),
      ]);

      expect(dossierBox).not.toBeNull();
      expect(assistantBox).not.toBeNull();
      expect(dossierBox!.y).toBeLessThan(assistantBox!.y);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      );
      expect(overflow).toBeTruthy();

      await expect(page.locator("summary", { hasText: "Nova minuta" })).toBeVisible();
      await expect(page.locator("summary", { hasText: "Adicionar prova" })).toBeVisible();
    });
  });
});
