"use client";

import { useRouter } from "next/navigation";
import { CalendarX2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { blockSlotAction } from "@/server/actions/admin";
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

type CourtOption = {
  id: string;
  name: string;
  typeName: string;
};

const hours = Array.from({ length: 13 }, (_, index) => index + 9);

export function BlockSlotDialog({
  courts,
  today,
}: {
  courts: CourtOption[];
  today: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [hour, setHour] = useState("19");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetValues() {
    setCourtId(courts[0]?.id ?? "");
    setDate(today);
    setHour("19");
    setNotes("");
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setIsSaving(true);

    try {
      const result = await blockSlotAction({
        courtId,
        date,
        hour: Number(hour),
        notes: notes.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("Horario bloqueado.");
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
        <Button variant="outline" className="rounded-full">
          <CalendarX2 data-icon="inline-start" />
          Bloquear horario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bloquear un horario</DialogTitle>
          <DialogDescription>
            El bloqueo ocupa el slot para que ningún jugador pueda reservarlo.
            Úsalo para mantenimiento, eventos o uso interno.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cancha</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una cancha" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name} · {court.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="block-date">Fecha</Label>
              <Input
                id="block-date"
                type="date"
                min={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {String(value).padStart(2, "0")}:00 –{" "}
                      {String(value + 1).padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block-notes">Motivo (opcional)</Label>
            <Input
              id="block-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. Mantenimiento de iluminación"
              maxLength={255}
            />
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
            disabled={isSaving || !courtId || !date}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : null}
            {isSaving ? "Bloqueando..." : "Bloquear horario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
