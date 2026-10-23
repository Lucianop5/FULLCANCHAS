import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  Download,
  Filter,
  Search,
  Timer,
} from "lucide-react";

import { ReservationStatusControl } from "@/components/admin/reservation-status-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCLP,
  formatShortDate,
  formatTime,
  reservationStatusLabels,
  type ReservationStatusValue,
} from "@/lib/booking";
import {
  getAdminCourts,
  getAdminReservations,
} from "@/server/reservations";

export const metadata: Metadata = {
  title: "Reservas",
  description: "Filtra, revisa y actualiza las reservas del club.",
};

const statusValues: ReservationStatusValue[] = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "BLOCKED",
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined) {
  return statusValues.includes(value as ReservationStatusValue)
    ? (value as ReservationStatusValue)
    : undefined;
}

function buildExportHref(filters: {
  status?: string;
  courtId?: string;
  from?: string;
  to?: string;
  query?: string;
}) {
  const params = new URLSearchParams();

  if (filters.status) params.set("estado", filters.status);
  if (filters.courtId) params.set("cancha", filters.courtId);
  if (filters.from) params.set("desde", filters.from);
  if (filters.to) params.set("hasta", filters.to);
  if (filters.query) params.set("q", filters.query);

  const query = params.toString();
  return `/api/admin/reservas/export${query ? `?${query}` : ""}`;
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = firstValue(params.estado);
  const status = parseStatus(rawStatus);
  const courtId = firstValue(params.cancha);
  const from = firstValue(params.desde);
  const to = firstValue(params.hasta);
  const query = firstValue(params.q)?.trim();

  const [reservations, courts] = await Promise.all([
    getAdminReservations({
      status,
      courtId,
      from,
      to,
      query,
    }),
    getAdminCourts(),
  ]);

  const paidTotal = reservations
    .filter((reservation) => reservation.status === "PAID")
    .reduce((total, reservation) => total + reservation.priceAtBooking, 0);
  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "PENDING",
  ).length;
  const exportHref = buildExportHref({
    status,
    courtId,
    from,
    to,
    query,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Movimientos del club
          </p>
          <h1 className="mt-1 text-3xl font-semibold uppercase sm:text-4xl">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa pagos, pendientes, cancelaciones y bloqueos administrativos.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={exportHref}>
            <Download data-icon="inline-start" />
            Exportar CSV
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <CalendarDays className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {reservations.length}
              </p>
              <p className="text-xs text-muted-foreground">Reservas filtradas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <CircleDollarSign className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {formatCLP(paidTotal)}
              </p>
              <p className="text-xs text-muted-foreground">Monto pagado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning-foreground dark:text-warning">
              <Timer className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pagos pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg font-medium tracking-wide uppercase">
            <Filter className="size-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1.2fr_0.9fr_0.9fr_auto]"
          >
            <div className="space-y-1.5">
              <Label htmlFor="q">Buscar</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  name="q"
                  defaultValue={query ?? ""}
                  placeholder="Cliente, correo, cancha o referencia"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                name="estado"
                defaultValue={status ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Todos</option>
                {statusValues.map((value) => (
                  <option key={value} value={value}>
                    {reservationStatusLabels[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cancha">Cancha</Label>
              <select
                id="cancha"
                name="cancha"
                defaultValue={courtId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Todas</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name} · {court.type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desde">Desde</Label>
              <Input
                id="desde"
                name="desde"
                type="date"
                defaultValue={from ?? ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hasta">Hasta</Label>
              <Input
                id="hasta"
                name="hasta"
                type="date"
                defaultValue={to ?? ""}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="rounded-full">
                Filtrar
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin/reservas">Limpiar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length ? (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm font-medium capitalize">
                        {formatShortDate(reservation.startsAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(reservation.startsAt)} –{" "}
                        {formatTime(
                          new Date(
                            reservation.startsAt.getTime() + 60 * 60 * 1000,
                          ),
                        )}{" "}
                        hrs
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {reservation.court.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.court.type.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      {reservation.user ? (
                        <>
                          <p className="text-sm font-medium">
                            {reservation.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.user.email}
                          </p>
                        </>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          Bloqueo administrativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ReservationStatusControl
                        reservationId={reservation.id}
                        status={reservation.status}
                      />
                    </TableCell>
                    <TableCell className="text-right font-display text-sm font-medium">
                      {formatCLP(reservation.priceAtBooking)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {reservation.paymentReference ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No hay reservas que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
