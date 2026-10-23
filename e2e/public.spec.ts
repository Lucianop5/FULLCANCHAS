import { expect, test } from "@playwright/test";

test("public landing page loads and switches theme", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Tu pr/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Reservar ahora/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ingresar", exact: true }).first(),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Cambiar entre tema claro y oscuro" })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
