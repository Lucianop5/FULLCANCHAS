"use client";

import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cancelReservationAction } from "@/server/actions/booking";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function CancelReservationButton({
  reservationId,
  courtName,
  startsAtLabel,
}: {
  reservationId: string;
  courtName: string;
  startsAtLabel: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleCancel() {
    setIsPending(true);

    try {
      const result = await cancelReservationAction({ reservationId });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Reserva cancelada. El horario quedó liberado.");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Ban data-icon="inline-start" />
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a cancelar <strong>{courtName}</strong> para{" "}
            <strong>{startsAtLabel}</strong>. El horario quedará disponible
            para otros jugadores. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Ban data-icon="inline-start" />
            )}
            {isPending ? "Cancelando..." : "Sí, cancelar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
