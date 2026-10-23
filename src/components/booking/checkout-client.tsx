"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { confirmPaymentAction } from "@/server/actions/booking";
import { CourtImage } from "@/components/court-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCLP } from "@/lib/booking";

type CheckoutClientProps = {
  reservationId: string;
  courtName: string;
  courtAddress: string;
  typeName: string;
  imageUrl: string | null;
  dateLabel: string;
  timeLabel: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  expiresAt: string | null;
};

function secondsLeft(expiresAt: string | null) {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}

export function CheckoutClient({
  reservationId,
  courtName,
  courtAddress,
  typeName,
  imageUrl,
  dateLabel,
  timeLabel,
  amount,
  customerName,
  customerEmail,
  expiresAt,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [remaining, setRemaining] = useState(() => secondsLeft(expiresAt));

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const interval = setInterval(() => {
      setRemaining(secondsLeft(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const expired = remaining <= 0;

  async function handlePayment() {
    if (expired) {
      toast.error("La reserva expiró. Vuelve a elegir un horario.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await confirmPaymentAction({ reservationId });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("¡Pago confirmado! Tu cancha está reservada.");
      router.push(`/reserva/${reservationId}/confirmacion`);
      router.refresh();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link
        href="/reservar"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la selección de horarios
      </Link>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning"
          >
            <Timer className="size-3.5" />
            {expired
              ? "Reserva expirada"
              : `Bloqueada por ${minutes}:${String(seconds).padStart(2, "0")}`}
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            Pago demo
          </Badge>
        </div>
        <h1 className="text-4xl font-semibold uppercase sm:text-5xl">
          Confirma tu reserva.
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Este es un checkout de demostración: no se realizará ningún cobro
          real. Al confirmar, tu horario quedará pagado y asegurado.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden border-border/80 bg-card/80">
          <div className="relative h-44">
            <CourtImage
              src={imageUrl}
              alt={`Cancha ${courtName}`}
              sizes="(max-width: 1024px) 100vw, 520px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                {typeName}
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-wide text-white uppercase">
                {courtName}
              </p>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="font-display text-xl font-medium tracking-wide uppercase">
              Resumen de tu reserva
            </CardTitle>
            <CardDescription>Revisa los datos antes de pagar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Ubicación</span>
                <span className="text-right font-medium">{courtAddress}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Fecha</span>
                <span className="text-right font-medium">{dateLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Horario</span>
                <span className="text-right font-medium">{timeLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-right font-medium">1 hora</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Titular</span>
                <span className="text-right font-medium">{customerName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Correo</span>
                <span className="max-w-[220px] truncate text-right font-medium">
                  {customerEmail}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">
                Total a pagar
              </span>
              <span className="font-display text-3xl font-medium">
                {formatCLP(amount)}
              </span>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              <p>
                Precio guardado al momento de reservar. Cancelación sin costo
                hasta 2 horas antes del partido.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl font-medium tracking-wide uppercase">
                Pago
              </CardTitle>
              <span className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                <LockKeyhole className="size-3" />
                Entorno seguro
              </span>
            </div>
            <CardDescription>
              Ingresa los datos de la tarjeta de prueba.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl bg-[#12241d] p-5 text-white">
              <div className="absolute -top-12 -right-8 size-40 rounded-full border border-white/10" />
              <div className="absolute -right-4 -bottom-14 size-36 rounded-full bg-accent/20 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-lg tracking-[0.16em] uppercase">
                  Fullcanchas
                </span>
                <CreditCard className="size-6 text-accent" />
              </div>
              <p className="relative mt-8 font-mono text-lg tracking-[0.18em]">
                4242 4242 4242 4242
              </p>
              <div className="relative mt-5 flex items-end justify-between text-[10px] tracking-wide text-white/50 uppercase">
                <div>
                  <p>Titular</p>
                  <p className="mt-0.5 text-xs text-white">{customerName}</p>
                </div>
                <div className="text-right">
                  <p>Vence</p>
                  <p className="mt-0.5 text-xs text-white">12/30</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-number">Número de tarjeta</Label>
                <Input
                  id="card-number"
                  inputMode="numeric"
                  defaultValue="4242 4242 4242 4242"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-name">Nombre del titular</Label>
                <Input id="card-name" defaultValue={customerName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Vencimiento</Label>
                <Input id="card-expiry" defaultValue="12/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvv">CVV</Label>
                <Input id="card-cvv" defaultValue="123" />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Check className="size-3.5 text-success" />
                Pago demo habilitado
              </p>
              <p className="mt-1">
                Usa cualquier dato. La pasarela real se conectará mediante la
                interfaz <span className="font-mono">PaymentProvider</span>.
              </p>
            </div>

            <Button
              size="xl"
              className="w-full rounded-xl"
              onClick={handlePayment}
              disabled={isProcessing || expired}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <LockKeyhole data-icon="inline-start" />
              )}
              {isProcessing
                ? "Procesando pago..."
                : expired
                  ? "Reserva expirada"
                  : `Pagar ${formatCLP(amount)}`}
            </Button>

            {expired ? (
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href="/reservar">Elegir otro horario</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
