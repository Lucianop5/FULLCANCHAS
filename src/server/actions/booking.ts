"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  BookingError,
  cancelReservation,
  confirmReservationPayment,
  createPendingReservation,
  getAvailability,
} from "@/server/reservations";
import { requireUser } from "@/server/session";

const availabilityInput = z.object({
  courtId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createPendingInput = z.object({
  courtId: z.string().min(1),
  startsAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Horario inválido"),
});

const reservationInput = z.object({
  reservationId: z.string().min(1),
});

function errorMessage(error: unknown) {
  if (error instanceof BookingError) {
    return error.message;
  }

  console.error(error);
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export async function getAvailabilityAction(input: {
  courtId: string;
  date: string;
}) {
  await requireUser();

  const parsed = availabilityInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Datos de disponibilidad inválidos." };
  }

  try {
    const availability = await getAvailability(
      parsed.data.courtId,
      parsed.data.date,
    );
    return { ok: true as const, availability };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function createPendingReservationAction(input: {
  courtId: string;
  startsAt: string;
}) {
  const session = await requireUser();
  const parsed = createPendingInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Datos de reserva inválidos." };
  }

  try {
    const reservation = await createPendingReservation({
      userId: session.user.id,
      courtId: parsed.data.courtId,
      startsAtIso: parsed.data.startsAt,
    });

    revalidatePath("/reservar");
    revalidatePath("/perfil");

    return { ok: true as const, reservationId: reservation.id };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function confirmPaymentAction(input: { reservationId: string }) {
  const session = await requireUser();
  const parsed = reservationInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Reserva inválida." };
  }

  try {
    await confirmReservationPayment(
      parsed.data.reservationId,
      session.user.id,
    );

    revalidatePath("/perfil");
    revalidatePath("/admin");
    revalidatePath(`/checkout/${parsed.data.reservationId}`);

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function cancelReservationAction(input: { reservationId: string }) {
  const session = await requireUser();
  const parsed = reservationInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Reserva inválida." };
  }

  try {
    await cancelReservation(parsed.data.reservationId, session.user.id);

    revalidatePath("/perfil");
    revalidatePath("/reservar");
    revalidatePath("/admin");
    revalidatePath("/admin/reservas");

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}
