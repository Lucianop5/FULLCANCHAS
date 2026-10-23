"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/#canchas", label: "Canchas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#club", label: "El club" },
  { href: "/#contacto", label: "Contacto" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SiteHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Sesión cerrada");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Fullcanchas, ir al inicio"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-bold tracking-tight text-primary-foreground">
            FC
          </span>
          <span className="font-display text-lg font-semibold tracking-[0.08em] uppercase">
            Fullcanchas
          </span>
          <span className="size-1.5 rounded-full bg-accent transition-transform group-hover:scale-150" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {user ? (
            <>
              {isAdmin ? (
                <Button
                  asChild
                  variant="ghost"
                  className="hidden rounded-full lg:inline-flex"
                >
                  <Link href="/admin">
                    <LayoutDashboard data-icon="inline-start" />
                    Admin
                  </Link>
                </Button>
              ) : null}
              <Button
                asChild
                variant="ghost"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link href="/perfil">
                  <UserRound data-icon="inline-start" />
                  Mi perfil
                </Link>
              </Button>
              <Button asChild className="hidden rounded-full sm:inline-flex">
                <Link href="/reservar">
                  Reservar
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="size-9 rounded-full p-0"
                    aria-label="Abrir menú de usuario"
                  >
                    <span className="text-[11px] font-bold">
                      {initials(user.name)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">
                      <UserRound />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reservar">
                      <ArrowUpRight />
                      Reservar cancha
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard />
                        Panel de administración
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={handleSignOut}
                  >
                    <LogOut />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild className="hidden rounded-full sm:inline-flex">
                <Link href="/reservar">
                  Reservar
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <SheetHeader className="p-6 pb-2">
                <SheetTitle className="font-display text-2xl tracking-wide uppercase">
                  Fullcanchas
                </SheetTitle>
                <SheetDescription>
                  Tu próximo partido empieza acá.
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3" aria-label="Menú móvil">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      href="/perfil"
                      className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                    >
                      Mi perfil
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                      >
                        Administración
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                {user ? (
                  <>
                    <div className="mb-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Button asChild size="xl">
                      <Link href="/reservar">Reservar una cancha</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={handleSignOut}
                    >
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="xl">
                      <Link href="/login">Ingresar</Link>
                    </Button>
                    <Button asChild size="xl">
                      <Link href="/registro">Crear cuenta</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
