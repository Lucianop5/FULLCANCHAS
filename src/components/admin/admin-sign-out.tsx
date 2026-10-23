"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AdminSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Sesión cerrada");
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="w-full justify-start rounded-xl text-muted-foreground"
    >
      <LogOut data-icon="inline-start" />
      Cerrar sesión
    </Button>
  );
}
