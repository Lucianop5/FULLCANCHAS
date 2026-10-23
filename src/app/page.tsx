import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  CircleDot,
  Clock3,
  CreditCard,
  Dumbbell,
  Lightbulb,
  MapPin,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { CourtImage } from "@/components/court-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CourtType = {
  name: string;
  surface: string;
  description: string;
  price: number;
  capacity: string;
  icon: LucideIcon;
  tone: string;
  imageUrl: string;
  imagePosition?: string;
};

const courtTypes: CourtType[] = [
  {
    name: "Fútbol 7",
    surface: "Pasto sintético",
    description: "Ideal para partidos amistosos. Iluminación profesional.",
    price: 30000,
    capacity: "14 jugadores",
    icon: CircleDot,
    tone: "from-emerald-950 via-emerald-900 to-emerald-800",
    imageUrl: "/images/canchas/futbol-7.webp",
  },
  {
    name: "Fútbol 11",
    surface: "Césped natural",
    description: "Campo reglamentario, vestuarios de lujo. Para torneos.",
    price: 50000,
    capacity: "22 jugadores",
    icon: Trophy,
    tone: "from-lime-950 via-emerald-900 to-teal-800",
    imageUrl: "/images/canchas/futbol-11.webp",
  },
  {
    name: "Fútbol sala",
    surface: "Indoor",
    description: "Piso pulido, juego rápido y técnico. Ideal para pases cortos.",
    price: 30000,
    capacity: "10 jugadores",
    icon: Zap,
    tone: "from-teal-950 via-cyan-900 to-sky-900",
    imageUrl: "/images/canchas/futbol-sala.webp",
    imagePosition: "object-bottom",
  },
  {
    name: "Pádel",
    surface: "Cristal",
    description: "Pista de última generación para dobles. Luz nocturna.",
    price: 20000,
    capacity: "4 jugadores",
    icon: Target,
    tone: "from-amber-950 via-orange-900 to-rose-900",
    imageUrl: "/images/canchas/padel.webp",
  },
  {
    name: "Básquetbol",
    surface: "Goma deportiva",
    description: "Piso antideslizante y aros profesionales. Partido garantizado.",
    price: 25000,
    capacity: "10 jugadores",
    icon: Dumbbell,
    tone: "from-orange-950 via-red-900 to-rose-950",
    imageUrl: "/images/canchas/basquetbol.webp",
  },
  {
    name: "Tenis",
    surface: "Arcilla",
    description: "Superficie de alto rendimiento. Incluye arriendo de implementos.",
    price: 15000,
    capacity: "2–4 jugadores",
    icon: Star,
    tone: "from-stone-950 via-amber-950 to-orange-900",
    imageUrl: "/images/canchas/tenis.webp",
  },
];

const steps = [
  {
    number: "01",
    title: "Elige tu cancha",
    description:
      "Fútbol, pádel, tenis o básquet. Compara superficies, precios y disponibilidad.",
    icon: CalendarDays,
  },
  {
    number: "02",
    title: "Bloquea tu horario",
    description:
      "Selecciona el día y la hora. El slot queda reservado para ti durante 10 minutos.",
    icon: Clock3,
  },
  {
    number: "03",
    title: "Paga y juega",
    description:
      "Confirma el pago demo, recibe tu comprobante y llega directo a la cancha.",
    icon: CreditCard,
  },
];

const amenities = [
  { icon: Lightbulb, label: "Iluminación LED profesional" },
  { icon: ShowerHead, label: "Vestuarios y duchas" },
  { icon: Car, label: "Estacionamiento gratuito" },
  { icon: Wifi, label: "Wi-Fi en zonas comunes" },
  { icon: ShieldCheck, label: "Acceso y reservas seguras" },
  { icon: Users, label: "Bar y zona de espera" },
];

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="contenido" className="flex-1">
        <section className="hero-glow relative overflow-hidden border-b border-border/60">
          <div className="fine-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
            <div className="space-y-7">
              <Badge
                variant="outline"
                className="gap-2 rounded-full border-primary/20 bg-background/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase backdrop-blur"
              >
                <Sparkles className="size-3.5 text-accent-foreground dark:text-accent" />
                Temporada 2026 · Reservas abiertas
              </Badge>

              <div className="space-y-5">
                <h1 className="text-balance text-5xl leading-[0.92] font-semibold uppercase sm:text-6xl lg:text-7xl">
                  Tu próximo{" "}
                  <span className="relative inline-block">
                    partido
                    <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-accent/80" />
                  </span>{" "}
                  empieza acá.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Reserva las mejores canchas de fútbol, pádel, tenis y más en
                  segundos. Disponibilidad real, pago simple y confirmación
                  inmediata.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl" className="rounded-full">
                  <Link href="/reservar">
                    Reservar una cancha
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="rounded-full bg-background/60 backdrop-blur"
                >
                  <Link href="#canchas">Ver canchas y precios</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="flex -space-x-2">
                    {["MJ", "AR", "CV", "+"].map((initials) => (
                      <span
                        key={initials}
                        className="grid size-7 place-items-center rounded-full border-2 border-background bg-secondary text-[9px] font-bold text-secondary-foreground"
                      >
                        {initials}
                      </span>
                    ))}
                  </span>
                  +2.000 partidos jugados
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-accent text-accent-foreground dark:text-accent" />
                  4,9 · 320 reseñas
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  Santiago, Chile
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="absolute -inset-8 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative rotate-1 rounded-[2rem] border border-white/10 bg-[#12241d] p-3 shadow-2xl shadow-emerald-950/25 transition-transform duration-500 hover:rotate-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-[#07110c]">
                  <CourtImage
                    src="/images/canchas/hero-cancha.webp"
                    alt="Vista aérea de una cancha de fútbol en Fullcanchas"
                    sizes="(max-width: 1024px) 90vw, 500px"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/20 to-[#07110c]/10" />
                  <div className="absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-white/10" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] font-medium tracking-wide text-white/90 backdrop-blur">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                    </span>
                    CANCHA 01 · DISPONIBLE
                  </div>

                  <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/15 bg-[#0c1712]/85 p-4 text-white shadow-xl backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-medium tracking-[0.16em] text-white/50 uppercase">
                          Tu próxima reserva
                        </p>
                        <p className="mt-1 font-display text-xl font-medium tracking-wide uppercase">
                          Sintético 1
                        </p>
                      </div>
                      <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Check className="size-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                      <CalendarDays className="size-3.5" />
                      Sáb 24 oct
                      <span className="text-white/25">/</span>
                      <Clock3 className="size-3.5" />
                      19:00 – 20:00
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                      <span className="text-[11px] text-white/50">
                        Fútbol 7 · 1 hora
                      </span>
                      <span className="font-display text-lg text-accent">
                        {currency.format(30000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 top-8 hidden rotate-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:block lg:-right-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Reserva segura
                    </p>
                    <p className="text-xs font-semibold">Confirmación inmediata</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-border/60 bg-background/60 backdrop-blur">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-border/60 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
              {[
                ["12", "canchas disponibles"],
                ["6", "deportes para elegir"],
                ["09–22", "horario todos los días"],
                ["10 min", "para completar tu reserva"],
              ].map(([value, label]) => (
                <div key={label} className="px-4 py-5 first:pl-0 last:pr-0 sm:px-6">
                  <p className="font-display text-2xl font-medium tracking-tight">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="canchas" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Elige tu campo de juego
                </p>
                <h2 className="text-balance text-4xl font-semibold uppercase sm:text-5xl">
                  Una cancha para cada forma de jugar.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Superficies cuidadas, iluminación de nivel y espacios pensados
                para que solo tengas que preocuparte del partido.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courtTypes.map((court) => {
                const Icon = court.icon;

                return (
                  <Card
                    key={court.name}
                    className="group overflow-hidden border-border/80 bg-card/70 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-emerald-950/5"
                  >
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <CourtImage
                        src={court.imageUrl}
                        alt={`Cancha de ${court.name} en Fullcanchas`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={`transition-transform duration-700 group-hover:scale-105 ${court.imagePosition ?? ""}`}
                        fallbackClassName={`bg-gradient-to-br ${court.tone}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge className="rounded-full border-white/20 bg-black/35 text-white backdrop-blur hover:bg-black/35">
                          {court.surface}
                        </Badge>
                      </div>
                      <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur">
                        <Icon className="size-4" />
                      </span>
                      <div className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                        {currency.format(court.price)} / hora
                      </div>
                    </div>
                    <CardHeader className="gap-1.5">
                      <CardTitle className="font-display text-2xl font-medium tracking-wide uppercase">
                        {court.name}
                      </CardTitle>
                      <CardDescription className="min-h-10 leading-5">
                        {court.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {court.capacity}
                      <span className="text-border">·</span>
                      <Clock3 className="size-3.5" />
                      1 hora por bloque
                    </CardContent>
                    <CardFooter className="mt-auto border-t border-border/60 bg-muted/30">
                      <Link
                        href="/reservar"
                        className="flex w-full items-center justify-between text-sm font-semibold transition-colors hover:text-foreground"
                      >
                        Reservar esta cancha
                        <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
                          <ArrowRight className="size-3.5" />
                        </span>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="scroll-mt-20 border-y border-border/60 bg-card/40 py-20 sm:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Simple, rápido, sin fricción
              </p>
              <h2 className="mt-3 text-balance text-4xl font-semibold uppercase sm:text-5xl">
                Reserva en tres pasos.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                Sin llamadas ni mensajes. Elige, bloquea y paga: tu cancha queda
                confirmada al instante.
              </p>
            </div>

            <div className="relative mt-12 grid gap-4 md:grid-cols-3">
              <div className="pointer-events-none absolute top-10 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-2xl border border-border/70 bg-background/80 p-6 backdrop-blur"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-display text-4xl font-medium text-border">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-medium tracking-wide uppercase">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="club" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-xl shadow-emerald-950/5 sm:p-10">
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <span className="size-1.5 rounded-full bg-accent" />
                  Club Fullcanchas
                </div>
                <p className="mt-6 font-display text-3xl leading-tight font-medium uppercase sm:text-4xl">
                  “Llegas con tu equipo. Nosotros ponemos la cancha, las luces
                  y el tercer tiempo.”
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
                  <div>
                    <p className="font-display text-3xl font-medium">4,9/5</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Valoración de jugadores
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-medium">6</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Disciplinas en un solo lugar
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Más que una cancha
              </p>
              <h2 className="mt-3 text-balance text-4xl font-semibold uppercase sm:text-5xl">
                Todo listo antes de que llegues.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Un club pensado para jugar sin fricción: estacionamiento,
                vestuarios, iluminación y una zona de espera para el equipo que
                llega temprano.
              </p>
              <ul className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {amenities.map((amenity) => {
                  const Icon = amenity.icon;

                  return (
                    <li
                      key={amenity.label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card">
                        <Icon className="size-3.5" />
                      </span>
                      {amenity.label}
                    </li>
                  );
                })}
              </ul>
              <Button asChild variant="outline" size="xl" className="mt-8 rounded-full">
                <Link href="/reservar">
                  Reservar una cancha
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-10 sm:py-16 dark:bg-[#12241d] dark:text-white">
            <div className="absolute -top-20 -right-16 size-72 rounded-full border border-white/10" />
            <div className="absolute -right-5 -bottom-24 size-64 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase opacity-60">
                  <Sparkles className="size-3.5" />
                  Tu cancha te espera
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold uppercase sm:text-5xl">
                  Arma el equipo. Nosotros ponemos la cancha.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 opacity-70">
                  Reserva en menos de un minuto. Sin inscripción, sin llamadas
                  y con cancelación flexible hasta 2 horas antes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href="/reservar">
                    Reservar ahora
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Link href="/login">Ya tengo cuenta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
