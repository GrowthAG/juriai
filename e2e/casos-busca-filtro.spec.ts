import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

// Spec 005 — busca e filtros na lista /workspace/casos.
// Semeamos uma SUBCONTA própria (não-master, não-superadmin) para poder abrir a
// lista: o usuário dev padrão é MASTER e seria redirecionado para /admin.
const prisma = new PrismaClient();

const suffix = Date.now().toString(36);
const workspaceId = `ws-casos-filtro-${suffix}`;
const userId = `user-casos-filtro-${suffix}`;
const userEmail = `filtro.${suffix}@escritorio.test`;

// Dois casos contrastantes para busca e filtro terem o que separar.
const caseA = {
  title: `Contrato SaaS Almeida ${suffix}`,
  clientName: "Almeida Tecnologia",
  domain: "CIVIL" as const,
  status: "TRIAGEM" as const,
};
const caseB = {
  title: `Rescisão Bravo Logística ${suffix}`,
  clientName: "Bravo Logística",
  domain: "TRABALHISTA" as const,
  status: "ESTRATEGIA" as const,
};

test.beforeAll(async () => {
  await prisma.workspace.create({
    data: {
      id: workspaceId,
      name: `Escritório Filtro ${suffix}`,
      kind: "SUBCONTA",
      activeDomains: ["CIVIL", "TRABALHISTA"],
    },
  });
  await prisma.user.create({
    data: {
      id: userId,
      email: userEmail,
      name: "Advogada Filtro",
      role: "WORKSPACE_ADMIN",
      isSuperAdmin: false,
      workspaceId,
    },
  });
  await prisma.membership.create({
    data: { workspaceId, userId, role: "OWNER" },
  });
  const client = await prisma.client.create({
    data: { name: `Cliente Filtro ${suffix}`, workspaceId },
    select: { id: true },
  });
  for (const c of [caseA, caseB]) {
    await prisma.case.create({
      data: { ...c, workspaceId, ownerId: userId, clientId: client.id },
    });
  }
});

test.afterAll(async () => {
  // Ordem respeita as FKs (Case -> Client/User -> Membership -> Workspace).
  await prisma.case.deleteMany({ where: { workspaceId } }).catch(() => {});
  await prisma.client.deleteMany({ where: { workspaceId } }).catch(() => {});
  await prisma.membership.deleteMany({ where: { workspaceId } }).catch(() => {});
  await prisma.user.deleteMany({ where: { workspaceId } }).catch(() => {});
  await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {});
  await prisma.$disconnect();
});

async function openCasos(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(userEmail);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(/\/workspace(\/|$)/);
  await page.goto("/workspace/casos");
  await expect(
    page.getByRole("heading", { name: "Casos", exact: true }),
  ).toBeVisible();
}

const searchBox = (page: Page) =>
  page.getByLabel("Buscar por título do caso ou nome do cliente");
const rowA = (page: Page) => page.getByRole("link", { name: caseA.title });
const rowB = (page: Page) => page.getByRole("link", { name: caseB.title });

test.describe("Busca e filtros na lista de casos", () => {
  test.beforeEach(async ({ page }) => {
    await openCasos(page);
  });

  test("lista mostra ambos os casos sem filtro", async ({ page }) => {
    await expect(rowA(page)).toBeVisible();
    await expect(rowB(page)).toBeVisible();
  });

  test("busca por cliente isola o caso correspondente", async ({ page }) => {
    await searchBox(page).fill("almeida");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(rowA(page)).toBeVisible();
    await expect(rowB(page)).toHaveCount(0);
    // A URL filtrada é compartilhável / sobrevive a refresh.
    await expect(page).toHaveURL(/[?&]q=almeida/);
    await page.reload();
    await expect(rowA(page)).toBeVisible();
    await expect(rowB(page)).toHaveCount(0);
  });

  test("busca é acento-insensível", async ({ page }) => {
    await searchBox(page).fill("logistica");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(rowB(page)).toBeVisible();
    await expect(rowA(page)).toHaveCount(0);
  });

  test("filtro por status usa valores reais do enum", async ({ page }) => {
    await page
      .getByLabel("Filtrar por status")
      .selectOption({ value: caseB.status });
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(rowB(page)).toBeVisible();
    await expect(rowA(page)).toHaveCount(0);
  });

  test("filtro por área combina com a busca (AND)", async ({ page }) => {
    await page
      .getByLabel("Filtrar por área")
      .selectOption({ value: caseA.domain });
    await searchBox(page).fill("almeida");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(rowA(page)).toBeVisible();
    await expect(rowB(page)).toHaveCount(0);
  });

  test("estado vazio-por-filtro é distinto e oferece limpar", async ({
    page,
  }) => {
    await searchBox(page).fill("processo-que-nao-existe-xyz");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Nenhum caso corresponde ao filtro" }),
    ).toBeVisible();
    const clear = page.getByRole("link", { name: "Limpar filtros" });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(rowA(page)).toBeVisible();
    await expect(rowB(page)).toBeVisible();
  });
});
