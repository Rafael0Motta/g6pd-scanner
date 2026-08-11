import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/adminAuth";
import { NivelRisco, CategoriaSubstancia } from "@prisma/client";

export const adminSubstancesRouter = Router();

adminSubstancesRouter.use(requireAdminAuth);

const substanceSchema = z.object({
  nomeSubstancia: z.string().trim().min(1),
  sinonimos: z.array(z.string().trim().min(1)).default([]),
  nivelRisco: z.nativeEnum(NivelRisco),
  categoria: z.nativeEnum(CategoriaSubstancia),
  observacoes: z.string().trim().optional().nullable(),
  fonteReferencia: z.string().trim().optional().nullable(),
});

/** GET /.../substances - CRUD completo da base curada (razao de existir do painel). */
adminSubstancesRouter.get("/", async (_req, res) => {
  const substances = await prisma.g6pdSubstance.findMany({ orderBy: { nomeSubstancia: "asc" } });
  res.json(substances);
});

adminSubstancesRouter.post("/", async (req, res) => {
  const parsed = substanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados invalidos.", details: parsed.error.flatten() });
  }
  const substance = await prisma.g6pdSubstance.create({ data: parsed.data });
  res.status(201).json(substance);
});

adminSubstancesRouter.patch("/:id", async (req, res) => {
  const parsed = substanceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados invalidos.", details: parsed.error.flatten() });
  }
  const existing = await prisma.g6pdSubstance.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: "Substancia nao encontrada." });
  }
  const substance = await prisma.g6pdSubstance.update({ where: { id: existing.id }, data: parsed.data });
  res.json(substance);
});

adminSubstancesRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.g6pdSubstance.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: "Substancia nao encontrada." });
  }
  await prisma.g6pdSubstance.delete({ where: { id: existing.id } });
  res.status(204).send();
});
