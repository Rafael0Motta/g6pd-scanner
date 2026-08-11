import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { signAdminToken } from "../../middleware/adminAuth";

export const adminAuthRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

/** POST /.../login - unico ponto de autenticacao de todo o sistema. */
adminAuthRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email/senha invalidos." });
  }
  const { email, senha } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: "Credenciais invalidas." });
  }

  const senhaOk = await bcrypt.compare(senha, admin.senhaHash);
  if (!senhaOk) {
    return res.status(401).json({ error: "Credenciais invalidas." });
  }

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const token = signAdminToken({ adminId: admin.id, email: admin.email });

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, nome: admin.nome, createdAt: admin.createdAt, lastLoginAt: admin.lastLoginAt },
  });
});
