import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CheckoutClient } from "@/components/booking/checkout-client";
import {
  formatLongDate,
  formatTime,
} from "@/lib/booking";
import { getReservationForUser } from "@/server/reservations";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Confirmar pago",
  description: "Completa el pago demo de tu reserva en Fullcanchas.",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const reservation = await getReservationForUser(id, session.user.id);

  if (!reservation) {
    notFound();
  }

  if (reservation.status === "PAID") {
    redirect(`/reserva/${reservation.id}/confirmacion`);
  }

  if (reservation.status !== "PENDING") {
    redirect("/perfil");
  }

  return (
    <CheckoutClient
      reservationId={reservation.id}
      courtName={reservation.court.name}
      courtAddress={reservation.court.address}
      typeName={reservation.court.type.name}
      dateLabel={formatLongDate(reservation.startsAt)}
      timeLabel={`${formatTime(reservation.startsAt)} – ${formatTime(
        new Date(reservation.startsAt.getTime() + 60 * 60 * 1000),
      )} hrs`}
      amount={reservation.priceAtBooking}
      customerName={session.user.name}
      customerEmail={session.user.email}
      expiresAt={reservation.expiresAt?.toISOString() ?? null}
    />
  );
}
