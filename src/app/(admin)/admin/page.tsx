import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CircleDollarSign,
  Clock3,
  Landmark,
  TrendingUp,
  Users,
} from "lucide-react";

import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCLP,
  formatShortDate,
  formatTime,
} from "@/lib/booking";
import { getAdminDashboardStats } from "@/server/reservations";

export const metadata: Metadata = {
  title: "Panel de administración",
  description: "Resumen operativo de Fullcanchas.",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const occupancy = stats.activeCourts
    ? Math.min(
        100,
        Math.round((stats.todayReservations / (stats.activeCourts * 13)) * 100),
      )
    : 0;

  const metrics = [
    {
      label: "Ingresos del mes",
      value: formatCLP(stats.monthRevenue),
      detail: "Reservas pagadas",
      icon: CircleDollarSign,
      tone: "bg-primary text-primary-foreground",
    },
    {
      label: "Reservas hoy",
      value: String(stats.todayReservations),
      detail: `${occupancy}% de ocupación estimada`,
      icon: CalendarDays,
      tone: "bg-accent text-accent-foreground",
    },
    {
      label: "Pagos pendientes",
      value: String(stats.pendingCount),
      detail: "Bloqueos de 10 minutos",
      icon: Clock3,
      tone: "bg-warning/20 text-warning-foreground dark:text-warning",
    },
    {
      label: "Canchas activas",
      value: String(stats.activeCourts),
      detail: `${stats.totalPaid} ${
        stats.totalPaid === 1 ? "reserva pagada" : "reservas pagadas"
      }`,
      icon: Landmark,
      tone: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Resumen operativo
          </p>
          <h1 className="mt-1 text-3xl font-semibold uppercase sm:text-4xl">
            Panel del club
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Todo lo que necesitas saber para la jornada de hoy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/canchas">
              <Landmark data-icon="inline-start" />
              Gestionar canchas
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/admin/reservas">
              Ver reservas
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="border-border/70 bg-card/70">
              <CardContent className="space-y-4 pt-5">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {metric.label}
                  </p>
                  <span
                    className={`grid size-8 place-items-center rounded-lg ${metric.tone}`}
                  >
                    <Icon className="size-4" />
                  </span>
                </div>
                <div>
                  <p className="font-display text-3xl font-medium">
                    {metric.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                Reservas recientes
              </CardTitle>
              <CardDescription>
                Últimos movimientos registrados en el club.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/reservas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recent.length ? (
              <div className="divide-y divide-border">
                {stats.recent.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                        <CalendarDays className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {reservation.court.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {reservation.user?.name ?? "Bloqueo de administración"}{" "}
                          · {formatShortDate(reservation.startsAt)} ·{" "}
                          {formatTime(reservation.startsAt)} hrs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ReservationStatusBadge status={reservation.status} />
                      <span className="font-display text-sm font-medium">
                        {formatCLP(reservation.priceAtBooking)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aún no hay reservas registradas.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                Ocupación de hoy
              </CardTitle>
              <CardDescription>
                {stats.todayReservations} de {stats.activeCourts * 13} bloques
                ocupados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <p className="font-display text-4xl font-medium">{occupancy}%</p>
                <span className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="size-3.5" />
                  En vivo
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Incluye reservas pagadas, pendientes y bloqueos administrativos
                de la jornada.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="secondary"
                className="w-full justify-between rounded-xl"
              >
                <Link href="/admin/canchas">
                  <span className="flex items-center gap-2">
                    <CalendarPlus className="size-4" />
                    Bloquear un horario
                  </span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full justify-between rounded-xl"
              >
                <Link href="/admin/reservas?estado=PAID">
                  <span className="flex items-center gap-2">
                    <Users className="size-4" />
                    Ver reservas pagadas
                  </span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full">
              Demo
            </Badge>
            Los pagos son simulados. Conecta un proveedor real en{" "}
            <span className="font-mono">PaymentProvider</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
