import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  MapPin,
  ReceiptText,
  Ticket,
  Trophy,
  Wallet,
} from "lucide-react";

import { CancelReservationButton } from "@/components/reservations/cancel-reservation-button";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatCLP,
  formatLongDate,
  formatShortDate,
  formatTime,
  isCancellable,
} from "@/lib/booking";
import {
  expireStalePendingReservations,
  getUserReservations,
} from "@/server/reservations";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Revisa tus próximas reservas, historial y datos de cuenta.",
};

export default async function ProfilePage() {
  const session = await requireUser();
  await expireStalePendingReservations();
  const reservations = await getUserReservations(session.user.id);
  const now = new Date();

  const upcoming = reservations
    .filter(
      (reservation) =>
        reservation.startsAt >= now &&
        (reservation.status === "PAID" || reservation.status === "PENDING"),
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const history = reservations.filter(
    (reservation) => !upcoming.some((item) => item.id === reservation.id),
  );

  const paidPast = history.filter(
    (reservation) =>
      reservation.status === "PAID" && reservation.startsAt < now,
  );
  const totalSpent = reservations
    .filter((reservation) => reservation.status === "PAID")
    .reduce((total, reservation) => total + reservation.priceAtBooking, 0);
  const nextReservation = upcoming[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Mi cuenta
          </p>
          <h1 className="text-4xl font-semibold uppercase sm:text-5xl">
            Hola, {session.user.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Revisa tus próximos partidos y tu historial en el club.
          </p>
        </div>
        <Button asChild size="xl" className="rounded-full">
          <Link href="/reservar">
            <CalendarPlus data-icon="inline-start" />
            Nueva reserva
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Ticket className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {upcoming.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Próximas reservas
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Trophy className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {paidPast.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Partidos jugados
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Wallet className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {formatCLP(totalSpent)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total invertido en juego
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium uppercase">Próximas reservas</h2>
              <Badge variant="secondary" className="rounded-full">
                {upcoming.length}
              </Badge>
            </div>

            {nextReservation ? (
              <Card className="overflow-hidden border-border/80">
                <div className="bg-primary px-5 py-4 text-primary-foreground dark:bg-[#12241d] dark:text-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-60">
                        Tu próximo partido
                      </p>
                      <p className="mt-1 font-display text-2xl font-medium tracking-wide uppercase">
                        {nextReservation.court.name}
                      </p>
                      <p className="text-xs text-primary-foreground/60 dark:text-white/60">
                        {nextReservation.court.type.name}
                      </p>
                    </div>
                    <ReservationStatusBadge
                      status={nextReservation.status}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                </div>
                <CardContent className="space-y-4 pt-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      <span>{formatLongDate(nextReservation.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock3 className="size-4 text-muted-foreground" />
                      {formatTime(nextReservation.startsAt)} hrs
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-muted-foreground" />
                      {nextReservation.court.address}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-display text-2xl font-medium">
                      {formatCLP(nextReservation.priceAtBooking)}
                    </p>
                    <div className="flex items-center gap-2">
                      {isCancellable(
                        nextReservation.startsAt,
                        nextReservation.status,
                      ) ? (
                        <CancelReservationButton
                          reservationId={nextReservation.id}
                          courtName={nextReservation.court.name}
                          startsAtLabel={`${formatShortDate(nextReservation.startsAt)} a las ${formatTime(nextReservation.startsAt)}`}
                        />
                      ) : null}
                      {nextReservation.status === "PAID" ? (
                        <Button asChild size="sm" className="rounded-full">
                          <Link
                            href={`/reserva/${nextReservation.id}/confirmacion`}
                          >
                            <ReceiptText data-icon="inline-start" />
                            Comprobante
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" className="rounded-full">
                          <Link href={`/checkout/${nextReservation.id}`}>
                            Ir a pagar
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/80 bg-card/50">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-muted">
                    <CalendarDays className="size-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-medium">No tienes reservas próximas</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Es un buen momento para armar el próximo partido.
                    </p>
                  </div>
                  <Button asChild className="mt-1 rounded-full">
                    <Link href="/reservar">Reservar una cancha</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {upcoming.length > 1 ? (
              <div className="space-y-2">
                {upcoming.slice(1).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                        <CalendarDays className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {reservation.court.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {formatShortDate(reservation.startsAt)} ·{" "}
                          {formatTime(reservation.startsAt)} hrs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ReservationStatusBadge status={reservation.status} />
                      {isCancellable(
                        reservation.startsAt,
                        reservation.status,
                      ) ? (
                        <CancelReservationButton
                          reservationId={reservation.id}
                          courtName={reservation.court.name}
                          startsAtLabel={`${formatShortDate(reservation.startsAt)} a las ${formatTime(reservation.startsAt)}`}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium uppercase">Historial</h2>
              <span className="text-xs text-muted-foreground">
                {history.length} reservas
              </span>
            </div>

            {history.length ? (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.7fr] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
                  <span>Cancha</span>
                  <span>Fecha</span>
                  <span>Estado</span>
                  <span className="text-right">Monto</span>
                </div>
                <div className="divide-y divide-border">
                  {history.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="grid gap-2 px-4 py-3.5 sm:grid-cols-[1.2fr_1fr_0.8fr_0.7fr] sm:items-center sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {reservation.court.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {reservation.court.type.name}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="capitalize">
                          {formatShortDate(reservation.startsAt)}
                        </p>
                        <p>{formatTime(reservation.startsAt)} hrs</p>
                      </div>
                      <div>
                        <ReservationStatusBadge status={reservation.status} />
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <span className="font-display text-base font-medium sm:hidden">
                          {formatCLP(reservation.priceAtBooking)}
                        </span>
                        <span className="hidden font-display text-base font-medium sm:inline">
                          {formatCLP(reservation.priceAtBooking)}
                        </span>
                        {reservation.status === "PAID" ? (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full"
                          >
                            <Link
                              href={`/reserva/${reservation.id}/confirmacion`}
                              aria-label="Ver comprobante"
                            >
                              <ReceiptText className="size-3.5" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Aún no tienes historial de reservas.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                Datos de cuenta
              </CardTitle>
              <CardDescription>
                Actualiza tu nombre visible en las reservas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings
                name={session.user.name}
                email={session.user.email}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-muted/30">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                Política de cancelación
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-5 text-muted-foreground">
              Puedes cancelar sin costo hasta 2 horas antes del inicio. Después
              de ese plazo, la reserva no se puede cancelar desde la web.
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
