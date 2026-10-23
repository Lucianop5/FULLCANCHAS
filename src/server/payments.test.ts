import { afterEach, describe, expect, it, vi } from "vitest";

import { getPaymentProvider, type PaymentRequest } from "./payments";

const request: PaymentRequest = {
  reservationId: "reservation-12345678",
  amount: 25000,
  currency: "CLP",
  customerEmail: "jugador@fullcanchas.cl",
  customerName: "Jugador Demo",
  description: "Reserva Basket 1",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("payment provider", () => {
  it("returns the demo provider by default", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "demo");

    expect(getPaymentProvider().id).toBe("demo");
    expect(getPaymentProvider().label).toBe("Pago demo");
  });

  it("creates a successful demo payment with a reference", async () => {
    const result = await getPaymentProvider().createPayment(request);

    expect(result.success).toBe(true);
    expect(result.reference).toBe("DEMO-12345678");
    expect(result.paidAt).toBeInstanceOf(Date);
  });

  it("falls back to demo for an unknown provider", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "not-configured");

    expect(getPaymentProvider().id).toBe("demo");
  });
});
