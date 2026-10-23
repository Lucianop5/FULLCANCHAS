import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatCLP,
  formatDateTime,
  formatLongDate,
  formatTime,
} from "@/lib/booking";
import { getReservationForUser } from "@/server/reservations";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Reserva confirmada",
  description: "Tu reserva en Fullcanchas está confirmada.",
};

export default async function ConfirmationPage({
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

  if (reservation.status === "PENDING") {
    redirect(`/checkout/${reservation.id}`);
  }

  if (reservation.status !== "PAID") {
    redirect("/perfil");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/20">
          <Check className="size-7" />
        </span>
        <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-success uppercase">
          Pago confirmado
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase sm:text-5xl">
          ¡Nos vemos en la cancha!
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Tu reserva quedó confirmada. Guarda este comprobante y llega 10
          minutos antes de tu horario.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden border-border/80">
        <div className="bg-primary px-6 py-5 text-primary-foreground dark:bg-[#12241d] dark:text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-60">
                Comprobante de reserva
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-wide uppercase">
                {reservation.court.name}
              </p>
            </div>
            <Badge className="rounded-full border-white/15 bg-white/10 text-white hover:bg-white/10">
              Pagada
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <CalendarDays className="size-3.5" />
                Fecha
              </p>
              <p className="mt-1.5 text-sm font-medium">
                {formatLongDate(reservation.startsAt)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <Clock3 className="size-3.5" />
                Horario
              </p>
              <p className="mt-1.5 text-sm font-medium">
                {formatTime(reservation.startsAt)} –{" "}
                {formatTime(
                  new Date(reservation.startsAt.getTime() + 60 * 60 * 1000),
                )}{" "}
                hrs
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <MapPin className="size-3.5" />
                Cancha
              </p>
              <p className="mt-1.5 text-sm font-medium">
                {reservation.court.type.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {reservation.court.address}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <ReceiptText className="size-3.5" />
                Referencia
              </p>
              <p className="mt-1.5 font-mono text-sm font-medium">
                {reservation.paymentReference ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {reservation.paidAt
                  ? formatDateTime(reservation.paidAt)
                  : "Pago demo"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total pagado</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pago demo · sin cobro real
              </p>
            </div>
            <p className="font-display text-3xl font-medium">
              {formatCLP(reservation.priceAtBooking)}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <p>
              Puedes cancelar sin costo hasta 2 horas antes del inicio. La
              cancelación libera el horario para otros jugadores.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="xl" className="rounded-full">
          <Link href="/perfil">Ver mis reservas</Link>
        </Button>
        <Button asChild variant="outline" size="xl" className="rounded-full">
          <Link href="/reservar">Reservar otra cancha</Link>
        </Button>
      </div>
    </div>
  );
}
