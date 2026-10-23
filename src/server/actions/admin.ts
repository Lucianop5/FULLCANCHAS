"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ReservationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import {
  blockSlot,
  BookingError,
  updateReservationStatus,
} from "@/server/reservations";
import { requireAdmin } from "@/server/session";
import { buildSlotStart } from "@/lib/booking";

function errorMessage(error: unknown) {
  if (error instanceof BookingError) {
    return error.message;
  }

  console.error(error);
  return "Ocurrió un error inesperado.";
}

const priceInput = z.object({
  typeId: z.string().min(1),
  price: z.coerce.number().int().min(0).max(10_000_000),
});

export async function updateCourtTypePriceAction(input: {
  typeId: string;
  price: number;
}) {
  await requireAdmin();
  const parsed = priceInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Ingresa un precio válido." };
  }

  try {
    await prisma.courtType.update({
      where: { id: parsed.data.typeId },
      data: { pricePerHour: parsed.data.price },
    });

    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    revalidatePath("/");

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

const courtInput = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio").max(80),
  address: z.string().trim().min(2, "La dirección es obligatoria").max(160),
  typeId: z.string().min(1),
  status: z.enum(["ACTIVE", "MAINTENANCE"]),
});

export async function createCourtAction(input: {
  name: string;
  address: string;
  typeId: string;
  status: "ACTIVE" | "MAINTENANCE";
}) {
  await requireAdmin();
  const parsed = courtInput.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.court.create({ data: parsed.data });
    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function updateCourtAction(input: {
  id: string;
  name: string;
  address: string;
  typeId: string;
  status: "ACTIVE" | "MAINTENANCE";
}) {
  await requireAdmin();
  const parsed = courtInput.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.court.update({
      where: { id: input.id },
      data: parsed.data,
    });
    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

const deleteCourtInput = z.object({
  id: z.string().min(1),
});

export async function deleteCourtAction(input: { id: string }) {
  await requireAdmin();
  const parsed = deleteCourtInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Cancha inválida." };
  }

  try {
    const court = await prisma.court.findUnique({
      where: { id: parsed.data.id },
      include: { _count: { select: { reservations: true } } },
    });

    if (!court) {
      return { ok: false as const, error: "Cancha no encontrada." };
    }

    if (court._count.reservations > 0) {
      return {
        ok: false as const,
        error:
          "No puedes eliminar una cancha con reservas. Ponla en mantenimiento.",
      };
    }

    await prisma.court.delete({ where: { id: court.id } });

    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function toggleCourtStatusAction(input: { id: string }) {
  await requireAdmin();

  try {
    const court = await prisma.court.findUnique({ where: { id: input.id } });

    if (!court) {
      return { ok: false as const, error: "Cancha no encontrada." };
    }

    await prisma.court.update({
      where: { id: court.id },
      data: {
        status: court.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE",
      },
    });

    revalidatePath("/admin/canchas");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

const blockInput = z.object({
  courtId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hour: z.coerce.number().int().min(9).max(21),
  notes: z.string().trim().max(255).optional(),
});

export async function blockSlotAction(input: {
  courtId: string;
  date: string;
  hour: number;
  notes?: string;
}) {
  const session = await requireAdmin();
  const parsed = blockInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Datos de bloqueo inválidos." };
  }

  try {
    const startsAt = buildSlotStart(parsed.data.date, parsed.data.hour);
    await blockSlot({
      adminId: session.user.id,
      courtId: parsed.data.courtId,
      startsAtIso: startsAt.toISOString(),
      notes: parsed.data.notes,
    });

    revalidatePath("/admin/canchas");
    revalidatePath("/admin/reservas");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

const statusInput = z.object({
  reservationId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "CANCELLED", "BLOCKED"]),
});

export async function updateReservationStatusAction(input: {
  reservationId: string;
  status: ReservationStatus;
}) {
  await requireAdmin();
  const parsed = statusInput.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Estado inválido." };
  }

  try {
    await updateReservationStatus(
      parsed.data.reservationId,
      parsed.data.status,
    );
    revalidatePath("/admin/reservas");
    revalidatePath("/admin");
    revalidatePath("/perfil");
    revalidatePath("/reservar");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}
