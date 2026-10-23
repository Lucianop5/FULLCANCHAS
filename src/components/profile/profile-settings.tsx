"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettings({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (value.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await authClient.updateUser({ name: value.trim() });

      if (error) {
        toast.error(error.message ?? "No pudimos actualizar tu perfil.");
        return;
      }

      toast.success("Perfil actualizado.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Nombre</Label>
        <Input
          id="profile-name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={80}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Correo</Label>
        <Input id="profile-email" value={email} disabled />
        <p className="text-[11px] text-muted-foreground">
          El correo no se puede modificar en esta versión.
        </p>
      </div>
      <Button
        onClick={handleSave}
        disabled={isSaving || value.trim() === name}
        className="w-full rounded-xl"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Save data-icon="inline-start" />
        )}
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
