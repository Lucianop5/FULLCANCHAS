import type { Metadata } from "next";
import {
  CalendarX2,
  Landmark,
  Layers3,
  Power,
  Wrench,
} from "lucide-react";

import { BlockSlotDialog } from "@/components/admin/block-slot-dialog";
import { CourtDialog } from "@/components/admin/court-dialog";
import { CourtStatusToggle } from "@/components/admin/court-status-toggle";
import { CourtTypePriceEditor } from "@/components/admin/court-type-price-editor";
import { DeleteCourtButton } from "@/components/admin/delete-court-button";
import { UnblockSlotButton } from "@/components/admin/unblock-slot-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  localDateKey,
} from "@/lib/booking";
import {
  getAdminCourtTypes,
  getAdminCourts,
  getBlockedSlots,
} from "@/server/reservations";

export const metadata: Metadata = {
  title: "Canchas y precios",
  description: "Gestiona canchas, precios y bloqueos de horarios.",
};

export default async function AdminCourtsPage() {
  const [courtTypes, courts, blockedSlots] = await Promise.all([
    getAdminCourtTypes(),
    getAdminCourts(),
    getBlockedSlots(),
  ]);

  const now = new Date();
  const futureBlocks = blockedSlots.filter(
    (reservation) => reservation.startsAt >= now,
  );
  const activeCourts = courts.filter((court) => court.status === "ACTIVE");
  const typeOptions = courtTypes.map((type) => ({
    id: type.id,
    name: type.name,
  }));
  const courtOptions = courts.map((court) => ({
    id: court.id,
    name: court.name,
    typeName: court.type.name,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Operación del club
          </p>
          <h1 className="mt-1 text-3xl font-semibold uppercase sm:text-4xl">
            Canchas y precios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra el catálogo, los valores por hora y los bloqueos de
            disponibilidad.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BlockSlotDialog courts={courtOptions} today={localDateKey()} />
          <CourtDialog courtTypes={typeOptions} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">{courts.length}</p>
              <p className="text-xs text-muted-foreground">Canchas totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
              <Power className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {activeCourts.length}
              </p>
              <p className="text-xs text-muted-foreground">Canchas activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="flex items-center gap-3 pt-5">
            <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning-foreground dark:text-warning">
              <CalendarX2 className="size-4" />
            </span>
            <div>
              <p className="font-display text-2xl font-medium">
                {futureBlocks.length}
              </p>
              <p className="text-xs text-muted-foreground">Bloqueos próximos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers3 className="size-4 text-muted-foreground" />
          <h2 className="text-xl font-medium uppercase">
            Tipos de cancha y precios
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courtTypes.map((type) => (
            <Card key={type.id} className="border-border/70">
              <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-display text-lg font-medium tracking-wide uppercase">
                    {type.name}
                  </CardTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {type._count.courts} canchas
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 min-h-10 leading-5">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourtTypePriceEditor
                  typeId={type.id}
                  typeName={type.name}
                  initialPrice={type.pricePerHour}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-muted-foreground" />
            <h2 className="text-xl font-medium uppercase">Canchas</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {courts.length} registradas
          </span>
        </div>

        <Card className="overflow-hidden border-border/70 py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cancha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.name}</TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      {court.type.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {court.address}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCLP(court.type.pricePerHour)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          court.status === "ACTIVE"
                            ? "rounded-full border-success/30 bg-success/10 text-success"
                            : "rounded-full border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning"
                        }
                      >
                        {court.status === "ACTIVE" ? "Activa" : "Mantenimiento"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <CourtDialog
                          courtTypes={typeOptions}
                          court={{
                            id: court.id,
                            name: court.name,
                            address: court.address,
                            typeId: court.typeId,
                            status: court.status,
                          }}
                        />
                        <CourtStatusToggle
                          courtId={court.id}
                          status={court.status}
                        />
                        <DeleteCourtButton
                          courtId={court.id}
                          courtName={court.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-muted-foreground" />
            <h2 className="text-xl font-medium uppercase">Bloqueos activos</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {futureBlocks.length} próximos
          </span>
        </div>

        {futureBlocks.length ? (
          <Card className="overflow-hidden border-border/70 py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureBlocks.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">
                        {reservation.court.name}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {reservation.court.type.name}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">
                        {formatShortDate(reservation.startsAt)}
                      </TableCell>
                      <TableCell>
                        {formatTime(reservation.startsAt)} –{" "}
                        {formatTime(
                          new Date(
                            reservation.startsAt.getTime() + 60 * 60 * 1000,
                          ),
                        )}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">
                        {reservation.notes ?? "Sin motivo registrado"}
                      </TableCell>
                      <TableCell className="text-right">
                        <UnblockSlotButton reservationId={reservation.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed border-border/80 bg-card/50">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-muted">
                <CalendarX2 className="size-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">No hay bloqueos próximos</p>
              <p className="text-xs text-muted-foreground">
                Los horarios bloqueados aparecerán aquí hasta que los liberes.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
