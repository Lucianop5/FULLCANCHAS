"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ redirectTo = "/reservar" }: { redirectTo?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    });

    if (error) {
      toast.error(
        error.message === "Invalid email or password"
          ? "Correo o contraseña incorrectos."
          : (error.message ?? "No pudimos iniciar sesión."),
      );
      return;
    }

    toast.success("¡Bienvenido de vuelta!");
    const destination =
      data?.user.role === "admin" && redirectTo === "/reservar"
        ? "/admin"
        : redirectTo;
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Bienvenido de vuelta
        </p>
        <h1 className="text-4xl font-semibold uppercase">Inicia sesión</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Entra para reservar tu próxima cancha y revisar tus partidos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.cl"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <span className="text-xs text-muted-foreground">
              Mínimo 8 caracteres
            </span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <LogIn data-icon="inline-start" />
          )}
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3.5 text-xs leading-5 text-muted-foreground">
        <p className="font-medium text-foreground">Cuentas de demostración</p>
        <p className="mt-1">
          Jugador: <span className="font-mono">jugador@fullcanchas.cl</span> /{" "}
          <span className="font-mono">Jugador1234!</span>
        </p>
        <p>
          Admin: <span className="font-mono">admin@fullcanchas.com</span> /{" "}
          <span className="font-mono">Admin1234!</span>
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
