import { randomUUID } from "node:crypto";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const adminAccounts = [
  {
    email: "admin@fullcanchas.com",
    name: "Administrador del Sistema",
  },
  {
    email: "gerente@fullcanchas.com",
    name: "Gerente General",
  },
];

const demoPlayer = {
  email: "jugador@fullcanchas.cl",
  name: "Jugador Demo",
  password: "Jugador1234!",
};

const adminPassword = "Admin1234!";

const courtTypes = [
  {
    name: "Fútbol 7 (Pasto Sintético)",
    description:
      "Ideal para partidos amistosos. Iluminación profesional y superficie de última generación.",
    pricePerHour: 30000,
    imageUrl: "/images/canchas/futbol-7.webp",
    courts: [
      { name: "Sintético 1", address: "Sector A1" },
      { name: "Sintético 2", address: "Sector A2" },
    ],
  },
  {
    name: "Fútbol 11 (Césped Natural)",
    description:
      "Campo reglamentario, vestuarios de lujo. Perfecto para torneos.",
    pricePerHour: 50000,
    imageUrl: "/images/canchas/futbol-11.webp",
    courts: [
      { name: "Estadio 1", address: "Campo Principal" },
      { name: "Estadio 2", address: "Campo Trasero" },
    ],
  },
  {
    name: "Cancha de Fútbol Sala",
    description:
      "Cancha indoor con piso pulido. Rápida y técnica, ideal para pases cortos.",
    pricePerHour: 30000,
    imageUrl: "/images/canchas/futbol-sala.webp",
    courts: [
      { name: "Sala Techada 1", address: "Pabellón Interior" },
      { name: "Sala Techada 2", address: "Pabellón Interior" },
    ],
  },
  {
    name: "Cancha de Padel",
    description:
      "Pista de cristal de última generación. Ideal para dobles con iluminación nocturna.",
    pricePerHour: 20000,
    imageUrl: "/images/canchas/padel.webp",
    courts: [
      { name: "Padel Vidrio 1", address: "Pista 1" },
      { name: "Padel Vidrio 2", address: "Pista 2" },
    ],
  },
  {
    name: "Cancha de Basquetbol",
    description:
      "Piso de goma deportiva antideslizante. Aros profesionales y graderías.",
    pricePerHour: 25000,
    imageUrl: "/images/canchas/basquetbol.webp",
    courts: [
      { name: "Basket 1", address: "Patio Principal" },
      { name: "Basket 2", address: "Gimnasio" },
    ],
  },
  {
    name: "Cancha de Tenis (Arcilla)",
    description:
      "Superficie de alto rendimiento. Incluye arriendo de implementos.",
    pricePerHour: 15000,
    imageUrl: "/images/canchas/tenis.webp",
    courts: [
      { name: "Arcilla 1", address: "Zona Exteriores" },
      { name: "Arcilla 2", address: "Zona Exteriores" },
    ],
  },
];

async function upsertUser({
  email,
  name,
  password,
  role,
}: {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
}) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, role, status: "ACTIVE", emailVerified: true, banned: false },
    });
    return existing;
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      role,
      status: "ACTIVE",
      emailVerified: true,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: passwordHash,
        },
      },
    },
  });
}

async function main() {
  console.log("Cargando datos iniciales de Fullcanchas...");

  for (const admin of adminAccounts) {
    await upsertUser({
      ...admin,
      password: adminPassword,
      role: "admin",
    });
    console.log(`Admin listo: ${admin.email}`);
  }

  await upsertUser({ ...demoPlayer, role: "user" });
  console.log(`Jugador demo listo: ${demoPlayer.email}`);

  for (const type of courtTypes) {
    const courtType = await prisma.courtType.upsert({
      where: { name: type.name },
      update: {
        description: type.description,
        pricePerHour: type.pricePerHour,
        imageUrl: type.imageUrl,
      },
      create: {
        name: type.name,
        description: type.description,
        pricePerHour: type.pricePerHour,
        imageUrl: type.imageUrl,
      },
    });

    for (const court of type.courts) {
      const existingCourt = await prisma.court.findFirst({
        where: { name: court.name, typeId: courtType.id },
      });

      if (existingCourt) {
        await prisma.court.update({
          where: { id: existingCourt.id },
          data: { address: court.address, status: "ACTIVE" },
        });
      } else {
        await prisma.court.create({
          data: {
            name: court.name,
            address: court.address,
            status: "ACTIVE",
            typeId: courtType.id,
          },
        });
      }
    }

    console.log(`Tipo de cancha listo: ${type.name} (${type.courts.length} canchas)`);
  }

  console.log("Seed completado.");
  console.log(`Admin: ${adminAccounts[0].email} / ${adminPassword}`);
  console.log(`Jugador: ${demoPlayer.email} / ${demoPlayer.password}`);
}

main()
  .catch((error) => {
    console.error("Error en el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
