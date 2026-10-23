"use client";

import { useRouter } from "next/navigation";
import { Loader2, Power, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { toggleCourtStatusAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function CourtStatusToggle({
  courtId,
  status,
}: {
  courtId: string;
  status: "ACTIVE" | "MAINTENANCE";
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isActive = status === "ACTIVE";

  async function handleToggle() {
    setIsPending(true);

    try {
      const result = await toggleCourtStatusAction({ id: courtId });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isActive ? "Cancha enviada a mantenimiento." : "Cancha activada.",
      );
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : isActive ? (
        <Wrench data-icon="inline-start" />
      ) : (
        <Power data-icon="inline-start" />
      )}
      {isPending
        ? "Actualizando..."
        : isActive
          ? "Mantenimiento"
          : "Activar"}
    </Button>
  );
}
