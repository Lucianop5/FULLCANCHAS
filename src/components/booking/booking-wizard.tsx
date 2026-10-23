"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createPendingReservationAction,
  getAvailabilityAction,
} from "@/server/actions/booking";
import { CourtImage } from "@/components/court-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCLP,
  formatLongDate,
  formatTime,
  PENDING_HOLD_MINUTES,
} from "@/lib/booking";

type CourtTypeOption = {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  imageUrl: string | null;
  courts: Array<{ id: string; name: string; address: string }>;
};

type DayOption = {
  key: string;
  weekday: string;
  day: string;
  month: string;
  isToday: boolean;
};

type AvailabilitySlot = {
  startsAt: string;
  label: string;
  available: boolean;
  reason: string | null;
};

type Availability = {
  courtId: string;
  courtName: string;
  typeName: string;
  imageUrl: string | null;
  address: string;
  pricePerHour: number;
  date: string;
  slots: AvailabilitySlot[];
};

const steps = [
  { id: 1, label: "Cancha" },
  { id: 2, label: "Horario" },
  { id: 3, label: "Resumen" },
] as const;

export function BookingWizard({
  courtTypes,
  days,
}: {
  courtTypes: CourtTypeOption[];
  days: DayOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [typeId, setTypeId] = useState(courtTypes[0]?.id ?? "");
  const [courtId, setCourtId] = useState(
    courtTypes[0]?.courts[0]?.id ?? "",
  );
  const [date, setDate] = useState(days[0]?.key ?? "");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = useMemo(
    () => courtTypes.find((type) => type.id === typeId),
    [courtTypes, typeId],
  );
  const selectedCourt = useMemo(
    () => selectedType?.courts.find((court) => court.id === courtId),
    [selectedType, courtId],
  );
  const selectedDay = days.find((day) => day.key === date);
  const price = availability?.pricePerHour ?? selectedType?.pricePerHour ?? 0;

  function selectType(nextTypeId: string) {
    const nextType = courtTypes.find((type) => type.id === nextTypeId);
    setTypeId(nextTypeId);
    setCourtId(nextType?.courts[0]?.id ?? "");
    setSlot(null);
    setAvailability(null);
  }

  function selectCourt(nextCourtId: string) {
    setCourtId(nextCourtId);
    setSlot(null);
    setAvailability(null);
  }

  function loadAvailability(nextCourtId = courtId, nextDate = date) {
    if (!nextCourtId) {
      toast.error("Selecciona una cancha para continuar.");
      return;
    }

    startTransition(async () => {
      const result = await getAvailabilityAction({
        courtId: nextCourtId,
        date: nextDate,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setAvailability(result.availability);
      setStep(2);
    });
  }

  function selectDate(nextDate: string) {
    setDate(nextDate);
    setSlot(null);

    if (!courtId) {
      return;
    }

    startTransition(async () => {
      const result = await getAvailabilityAction({
        courtId,
        date: nextDate,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setAvailability(result.availability);
    });
  }

  async function confirmReservation() {
    if (!slot || !selectedCourt) {
      toast.error("Selecciona un horario disponible.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPendingReservationAction({
        courtId: selectedCourt.id,
        startsAt: slot.startsAt,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      router.push(`/checkout/${result.reservationId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Reserva tu cancha
          </p>
          <h1 className="text-4xl font-semibold uppercase sm:text-5xl">
            Arma tu próximo partido.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Elige la cancha, bloquea tu horario y confirma el pago. El bloque
            queda reservado para ti por {PENDING_HOLD_MINUTES} minutos.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          Pago demo · sin cobro real
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((item, index) => {
          const active = step === item.id;
          const complete = step > item.id;

          return (
            <div key={item.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : complete
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[10px]">
                  {complete ? <Check className="size-3" /> : item.id}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={`h-px flex-1 ${step > item.id ? "bg-success/40" : "bg-border"}`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {step === 1 ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium uppercase">
                    1. Elige el deporte
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {courtTypes.length} disciplinas
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {courtTypes.map((type) => {
                    const active = type.id === typeId;

                    return (
                      <button
                        key={type.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectType(type.id)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-lg"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <CourtImage
                              src={type.imageUrl}
                              alt={`Cancha de ${type.name}`}
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg font-medium tracking-wide uppercase">
                              {type.name}
                            </p>
                            <p
                              className={`mt-1 line-clamp-2 text-xs leading-5 ${
                                active
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {type.description}
                            </p>
                          </div>
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                              active
                                ? "border-primary-foreground/30 bg-primary-foreground/10"
                                : "border-border"
                            }`}
                          >
                            {active ? <Check className="size-3" /> : null}
                          </span>
                        </div>
                        <div
                          className={`mt-4 flex items-center justify-between border-t pt-3 text-xs ${
                            active
                              ? "border-primary-foreground/15 text-primary-foreground/70"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span>{type.courts.length} canchas</span>
                          <span className="font-semibold">
                            {formatCLP(type.pricePerHour)} / h
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium uppercase">
                    2. Elige la cancha
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {selectedType?.name}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedType?.courts.map((court) => {
                    const active = court.id === courtId;

                    return (
                      <button
                        key={court.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectCourt(court.id)}
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                            <CourtImage
                              src={selectedType?.imageUrl}
                              alt={`Cancha ${court.name}`}
                              sizes="56px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-lg font-medium tracking-wide uppercase">
                              {court.name}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                              <MapPin className="size-3.5 shrink-0" />
                              {court.address}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                            active
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border"
                          }`}
                        >
                          {active ? <Check className="size-3" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="flex justify-end">
                <Button
                  size="xl"
                  className="rounded-full"
                  onClick={() => loadAvailability()}
                  disabled={!courtId || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <CalendarDays data-icon="inline-start" />
                  )}
                  Ver horarios
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {selectedType?.name}
                  </p>
                  <h2 className="font-display text-2xl font-medium tracking-wide uppercase">
                    {selectedCourt?.name}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Cambiar cancha
                </Button>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  Elige el día
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map((day) => {
                    const active = day.key === date;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectDate(day.key)}
                        className={`min-w-16 shrink-0 rounded-xl border px-3 py-2.5 text-center transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`block text-[10px] font-semibold tracking-wide uppercase ${
                            active
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {day.weekday}
                        </span>
                        <span className="mt-0.5 block font-display text-2xl leading-none">
                          {day.day}
                        </span>
                        <span
                          className={`mt-0.5 block text-[10px] uppercase ${
                            active
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {day.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-wide uppercase">
                    Elige la hora
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatCLP(price)} / hora
                  </span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className="h-11 rounded-xl" />
                    ))}
                  </div>
                ) : availability?.slots.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {availability.slots.map((item) => {
                      const active = slot?.startsAt === item.startsAt;

                      return (
                        <button
                          key={item.startsAt}
                          type="button"
                          aria-pressed={active}
                          disabled={!item.available}
                          title={
                            item.reason === "reservado"
                              ? "Horario no disponible"
                              : item.reason === "pasado"
                                ? "Horario pasado"
                                : undefined
                          }
                          onClick={() => setSlot(item)}
                          className={`relative h-11 rounded-xl border text-sm font-medium transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : item.available
                                ? "border-border bg-card hover:border-primary/50 hover:bg-muted"
                                : "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/40 line-through"
                          }`}
                        >
                          {item.label}
                          {active ? (
                            <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-accent text-accent-foreground">
                              <Check className="size-2.5" />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No hay horarios para esta fecha.
                  </div>
                )}
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  size="xl"
                  className="rounded-full"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Volver
                </Button>
                <Button
                  size="xl"
                  className="rounded-full"
                  disabled={!slot}
                  onClick={() => setStep(3)}
                >
                  Continuar al resumen
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 && slot ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground">Último paso</p>
                <h2 className="font-display text-2xl font-medium tracking-wide uppercase">
                  Revisa tu reserva
                </h2>
              </div>

              <Card className="overflow-hidden border-border/80">
                <div className="relative h-40">
                  <CourtImage
                    src={availability?.imageUrl ?? selectedType?.imageUrl}
                    alt={`Cancha ${selectedCourt?.name ?? ""}`}
                    sizes="(max-width: 1024px) 100vw, 720px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-white/80 uppercase">
                    <MapPin className="size-3.5" />
                    {selectedCourt?.address}
                  </div>
                </div>
                <CardHeader className="gap-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-full">
                      {selectedType?.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning"
                    >
                      Esperando pago
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-3xl font-medium tracking-wide uppercase">
                    {selectedCourt?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        <CalendarDays className="size-3.5" />
                        Fecha
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatLongDate(new Date(slot.startsAt))}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        <Clock3 className="size-3.5" />
                        Horario
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatTime(new Date(slot.startsAt))} –{" "}
                        {formatTime(
                          new Date(
                            new Date(slot.startsAt).getTime() + 60 * 60 * 1000,
                          ),
                        )}{" "}
                        hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <span className="text-sm text-muted-foreground">
                      Total a pagar
                    </span>
                    <span className="font-display text-3xl font-medium">
                      {formatCLP(price)}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                    <p>
                      Al continuar, bloquearemos este horario por{" "}
                      {PENDING_HOLD_MINUTES} minutos. Podrás cancelar sin costo
                      hasta 2 horas antes del partido.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  variant="outline"
                  size="xl"
                  className="rounded-full"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Cambiar horario
                </Button>
                <Button
                  size="xl"
                  className="rounded-full"
                  onClick={confirmReservation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Sparkles data-icon="inline-start" />
                  )}
                  {isSubmitting ? "Bloqueando horario..." : "Ir a pagar"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border-border/80 bg-card/80">
            <div className="bg-primary px-5 py-4 text-primary-foreground dark:bg-[#12241d] dark:text-white">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-60">
                Tu reserva
              </p>
              <p className="mt-1 font-display text-xl font-medium tracking-wide uppercase">
                {selectedCourt?.name ?? "Selecciona una cancha"}
              </p>
            </div>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Deporte</span>
                  <span className="text-right font-medium">
                    {selectedType?.name ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="text-right font-medium capitalize">
                    {selectedDay
                      ? `${selectedDay.weekday} ${selectedDay.day} ${selectedDay.month}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Hora</span>
                  <span className="text-right font-medium">
                    {slot ? `${formatTime(new Date(slot.startsAt))} hrs` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Duración</span>
                  <span className="text-right font-medium">1 hora</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-medium">
                  {formatCLP(price)}
                </span>
              </div>
              <p className="text-[11px] leading-4 text-muted-foreground">
                Precio por hora. El monto queda guardado al confirmar la
                reserva.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
