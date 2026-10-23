import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const highlights = [
  "Disponibilidad en tiempo real",
  "Confirmación inmediata",
  "Cancelación flexible hasta 2 horas antes",
];

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-[#0e1b16] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pitch-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1b16] via-[#0e1b16]/80 to-emerald-950/60" />
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              FC
            </span>
            <span className="font-display text-xl font-semibold tracking-[0.08em] uppercase">
              Fullcanchas
            </span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase">
            <Sparkles className="size-3.5 text-accent" />
            Club deportivo · Santiago
          </p>
          <h2 className="mt-5 font-display text-5xl leading-[0.95] font-medium uppercase">
            Tu cancha,
            <br />
            tu equipo,
            <br />
            <span className="text-accent">tu momento.</span>
          </h2>
          <p className="mt-5 text-sm leading-6 text-white/60">
            Reserva en segundos y llega a jugar. Sin llamadas, sin vueltas y con
            todo listo antes de que llegues.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-3 text-sm text-white/75"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/10">
                  <Check className="size-3.5 text-accent" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-white/40">
          <ShieldCheck className="size-4" />
          Tus datos y reservas están protegidos.
        </div>
      </div>

      <div className="relative flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Fullcanchas · Lunes a domingo, 09:00 a
          22:00
        </div>
      </div>
    </div>
  );
}
