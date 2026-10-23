"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { updateCourtTypePriceAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCLP } from "@/lib/booking";

export function CourtTypePriceEditor({
  typeId,
  typeName,
  initialPrice,
}: {
  typeId: string;
  typeName: string;
  initialPrice: number;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(String(initialPrice));
  const [isSaving, setIsSaving] = useState(false);

  const numericPrice = Number(price);
  const isValid =
    Number.isFinite(numericPrice) &&
    Number.isInteger(numericPrice) &&
    numericPrice >= 0;
  const hasChanged = numericPrice !== initialPrice;

  async function handleSave() {
    if (!isValid) {
      toast.error("Ingresa un precio válido en pesos.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCourtTypePriceAction({
        typeId,
        price: numericPrice,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Precio de ${typeName} actualizado.`);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Precio por hora
        </span>
        <span className="text-xs font-medium">{formatCLP(initialPrice)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            step={1000}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="pl-7"
            aria-label={`Precio por hora de ${typeName}`}
          />
        </div>
        <Button
          size="icon"
          className="shrink-0 rounded-lg"
          onClick={handleSave}
          disabled={isSaving || !hasChanged || !isValid}
          aria-label="Guardar precio"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save />
          )}
        </Button>
      </div>
      {!isValid ? (
        <p className="text-[11px] text-destructive">
          El precio debe ser un número entero en CLP.
        </p>
      ) : null}
    </div>
  );
}
