import Link from "next/link";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contacto" className="border-t border-border/70 bg-card/50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              FC
            </span>
            <span className="font-display text-xl font-semibold tracking-[0.08em] uppercase">
              Fullcanchas
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Un club deportivo para jugar, competir y juntarse. Reserva tu
            cancha, llega y juega: nosotros nos encargamos del resto.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:border-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              <Camera className="size-4" />
            </a>
            <a
              href="mailto:hola@fullcanchas.cl"
              className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:border-foreground hover:text-foreground"
              aria-label="Correo"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Explorar
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/#canchas" className="hover:text-foreground">
                Canchas y precios
              </Link>
            </li>
            <li>
              <Link href="/#como-funciona" className="hover:text-foreground">
                Cómo funciona
              </Link>
            </li>
            <li>
              <Link href="/reservar" className="hover:text-foreground">
                Reservar ahora
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                Mi cuenta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Visítanos
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-foreground dark:text-accent" />
              <span>Av. Club Deportivo 123, Santiago</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent-foreground dark:text-accent" />
              <span>+56 2 2345 6789</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent-foreground dark:text-accent" />
              <span>hola@fullcanchas.cl</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Fullcanchas. Todos los derechos reservados.</p>
          <p>Lunes a domingo · 09:00 a 22:00 hrs</p>
        </div>
      </div>
    </footer>
  );
}
