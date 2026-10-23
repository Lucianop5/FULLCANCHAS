"use client";

import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteCourtAction } from "@/server/actions/admin";
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

export function DeleteCourtButton({
  courtId,
  courtName,
}: {
  courtId: string;
  courtName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);

    try {
      const result = await deleteCourtAction({ id: courtId });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Cancha eliminada.");
      setOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground hover:text-destructive"
          aria-label={`Eliminar ${courtName}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {courtName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción quita la cancha del catálogo. Solo es posible si no
            tiene reservas asociadas; si ya tiene historial, ponla en
            mantenimiento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            {isPending ? "Eliminando..." : "Eliminar cancha"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
