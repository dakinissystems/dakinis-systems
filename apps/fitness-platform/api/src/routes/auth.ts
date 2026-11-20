import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signAccessToken } from "../jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { email, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), isActive: true },
    include: { tenant: true },
  });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccessToken({
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    },
  });
});

authRouter.get("/me", requireAuth(), async (req, res) => {
  const user = req.authUser!;
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: tenant?.slug,
  });
});
