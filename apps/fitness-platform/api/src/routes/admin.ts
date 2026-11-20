import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { FeedbackStatus, FeedbackType, TrackingFrequency } from "@prisma/client";

const exerciseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.exerciseUploadMaxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["video/mp4", "video/webm", "video/quicktime"].includes(file.mimetype);
    cb(null, ok);
  },
});

function mediaPathMatchesTenant(link: string, tenantId: string): boolean {
  const m = /^\/api\/media\/([^/]+)\/([a-zA-Z0-9._-]+)$/.exec(link);
  return Boolean(m && m[1] === tenantId);
}

function paramId(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

function tryNormalizeExerciseVideo(
  raw: unknown,
  tenantId: string,
):
  | { ok: false; reason: string }
  | { ok: true; value: string | null | undefined } {
  if (raw === undefined || raw === null) return { ok: true, value: raw === undefined ? undefined : null };
  if (typeof raw !== "string") return { ok: false, reason: "videoUrl debe ser texto" };
  const t = raw.trim();
  if (!t) return { ok: true, value: null };
  if (/^https?:\/\//i.test(t)) return { ok: true, value: t };
  if (t.startsWith("/api/media/"))
    return mediaPathMatchesTenant(t, tenantId)
      ? { ok: true, value: t }
      : { ok: false, reason: "Ruta de vídeo no válida para tu espacio" };
  return { ok: false, reason: "videoUrl debe ser URL http(s) o ruta interna /api/media/..." };
}

export const adminRouter = Router();

adminRouter.use(requireAuth(["OWNER", "TRAINER"]));

adminRouter.get("/clients", async (req, res) => {
  const u = req.authUser!;
  const clients = await prisma.clientProfile.findMany({
    where: { trainerId: u.id },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      _count: { select: { bodyMetrics: true, feedbackFromClient: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const lastMetric = async (cid: string) =>
    prisma.bodyMetric.findFirst({
      where: { clientProfileId: cid },
      orderBy: { recordedAt: "desc" },
    });

  const withLast = await Promise.all(
    clients.map(async (c) => ({
      ...c,
      lastBodyMetric: await lastMetric(c.id),
    })),
  );

  res.json(withLast);
});

const CreateClient = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  gender: z.string().optional(),
  heightCm: z.number().positive().optional(),
  objective: z.string().optional(),
  activityLevel: z.string().optional(),
  medicalNotes: z.string().optional(),
  injuries: z.string().optional(),
  trackingFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
});

adminRouter.post("/clients", async (req, res) => {
  const u = req.authUser!;
  const parsed = CreateClient.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const b = parsed.data;
  const email = b.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: u.tenantId, email } },
  });
  if (existing) return res.status(409).json({ error: "Email already used in tenant" });

  const passwordHash = await bcrypt.hash(b.password, 10);
  const created = await prisma.$transaction(async (tx) => {
    const usr = await tx.user.create({
      data: {
        tenantId: u.tenantId,
        role: "CLIENT",
        email,
        passwordHash,
        name: b.name ?? null,
        phone: b.phone ?? null,
      },
    });

    const profile = await tx.clientProfile.create({
      data: {
        userId: usr.id,
        trainerId: u.id,
        birthDate: b.birthDate ?? null,
        gender: b.gender ?? null,
        heightCm: b.heightCm ?? null,
        objective: b.objective ?? null,
        activityLevel: b.activityLevel ?? null,
        medicalNotes: b.medicalNotes ?? null,
        injuries: b.injuries ?? null,
        trackingFrequency: (b.trackingFrequency as TrackingFrequency | undefined) ?? "WEEKLY",
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return profile;
  });

  res.status(201).json(created);
});

const PatchClient = z.object({
  objective: z.string().optional(),
  injuries: z.string().optional(),
  medicalNotes: z.string().optional(),
  trackingFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  heightCm: z.number().positive().optional(),
});

adminRouter.patch("/clients/:profileId", async (req, res) => {
  const u = req.authUser!;
  const profileId = req.params.profileId;
  const parsed = PatchClient.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const owns = await prisma.clientProfile.findFirst({
    where: { id: profileId, trainerId: u.id },
  });
  if (!owns) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.clientProfile.update({
    where: { id: profileId },
    data: parsed.data as Record<string, unknown>,
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  res.json(updated);
});

adminRouter.get("/routines", async (req, res) => {
  const u = req.authUser!;
  const routines = await prisma.routine.findMany({
    where: { tenantId: u.tenantId, trainerId: u.id },
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
    orderBy: { updatedAt: "desc" },
  });
  res.json(routines);
});

const RoutineDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().optional(),
  notes: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseName: z.string().min(1),
        muscleGroup: z.string().optional(),
        sets: z.number().int().positive().optional(),
        reps: z.string().optional(),
        restSeconds: z.number().int().nonnegative().optional(),
        videoUrl: z.string().max(2048).optional(),
      }),
    )
    .min(1),
});

const CreateRoutine = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  durationWeeks: z.number().int().positive().optional(),
  days: z.array(RoutineDaySchema).min(1),
});

adminRouter.post("/routines", async (req, res) => {
  const u = req.authUser!;
  const parsed = CreateRoutine.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const payloadNorm: { dayNumber: number; title?: string; notes?: string; exercises: unknown[] }[] = [];
  for (const d of parsed.data.days) {
    const normEx: Record<string, unknown>[] = [];
    for (const ex of d.exercises) {
      const vn = tryNormalizeExerciseVideo(ex.videoUrl, u.tenantId);
      if (!vn.ok) return res.status(400).json({ error: vn.reason });
      normEx.push({
        ...ex,
        _videoNormalized: vn.value as string | null | undefined,
      });
    }
    payloadNorm.push({ ...d, exercises: normEx });
  }

  const routine = await prisma.$transaction(async (tx) => {
    const rt = await tx.routine.create({
      data: {
        tenantId: u.tenantId,
        trainerId: u.id,
        title: parsed.data.title,
        description: parsed.data.description,
        goal: parsed.data.goal,
        difficulty: parsed.data.difficulty,
        durationWeeks: parsed.data.durationWeeks ?? null,
      },
    });

    for (const d of payloadNorm) {
      const day = await tx.routineDay.create({
        data: {
          routineId: rt.id,
          dayNumber: d.dayNumber,
          title: d.title as string | undefined,
          notes: d.notes as string | undefined,
        },
      });

      let idx = 0;
      for (const ex of d.exercises as {
        exerciseName: string;
        muscleGroup?: string;
        sets?: number;
        reps?: string;
        restSeconds?: number;
        _videoNormalized: string | null | undefined;
      }[]) {
        const videoNormalized = ex._videoNormalized;
        const exercise = await tx.exercise.upsert({
          where: {
            tenantId_name: {
              tenantId: u.tenantId,
              name: ex.exerciseName.trim(),
            },
          },
          update: {
            ...(ex.muscleGroup !== undefined ? { muscleGroup: ex.muscleGroup ?? null } : {}),
            ...(videoNormalized !== undefined ? { videoUrl: videoNormalized } : {}),
          },
          create: {
            tenantId: u.tenantId,
            name: ex.exerciseName.trim(),
            muscleGroup: ex.muscleGroup ?? null,
            ...(videoNormalized !== undefined ? { videoUrl: videoNormalized } : {}),
          },
        });

        await tx.routineExercise.create({
          data: {
            routineDayId: day.id,
            exerciseId: exercise.id,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            restSeconds: ex.restSeconds ?? null,
            orderIndex: idx++,
          },
        });
      }
    }

    return tx.routine.findUniqueOrThrow({
      where: { id: rt.id },
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
    });
  });

  res.status(201).json(routine);
});

const AssignRoutine = z.object({
  clientProfileId: z.string().min(8),
  routineId: z.string().min(8),
  trainerNotes: z.string().optional(),
});

adminRouter.post("/assign-routine", async (req, res) => {
  const u = req.authUser!;
  const parsed = AssignRoutine.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const profile = await prisma.clientProfile.findFirst({
    where: { id: parsed.data.clientProfileId, trainerId: u.id },
  });
  if (!profile) return res.status(404).json({ error: "Client not found" });

  const routine = await prisma.routine.findFirst({
    where: { id: parsed.data.routineId, tenantId: u.tenantId, trainerId: u.id },
  });
  if (!routine) return res.status(404).json({ error: "Routine not found" });

  await prisma.clientRoutine.updateMany({
    where: { clientProfileId: profile.id, status: "ACTIVE" },
    data: { status: "PAUSED", endDate: new Date() },
  });

  const cr = await prisma.clientRoutine.create({
    data: {
      clientProfileId: profile.id,
      routineId: routine.id,
      status: "ACTIVE",
      trainerNotes: parsed.data.trainerNotes ?? null,
    },
  });

  res.status(201).json(cr);
});

adminRouter.get("/feedback", async (req, res) => {
  const u = req.authUser!;
  const rows = await prisma.feedbackRequest.findMany({
    where: { trainerId: u.id },
    include: { client: { include: { user: { select: { email: true, name: true } } } } },
    orderBy: { updatedAt: "desc" },
  });
  res.json(rows);
});

const PatchFeedback = z.object({
  status: z.enum(["OPEN", "REVIEWING", "CLOSED"]),
});

adminRouter.patch("/feedback/:id", async (req, res) => {
  const u = req.authUser!;
  const parsed = PatchFeedback.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const fb = await prisma.feedbackRequest.findFirst({
    where: { id: req.params.id, trainerId: u.id },
  });
  if (!fb) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.feedbackRequest.update({
    where: { id: fb.id },
    data: { status: parsed.data.status as FeedbackStatus },
  });

  res.json(updated);
});

adminRouter.get("/exercises", async (req, res) => {
  const u = req.authUser!;
  const rows = await prisma.exercise.findMany({
    where: { tenantId: u.tenantId },
    orderBy: { name: "asc" },
  });
  res.json(rows);
});

const ExercisePatchBody = z
  .object({
    videoUrl: z.string().max(2048).nullable().optional(),
  })
  .strict();

adminRouter.patch("/exercises/:id", async (req, res) => {
  const u = req.authUser!;
  const parsed = ExercisePatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const id = paramId(req.params.id);
  const ex = await prisma.exercise.findFirst({
    where: { id, tenantId: u.tenantId },
  });
  if (!ex) return res.status(404).json({ error: "Not found" });

  if (!Object.prototype.hasOwnProperty.call(parsed.data, "videoUrl")) {
    res.json(ex);
    return;
  }

  const vn = tryNormalizeExerciseVideo(parsed.data.videoUrl, u.tenantId);
  if (!vn.ok) return res.status(400).json({ error: vn.reason });

  const updated = await prisma.exercise.update({
    where: { id: ex.id },
    data: { videoUrl: vn.value ?? null },
  });
  res.json(updated);
});

adminRouter.post("/exercises/:id/media", exerciseUpload.single("file"), async (req, res) => {
  const u = req.authUser!;
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Adjunta un vídeo (campo multipart "file")' });

  const id = paramId(req.params.id);
  const ex = await prisma.exercise.findFirst({
    where: { id, tenantId: u.tenantId },
  });
  if (!ex) return res.status(404).json({ error: "Ejercicio no encontrado" });

  let ext =
    path.extname(f.originalname || "").toLowerCase() ||
    (f.mimetype === "video/webm"
      ? ".webm"
      : f.mimetype === "video/quicktime"
        ? ".mov"
        : ".mp4");

  const allowedExt = new Set([".mp4", ".webm", ".mov"]);
  if (!allowedExt.has(ext)) ext = ".mp4";

  const dir = path.join(config.uploadRoot, u.tenantId);
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${ex.id}-${Date.now()}${ext}`;
  await fs.writeFile(path.join(dir, fileName), f.buffer);

  const publicUrl = `/api/media/${u.tenantId}/${fileName}`;
  const updated = await prisma.exercise.update({
    where: { id: ex.id },
    data: { videoUrl: publicUrl },
  });
  res.json(updated);
});
