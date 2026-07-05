import { expect, test } from "@playwright/test";
import { loginAsDevelopmentUser } from "./auth-helper";

test.describe("Onboarding de escritório", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDevelopmentUser(page);
    await page.goto("/onboarding/subconta");
  });

  test("exige os dados principais e chega à confirmação", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Qual o nome do escritório?" }),
    ).toBeVisible();

    await page
      .getByPlaceholder("Ex: Almeida & Dias Advocacia")
      .fill("Silva & Ramos Advocacia");
    await page.getByRole("button", { name: "Continuar" }).click();

    const continueQualification = page.getByRole("button", {
      name: "Continuar",
    });
    await page.getByRole("button", { name: "Cível" }).click();
    await expect(continueQualification).toBeDisabled();
    await page.getByRole("button", { name: "2-5" }).click();
    await page.getByRole("button", { name: "Planilha" }).click();
    await page
      .getByPlaceholder("Em uma frase: o que mais trava o escritório hoje?")
      .fill("Organizar prazos e documentos de casos ativos.");
    await continueQualification.click();

    await expect(
      page.getByRole("heading", { name: "Identidade do escritório" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    const continueAdmin = page.getByRole("button", { name: "Continuar" });
    await page.getByPlaceholder("Nome do responsável").fill("Marina Silva");
    await page.getByPlaceholder("admin@escritorio.com").fill("email-invalido");
    await expect(continueAdmin).toBeDisabled();
    await page
      .getByPlaceholder("admin@escritorio.com")
      .fill("marina@silvaramos.test");
    await continueAdmin.click();

    await expect(
      page.getByRole("heading", { name: "Confirme os dados" }),
    ).toBeVisible();
    await expect(page.getByText("Silva & Ramos Advocacia")).toBeVisible();
    await expect(page.getByText("marina@silvaramos.test")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar escritório →" }),
    ).toBeEnabled();
  });
});
