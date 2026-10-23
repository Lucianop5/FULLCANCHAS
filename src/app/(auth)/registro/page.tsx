import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta en Fullcanchas y reserva canchas en segundos.",
};

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/reservar");
  }

  return <RegisterForm />;
}
