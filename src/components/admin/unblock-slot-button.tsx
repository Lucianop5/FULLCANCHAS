"use client";

import { useRouter } from "next/navigation";
import { Loader2, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { updateReservationStatusAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function UnblockSlotButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleUnblock() {
    setIsPending(true);

    try {
      const result = await updateReservationStatusAction({
        reservationId,
        status: "CANCELLED",
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Horario liberado.");
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
      onClick={handleUnblock}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        <Unlock data-icon="inline-start" />
      )}
      {isPending ? "Liberando..." : "Liberar"}
    </Button>
  );
}
