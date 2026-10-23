"use client";

import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createCourtAction, updateCourtAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CourtTypeOption = { id: string; name: string };

type CourtValues = {
  id: string;
  name: string;
  address: string;
  typeId: string;
  status: "ACTIVE" | "MAINTENANCE";
};

export function CourtDialog({
  courtTypes,
  court,
}: {
  courtTypes: CourtTypeOption[];
  court?: CourtValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(court?.name ?? "");
  const [address, setAddress] = useState(
    court?.address ?? "Av. Club Deportivo 123, Santiago",
  );
  const [typeId, setTypeId] = useState(
    court?.typeId ?? courtTypes[0]?.id ?? "",
  );
  const [status, setStatus] = useState<"ACTIVE" | "MAINTENANCE">(
    court?.status ?? "ACTIVE",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetValues() {
    setName(court?.name ?? "");
    setAddress(court?.address ?? "Av. Club Deportivo 123, Santiago");
    setTypeId(court?.typeId ?? courtTypes[0]?.id ?? "");
    setStatus(court?.status ?? "ACTIVE");
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setIsSaving(true);

    try {
      const result = court
        ? await updateCourtAction({
            id: court.id,
            name,
            address,
            typeId,
            status,
          })
        : await createCourtAction({ name, address, typeId, status });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success(court ? "Cancha actualizada." : "Cancha creada.");
      setOpen(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          resetValues();
        }
      }}
    >
      <DialogTrigger asChild>
        {court ? (
          <Button variant="outline" size="sm" className="rounded-full">
            <Pencil data-icon="inline-start" />
            Editar
          </Button>
        ) : (
          <Button className="rounded-full">
            <Plus data-icon="inline-start" />
            Nueva cancha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {court ? "Editar cancha" : "Crear una cancha"}
          </DialogTitle>
          <DialogDescription>
            {court
              ? "Actualiza los datos operativos de la cancha."
              : "Agrega una nueva cancha al catálogo del club."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="court-name">Nombre</Label>
            <Input
              id="court-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Sintético 3"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="court-address">Ubicación</Label>
            <Input
              id="court-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Ej. Sector A3"
              maxLength={160}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de cancha</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {courtTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "ACTIVE" | "MAINTENANCE")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activa</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !name.trim() || !address.trim() || !typeId}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : null}
            {isSaving ? "Guardando..." : court ? "Guardar cambios" : "Crear cancha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
