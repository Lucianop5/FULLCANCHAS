import "server-only";

import { Prisma, ReservationStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { getPaymentProvider } from "@/server/payments";
import {
  buildDaySlots,
  endOfLocalDay,
  getSlotKey,
  isCancellable,
  isValidDateKey,
  isValidSlotStart,
  PENDING_HOLD_MINUTES,
  startOfLocalDay,
} from "@/lib/booking";

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

const activeStatuses: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.PAID,
  ReservationStatus.BLOCKED,
];

export async function expireStalePendingReservations() {
  await prisma.reservation.updateMany({
    where: {
      status: ReservationStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    data: {
      status: ReservationStatus.CANCELLED,
      activeSlotKey: null,
      cancelledAt: new Date(),
    },
  });
}

export async function getBookingCatalog() {
  const courtTypes = await prisma.courtType.findMany({
    orderBy: { name: "asc" },
    include: {
      courts: {
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      },
    },
  });

  return courtTypes.map((type) => ({
    id: type.id,
    name: type.name,
    description: type.description,
    pricePerHour: type.pricePerHour,
    imageUrl: type.imageUrl,
    courts: type.courts.map((court) => ({
      id: court.id,
      name: court.name,
      address: court.address,
    })),
  }));
}

export async function getAvailability(courtId: string, dateKey: string) {
  if (!isValidDateKey(dateKey)) {
    throw new BookingError("La fecha seleccionada no es válida.");
  }

  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { type: true },
  });

  if (!court || court.status !== "ACTIVE") {
    throw new BookingError("La cancha seleccionada no está disponible.");
  }

  await expireStalePendingReservations();

  const reservations = await prisma.reservation.findMany({
    where: {
      courtId,
      startsAt: {
        gte: startOfLocalDay(dateKey),
        lte: endOfLocalDay(dateKey),
      },
      status: { in: activeStatuses },
    },
    select: { startsAt: true },
  });

  const taken = new Set(
    reservations.map((reservation) => reservation.startsAt.getTime()),
  );
  const now = Date.now();

  return {
    courtId: court.id,
    courtName: court.name,
    typeName: court.type.name,
    imageUrl: court.type.imageUrl,
    address: court.address,
    pricePerHour: court.type.pricePerHour,
    date: dateKey,
    slots: buildDaySlots(dateKey).map((slot) => {
      const isTaken = taken.has(slot.startsAt.getTime());
      const isPast = slot.startsAt.getTime() <= now;

      return {
        startsAt: slot.startsAt.toISOString(),
        label: slot.label,
        available: !isTaken && !isPast,
        reason: isTaken ? "reservado" : isPast ? "pasado" : null,
      };
    }),
  };
}

export async function createPendingReservation({
  userId,
  courtId,
  startsAtIso,
}: {
  userId: string;
  courtId: string;
  startsAtIso: string;
}) {
  const startsAt = new Date(startsAtIso);

  if (Number.isNaN(startsAt.getTime())) {
    throw new BookingError("El horario seleccionado no es válido.");
  }

  if (!isValidSlotStart(startsAt)) {
    throw new BookingError("El horario seleccionado está fuera del horario del club.");
  }

  if (startsAt.getTime() <= Date.now()) {
    throw new BookingError("No puedes reservar un horario que ya pasó.");
  }

  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { type: true },
  });

  if (!court || court.status !== "ACTIVE") {
    throw new BookingError("La cancha seleccionada no está disponible.");
  }

  await expireStalePendingReservations();

  const activeSlotKey = getSlotKey(courtId, startsAt);

  try {
    return await prisma.reservation.create({
      data: {
        userId,
        courtId,
        startsAt,
        status: ReservationStatus.PENDING,
        priceAtBooking: court.type.pricePerHour,
        activeSlotKey,
        expiresAt: new Date(
          Date.now() + PENDING_HOLD_MINUTES * 60 * 1000,
        ),
      },
      include: {
        court: { include: { type: true } },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BookingError(
        "Ese horario acaba de ser reservado. Elige otro bloque.",
      );
    }

    throw error;
  }
}

export async function getReservationForUser(
  reservationId: string,
  userId: string,
) {
  return prisma.reservation.findFirst({
    where: { id: reservationId, userId },
    include: {
      court: { include: { type: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function confirmReservationPayment(
  reservationId: string,
  userId: string,
) {
  await expireStalePendingReservations();

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
    include: {
      court: { include: { type: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!reservation || !reservation.user) {
    throw new BookingError("No encontramos esta reserva.");
  }

  if (reservation.status === ReservationStatus.PAID) {
    return reservation;
  }

  if (reservation.status !== ReservationStatus.PENDING) {
    throw new BookingError("Esta reserva ya no está pendiente de pago.");
  }

  if (reservation.expiresAt && reservation.expiresAt.getTime() < Date.now()) {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.CANCELLED,
        activeSlotKey: null,
        cancelledAt: new Date(),
      },
    });
    throw new BookingError(
      "La reserva expiró. Vuelve a elegir un horario disponible.",
    );
  }

  const provider = getPaymentProvider();
  const payment = await provider.createPayment({
    reservationId: reservation.id,
    amount: reservation.priceAtBooking,
    currency: "CLP",
    customerEmail: reservation.user.email,
    customerName: reservation.user.name,
    description: `${reservation.court.name} · ${reservation.startsAt.toISOString()}`,
  });

  if (!payment.success) {
    throw new BookingError(
      payment.message ?? "El pago no pudo ser procesado. Intenta nuevamente.",
    );
  }

  return prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: ReservationStatus.PAID,
      paidAt: payment.paidAt,
      paymentReference: payment.reference,
      expiresAt: null,
    },
    include: {
      court: { include: { type: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function cancelReservation(
  reservationId: string,
  userId: string,
) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
  });

  if (!reservation) {
    throw new BookingError("No encontramos esta reserva.");
  }

  if (
    reservation.status !== ReservationStatus.PAID &&
    reservation.status !== ReservationStatus.PENDING
  ) {
    throw new BookingError("Esta reserva ya no se puede cancelar.");
  }

  if (!isCancellable(reservation.startsAt, reservation.status)) {
    throw new BookingError(
      "No puedes cancelar con menos de 2 horas de anticipación.",
    );
  }

  return prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: ReservationStatus.CANCELLED,
      activeSlotKey: null,
      cancelledAt: new Date(),
      expiresAt: null,
    },
  });
}

export async function getUserReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId, status: { not: ReservationStatus.BLOCKED } },
    orderBy: { startsAt: "desc" },
    include: {
      court: { include: { type: true } },
    },
  });
}

export async function getUpcomingReservation(userId: string) {
  return prisma.reservation.findFirst({
    where: {
      userId,
      startsAt: { gte: new Date() },
      status: { in: [ReservationStatus.PAID, ReservationStatus.PENDING] },
    },
    orderBy: { startsAt: "asc" },
    include: {
      court: { include: { type: true } },
    },
  });
}

export type AdminReservationFilters = {
  status?: ReservationStatus;
  courtId?: string;
  from?: string;
  to?: string;
  query?: string;
};

export async function getAdminReservations(filters: AdminReservationFilters = {}) {
  await expireStalePendingReservations();

  const where: Prisma.ReservationWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.courtId) {
    where.courtId = filters.courtId;
  }

  if (filters.from && isValidDateKey(filters.from)) {
    where.startsAt = {
      ...(where.startsAt as object),
      gte: startOfLocalDay(filters.from),
    };
  }

  if (filters.to && isValidDateKey(filters.to)) {
    where.startsAt = {
      ...(where.startsAt as object),
      lte: endOfLocalDay(filters.to),
    };
  }

  if (filters.query) {
    where.OR = [
      { user: { name: { contains: filters.query } } },
      { user: { email: { contains: filters.query } } },
      { court: { name: { contains: filters.query } } },
      { paymentReference: { contains: filters.query } },
    ];
  }

  return prisma.reservation.findMany({
    where,
    orderBy: { startsAt: "desc" },
    take: 250,
    include: {
      court: { include: { type: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAdminDashboardStats() {
  await expireStalePendingReservations();

  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const monthKey = today.slice(0, 7);
  const [monthYear, monthNumber] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(monthYear, monthNumber, 0)).getUTCDate();
  const monthStart = startOfLocalDay(`${monthKey}-01`);
  const monthEnd = endOfLocalDay(
    `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  );

  const [
    activeCourts,
    todayReservations,
    pendingCount,
    monthRevenue,
    totalPaid,
    recent,
  ] = await Promise.all([
    prisma.court.count({ where: { status: "ACTIVE" } }),
    prisma.reservation.count({
      where: {
        startsAt: { gte: startOfLocalDay(today), lte: endOfLocalDay(today) },
        status: { in: activeStatuses },
      },
    }),
    prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
    prisma.reservation.aggregate({
      where: {
        status: ReservationStatus.PAID,
        startsAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { priceAtBooking: true },
    }),
    prisma.reservation.count({ where: { status: ReservationStatus.PAID } }),
    prisma.reservation.findMany({
      orderBy: { startsAt: "desc" },
      take: 8,
      include: {
        court: { include: { type: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    activeCourts,
    todayReservations,
    pendingCount,
    monthRevenue: monthRevenue._sum.priceAtBooking ?? 0,
    totalPaid,
    recent,
  };
}

export async function blockSlot({
  adminId,
  courtId,
  startsAtIso,
  notes,
}: {
  adminId: string;
  courtId: string;
  startsAtIso: string;
  notes?: string;
}) {
  const startsAt = new Date(startsAtIso);

  if (
    Number.isNaN(startsAt.getTime()) ||
    !isValidSlotStart(startsAt) ||
    startsAt.getTime() <= Date.now()
  ) {
    throw new BookingError("Selecciona un horario futuro válido.");
  }

  await expireStalePendingReservations();

  try {
    return await prisma.reservation.create({
      data: {
        courtId,
        startsAt,
        status: ReservationStatus.BLOCKED,
        priceAtBooking: 0,
        activeSlotKey: getSlotKey(courtId, startsAt),
        createdById: adminId,
        notes,
      },
      include: { court: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BookingError("Ese horario ya está ocupado o bloqueado.");
    }

    throw error;
  }
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { court: true },
  });

  if (!reservation) {
    throw new BookingError("No encontramos esta reserva.");
  }

  if (reservation.status === status) {
    return reservation;
  }

  if (status === ReservationStatus.CANCELLED) {
    return prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status,
        activeSlotKey: null,
        cancelledAt: new Date(),
        expiresAt: null,
      },
    });
  }

  const activeSlotKey = getSlotKey(reservation.courtId, reservation.startsAt);

  try {
    return await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status,
        activeSlotKey,
        cancelledAt: null,
        expiresAt:
          status === ReservationStatus.PENDING
            ? new Date(Date.now() + PENDING_HOLD_MINUTES * 60 * 1000)
            : null,
        paidAt:
          status === ReservationStatus.PAID
            ? (reservation.paidAt ?? new Date())
            : reservation.paidAt,
        paymentReference:
          status === ReservationStatus.PAID
            ? (reservation.paymentReference ?? "ADMIN-MANUAL")
            : reservation.paymentReference,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BookingError(
        "No puedes reactivar esta reserva: el horario ya está ocupado.",
      );
    }

    throw error;
  }
}

export async function getAdminCourts() {
  return prisma.court.findMany({
    orderBy: [{ type: { name: "asc" } }, { name: "asc" }],
    include: { type: true },
  });
}

export async function getAdminCourtTypes() {
  return prisma.courtType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courts: true } } },
  });
}

export async function getBlockedSlots() {
  return prisma.reservation.findMany({
    where: { status: ReservationStatus.BLOCKED },
    orderBy: { startsAt: "asc" },
    take: 40,
    include: { court: { include: { type: true } } },
  });
}
