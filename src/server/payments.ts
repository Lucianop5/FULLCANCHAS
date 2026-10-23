export type PaymentRequest = {
  reservationId: string;
  amount: number;
  currency: "CLP";
  customerEmail: string;
  customerName: string;
  description: string;
};

export type PaymentResult = {
  success: boolean;
  reference: string;
  paidAt: Date;
  message?: string;
};

export interface PaymentProvider {
  id: string;
  label: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
}

class DemoPaymentProvider implements PaymentProvider {
  id = "demo";
  label = "Pago demo";

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      reference: `DEMO-${request.reservationId.slice(-8).toUpperCase()}`,
      paidAt: new Date(),
    };
  }
}

const providers: Record<string, PaymentProvider> = {
  demo: new DemoPaymentProvider(),
};

export function getPaymentProvider(): PaymentProvider {
  const providerId = process.env.PAYMENT_PROVIDER ?? "demo";
  return providers[providerId] ?? providers.demo;
}
