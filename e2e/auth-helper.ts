import type { Page } from "@playwright/test";

export async function loginAsDevelopmentUser(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Entrar com usuário de desenvolvimento" })
    .click();
  await page.waitForURL(/\/(admin|workspace)(\/|$)/);
  await page.waitForLoadState("networkidle");
}
