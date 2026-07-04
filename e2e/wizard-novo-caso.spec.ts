import { test, expect } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

test.describe("Wizard: Novo Caso", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevelopmentUser(page);
    await page.goto("/casos/novo");
  });

  test("exibe a etapa de seleção de área", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Novo caso" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cível" })).toBeVisible();
    await expect(page.getByText("Trabalhista")).toBeVisible();
    await expect(page.getByText("Penal")).toBeVisible();
    await expect(page.getByText("Família")).toBeVisible();
    await expect(page.getByText("Tributário")).toBeVisible();
  });

  test("selecionar área avança para o contexto", async ({ page }) => {
    await page.getByRole("link", { name: "Cível" }).click();
    await expect(
      page.getByRole("heading", { name: "Etapa 2 · Contexto inicial" }),
    ).toBeVisible();
    await expect(page).toHaveURL("/casos/novo/civil");
  });

  test("etapa de contexto identifica a área escolhida", async ({ page }) => {
    await page.getByRole("link", { name: "Cível" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Etapa 2 · Contexto do caso — Cível",
      }),
    ).toBeVisible();
  });

  test("cada área aponta para sua rota", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Trabalhista" })).toHaveAttribute(
      "href",
      "/casos/novo/trabalhista",
    );
    await expect(page.getByRole("link", { name: "Penal" })).toHaveAttribute(
      "href",
      "/casos/novo/penal",
    );
  });

  test("voltar retorna para a seleção de área", async ({ page }) => {
    await page.getByText("Trabalhista").click();
    await page.getByRole("link", { name: /Voltar para seleção de área/ }).click();
    await expect(page).toHaveURL("/casos/novo");
  });

  test("etapa de contexto oferece a criação real do caso", async ({ page }) => {
    await page.getByRole("link", { name: "Cível" }).click();
    await expect(page.getByLabel("Título do caso")).toBeVisible();
    await expect(page.getByLabel("Tipo do caso")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar caso" }),
    ).toBeEnabled();
  });
});
