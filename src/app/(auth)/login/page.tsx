import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Ingresa a tu cuenta de Fullcanchas para reservar y gestionar tus canchas.",
};

function safeRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/reservar";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();

  if (session) {
    redirect("/reservar");
  }

  const { next } = await searchParams;

  return <LoginForm redirectTo={safeRedirect(next)} />;
}
