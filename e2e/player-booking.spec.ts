import { expect, test } from "@playwright/test";

test("a player can register, book, pay and cancel a reservation", async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@fullcanchas.cl`;

  await page.goto("/registro");
  await page.fill("#name", "Jugador E2E");
  await page.fill("#email", email);
  await page.fill("#password", "Jugador1234!");
  await page.fill("#confirmPassword", "Jugador1234!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/reservar$/);
  await expect(
    page.getByRole("heading", { name: /Arma tu pr/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Ver horarios/ }).click();
  await expect(
    page.getByRole("heading", { name: /Elige el d/ }),
  ).toBeVisible();

  const bookedCourt =
    (await page.locator("h2.font-display").first().textContent())?.trim() ?? "";
  expect(bookedCourt).not.toBe("");
  const daySection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: /Elige el d/ }) });
  await daySection.getByRole("button").nth(5).click();

  const availableSlots = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^\d{2}:00$/ });
  await expect(availableSlots.first()).toBeVisible({ timeout: 15_000 });
  await availableSlots.first().click();

  await page.getByRole("button", { name: /Continuar al resumen/ }).click();
  await expect(page.getByText("Revisa tu reserva")).toBeVisible();

  await page.getByRole("button", { name: /Ir a pagar/ }).click();
  await expect(page).toHaveURL(/\/checkout\//);
  await expect(page.getByText("Confirma tu reserva.")).toBeVisible();

  await page.getByRole("button", { name: /^Pagar \$/ }).click();
  await expect(page).toHaveURL(/\/confirmacion$/);
  await expect(page.getByText("Pago confirmado").first()).toBeVisible();

  await page.goto("/perfil");
  await expect(page.getByText("Tu próximo partido")).toBeVisible();
  await expect(page.getByText(bookedCourt).first()).toBeVisible();

  await page
    .getByRole("button", { name: "Cancelar", exact: true })
    .first()
    .click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Sí, cancelar" }).click();

  await expect(
    page.getByText("No tienes reservas próximas"),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Cancelada").first()).toBeVisible();
});
