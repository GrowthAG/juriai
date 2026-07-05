import { test, expect } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevelopmentUser(page);
  });

  test("carrega o console administrativo", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Console JuriAI" }),
    ).toBeVisible();
  });

  test("exibe os acessos principais", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Escritórios", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Planos", exact: true }),
    ).toBeVisible();
  });

  test("exibe os indicadores do console", async ({ page }) => {
    await expect(page.getByText("Escritórios ativos")).toBeVisible();
    await expect(page.getByText("Membros totais")).toBeVisible();
    await expect(page.getByText("Casos ativos")).toBeVisible();
    await expect(page.getByText("Uso de IA")).toBeVisible();
  });

  test("link de escritórios navega para /admin/subcontas", async ({ page }) => {
    await page
      .getByRole("link", { name: "Escritórios", exact: true })
      .click();
    await expect(page).toHaveURL("/admin/subcontas");
  });
});
