import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";

import { ReservationStatus } from "@/generated/prisma/enums";
import {
  CLUB_TIMEZONE,
  reservationStatusLabels,
  type ReservationStatusValue,
} from "@/lib/booking";
import { getAdminReservations } from "@/server/reservations";
import { getSession } from "@/server/session";

const statusValues = Object.values(ReservationStatus);

function parseStatus(value: string | null) {
  return value && statusValues.includes(value as ReservationStatus)
    ? (value as ReservationStatus)
    : undefined;
}

function escapeCsv(value: string | number) {
  const text = String(value);

  if (/[;"\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return new Response("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reservations = await getAdminReservations({
    status: parseStatus(searchParams.get("estado")),
    courtId: searchParams.get("cancha") ?? undefined,
    from: searchParams.get("desde") ?? undefined,
    to: searchParams.get("hasta") ?? undefined,
    query: searchParams.get("q")?.trim() || undefined,
  });

  const header = [
    "ID",
    "Fecha",
    "Hora",
    "Cancha",
    "Tipo",
    "Cliente",
    "Correo",
    "Estado",
    "Monto CLP",
    "Referencia",
  ];

  const rows = reservations.map((reservation) => {
    const local = new TZDate(reservation.startsAt, CLUB_TIMEZONE);

    return [
      reservation.id,
      format(local, "yyyy-MM-dd"),
      format(local, "HH:mm"),
      reservation.court.name,
      reservation.court.type.name,
      reservation.user?.name ?? "Bloqueo administrativo",
      reservation.user?.email ?? "",
      reservationStatusLabels[
        reservation.status as ReservationStatusValue
      ],
      reservation.priceAtBooking,
      reservation.paymentReference ?? "",
    ];
  });

  const paidTotal = reservations
    .filter((reservation) => reservation.status === ReservationStatus.PAID)
    .reduce((total, reservation) => total + reservation.priceAtBooking, 0);

  const csv = `\uFEFF${[
    header,
    ...rows,
    [],
    ["Total pagado (CLP)", paidTotal],
  ]
    .map((row) => row.map(escapeCsv).join(";"))
    .join("\r\n")}`;

  const filename = `reservas-fullcanchas-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
