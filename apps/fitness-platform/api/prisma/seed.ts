import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-gym" },
    update: { name: "Gimnasio Demo" },
    create: { slug: "demo-gym", name: "Gimnasio Demo" },
  });

  const trainer = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "trainer@demo.fit" } },
    update: {},
    create: {
      tenantId: tenant.id,
      role: "TRAINER",
      email: "trainer@demo.fit",
      passwordHash,
      name: "Alex Entrenador",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "cliente@demo.fit" } },
    update: {},
    create: {
      tenantId: tenant.id,
      role: "CLIENT",
      email: "cliente@demo.fit",
      passwordHash,
      name: "María Cliente",
    },
  });

  const demoSquatVideo = "https://www.youtube.com/watch?v=Dy28eq2PjcM";
  const demoBenchVideo = "https://youtu.be/vtHwKfPVeHk";

  const squat = await prisma.exercise.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Sentadilla" } },
    update: {
      muscleGroup: "Piernas",
      videoUrl: demoSquatVideo,
    },
    create: {
      tenantId: tenant.id,
      name: "Sentadilla",
      muscleGroup: "Piernas",
      videoUrl: demoSquatVideo,
    },
  });

  const bench = await prisma.exercise.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Press banca" } },
    update: {
      muscleGroup: "Pecho",
      videoUrl: demoBenchVideo,
    },
    create: {
      tenantId: tenant.id,
      name: "Press banca",
      muscleGroup: "Pecho",
      videoUrl: demoBenchVideo,
    },
  });

  const profile =
    (await prisma.clientProfile.findUnique({ where: { userId: clientUser.id } })) ??
    (await prisma.clientProfile.create({
      data: {
        userId: clientUser.id,
        trainerId: trainer.id,
        birthDate: new Date("1992-06-15"),
        gender: "female",
        heightCm: 168,
        objective: "Ganancia de fuerza y composición corporal",
        trackingFrequency: "WEEKLY",
      },
    }));

  await prisma.bodyMetric.deleteMany({ where: { clientProfileId: profile.id } });
  await prisma.bodyMetric.createMany({
    data: [
      {
        clientProfileId: profile.id,
        weightKg: 64,
        bodyFatPercent: 28,
        recordedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        notes: "Línea base",
      },
      {
        clientProfileId: profile.id,
        weightKg: 63,
        bodyFatPercent: 27,
        recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        clientProfileId: profile.id,
        weightKg: 62.8,
        bodyFatPercent: 26.5,
        recordedAt: new Date(),
      },
    ],
  });

  await prisma.feedbackRequest.deleteMany({ where: { clientProfileId: profile.id } });
  await prisma.clientRoutine.deleteMany({ where: { clientProfileId: profile.id } });
  await prisma.routine.deleteMany({
    where: { tenantId: tenant.id, trainerId: trainer.id, title: "Fuerza 2 días — demo" },
  });

  const routine = await prisma.routine.create({
    data: {
      tenantId: tenant.id,
      trainerId: trainer.id,
      title: "Fuerza 2 días — demo",
      description: "Sesión inicial para onboarding",
      goal: "Aprender técnica y cargas progresivas",
      difficulty: "Principiante / intermedio",
      durationWeeks: 8,
      days: {
        create: [
          {
            dayNumber: 1,
            title: "Tren inferior + core",
            notes: "Calentar 8–10 min",
            exercises: {
              create: [
                {
                  exerciseId: squat.id,
                  sets: 4,
                  reps: "8–10",
                  restSeconds: 120,
                  orderIndex: 0,
                },
              ],
            },
          },
          {
            dayNumber: 2,
            title: "Tren superior",
            exercises: {
              create: [
                {
                  exerciseId: bench.id,
                  sets: 3,
                  reps: "8–12",
                  restSeconds: 90,
                  orderIndex: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.clientRoutine.create({
    data: {
      clientProfileId: profile.id,
      routineId: routine.id,
      status: "ACTIVE",
      trainerNotes: "Ajustar si hay molestias en rodilla",
    },
  });

  await prisma.feedbackRequest.create({
    data: {
      clientProfileId: profile.id,
      trainerId: trainer.id,
      type: "ROUTINE_CHANGE",
      message: "Demo: me gustaría más trabajo de movilidad de hombros",
    },
  });

  // eslint-disable-next-line no-console -- seed script
  console.log("Seed listo. Login trainer: trainer@demo.fit / demo123");
  // eslint-disable-next-line no-console -- seed script
  console.log("Login cliente: cliente@demo.fit / demo123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console -- seed script
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
