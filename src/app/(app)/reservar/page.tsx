import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { CourtImage } from "@/components/court-image";
import { Badge } from "@/components/ui/badge";
import { getUpcomingDays, formatDateTime } from "@/lib/booking";
import { getBookingCatalog, getUpcomingReservation } from "@/server/reservations";
import { requireUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Reservar una cancha",
  description:
    "Elige tu cancha, fecha y horario en Fullcanchas. Confirmación inmediata y pago demo.",
};

export default async function BookingPage() {
  const session = await requireUser();
  const [courtTypes, upcoming] = await Promise.all([
    getBookingCatalog(),
    getUpcomingReservation(session.user.id),
  ]);
  const days = getUpcomingDays(14);

  return (
    <>
      {upcoming ? (
        <div className="border-b border-border/60 bg-card/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                <CourtImage
                  src={upcoming.court.type.imageUrl}
                  alt={`Cancha ${upcoming.court.name}`}
                  sizes="40px"
                />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Tu próxima reserva
                </p>
                <p className="text-sm font-medium">
                  {upcoming.court.name} · {formatDateTime(upcoming.startsAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {upcoming.court.address}
              <Badge
                variant="outline"
                className="rounded-full border-success/30 bg-success/10 text-success"
              >
                {upcoming.status === "PAID" ? "Pagada" : "Pendiente"}
              </Badge>
            </div>
          </div>
        </div>
      ) : null}

      <BookingWizard courtTypes={courtTypes} days={days} />
    </>
  );
}
