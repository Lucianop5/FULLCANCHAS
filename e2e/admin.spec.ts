import { expect, test } from "@playwright/test";

test("an admin can open the dashboard and export reservations", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill("#email", "admin@fullcanchas.com");
  await page.fill("#password", "Admin1234!");
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Panel del club" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Canchas y precios" }).click();
  await expect(page).toHaveURL(/\/admin\/canchas$/);
  await expect(
    page.getByRole("heading", { name: "Canchas y precios" }),
  ).toBeVisible();
  await expect(page.getByText("Sintético 1").first()).toBeVisible();

  await page.getByRole("link", { name: "Reservas", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/reservas$/);
  await expect(
    page.getByRole("heading", { name: "Reservas" }),
  ).toBeVisible();

  const response = await page.request.get("/api/admin/reservas/export");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");

  const csv = await response.text();
  expect(csv).toContain("Cancha");
  expect(csv).toContain("Estado");
});
