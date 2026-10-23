"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Landmark,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/canchas", label: "Canchas y precios", icon: Landmark },
];

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        mobile
          ? "flex gap-1 overflow-x-auto"
          : "flex flex-col gap-1",
      )}
      aria-label="Navegación de administración"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
