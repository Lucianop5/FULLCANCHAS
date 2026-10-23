import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/session";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  const initials = session.user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-svh bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              FC
            </span>
            <div>
              <p className="font-display text-sm font-semibold tracking-[0.1em] uppercase">
                Fullcanchas
              </p>
              <p className="text-[10px] text-muted-foreground">
                Administración
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 space-y-6 p-3">
          <AdminNav />
          <div className="space-y-1 border-t border-border pt-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-xl text-muted-foreground"
            >
              <Link href="/">
                <ArrowUpRight data-icon="inline-start" />
                Ver sitio público
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-2.5 py-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{session.user.name}</p>
              <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                <ShieldCheck className="size-2.5" />
                Administrador
              </p>
            </div>
          </div>
          <AdminSignOut />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  FC
                </span>
                <span className="font-display text-sm font-semibold tracking-[0.08em] uppercase">
                  Admin
                </span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Panel de administración
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/">
                  Ver sitio
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="border-t border-border/60 px-3 py-2 lg:hidden">
            <AdminNav mobile />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
