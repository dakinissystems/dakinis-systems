import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { FeedbackType } from "@prisma/client";

export const clientRouter = Router();

clientRouter.use(requireAuth(["CLIENT"]));

clientRouter.get("/dashboard", async (req, res) => {
  const u = req.authUser!;
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: u.id },
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      clientRoutines: {
        where: { status: "ACTIVE" },
        include: {
          routine: {
            include: {
              days: {
                orderBy: { dayNumber: "asc" },
                include: {
                  exercises: {
                    orderBy: { orderIndex: "asc" },
                    include: { exercise: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const [lastMetric, openFeedbackCount] = await Promise.all([
    prisma.bodyMetric.findFirst({
      where: { clientProfileId: profile.id },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.feedbackRequest.count({
      where: { clientProfileId: profile.id, status: { in: ["OPEN", "REVIEWING"] } },
    }),
  ]);

  const nextCheckInHint = (): string => {
    switch (profile.trackingFrequency) {
      case "DAILY":
        return "Registrar métricas cada día.";
      case "WEEKLY":
        return "Registrar métricas al menos una vez por semana.";
      case "MONTHLY":
        return "Registrar métricas al menos una vez al mes.";
      default:
        return "Registrar métricas según tu plan.";
    }
  };

  res.json({
    profile: {
      id: profile.id,
      trackingFrequency: profile.trackingFrequency,
      objective: profile.objective,
      heightCm: profile.heightCm,
    },
    trainer: profile.trainer,
    activeRoutine: profile.clientRoutines[0]?.routine ?? null,
    clientRoutineId: profile.clientRoutines[0]?.id ?? null,
    lastBodyMetric: lastMetric,
    openFeedbackRequests: openFeedbackCount,
    nextCheckInHint: nextCheckInHint(),
  });
});

clientRouter.get("/routine", async (req, res) => {
  const u = req.authUser!;
  const profile = await prisma.clientProfile.findUnique({ where: { userId: u.id } });
  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const cr = await prisma.clientRoutine.findFirst({
    where: { clientProfileId: profile.id, status: "ACTIVE" },
    include: {
      routine: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: {
              exercises: {
                orderBy: { orderIndex: "asc" },
                include: { exercise: true },
              },
            },
          },
        },
      },
    },
  });

  res.json(cr);
});

const BodyMetricBody = z.object({
  weightKg: z.number().positive().optional(),
  bodyFatPercent: z.number().min(0).max(100).optional(),
  muscleMassKg: z.number().positive().optional(),
  waterPercent: z.number().min(0).max(100).optional(),
  bmi: z.number().positive().optional(),
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  hipsCm: z.number().positive().optional(),
  armsCm: z.number().positive().optional(),
  legsCm: z.number().positive().optional(),
  notes: z.string().optional(),
});

clientRouter.post("/body-metrics", async (req, res) => {
  const u = req.authUser!;
  const parsed = BodyMetricBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const profile = await prisma.clientProfile.findUnique({ where: { userId: u.id } });
  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const row = await prisma.bodyMetric.create({
    data: {
      clientProfileId: profile.id,
      ...parsed.data,
      createdBy: u.id,
    },
  });

  res.status(201).json(row);
});

clientRouter.get("/body-metrics", async (req, res) => {
  const u = req.authUser!;
  const profile = await prisma.clientProfile.findUnique({ where: { userId: u.id } });
  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const rows = await prisma.bodyMetric.findMany({
    where: { clientProfileId: profile.id },
    orderBy: { recordedAt: "desc" },
    take: 120,
  });
  res.json(rows);
});

const FeedbackBody = z.object({
  type: z.enum(["ROUTINE_CHANGE", "PAIN", "DIFFICULTY", "OBJECTIVE_CHANGE", "BODY_UPDATE"]),
  message: z.string().min(3),
});

clientRouter.post("/feedback", async (req, res) => {
  const u = req.authUser!;
  const parsed = FeedbackBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const profile = await prisma.clientProfile.findUnique({ where: { userId: u.id } });
  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const row = await prisma.feedbackRequest.create({
    data: {
      clientProfileId: profile.id,
      trainerId: profile.trainerId,
      type: parsed.data.type as FeedbackType,
      message: parsed.data.message,
    },
  });

  res.status(201).json(row);
});

clientRouter.get("/feedback", async (req, res) => {
  const u = req.authUser!;
  const profile = await prisma.clientProfile.findUnique({ where: { userId: u.id } });
  if (!profile) return res.status(404).json({ error: "Client profile missing" });

  const rows = await prisma.feedbackRequest.findMany({
    where: { clientProfileId: profile.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows);
});
