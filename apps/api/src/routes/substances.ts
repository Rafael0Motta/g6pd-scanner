import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const substancesRouter = Router();

const querySchema = z.object({
  busca: z.string().trim().min(1).optional(),
});

/** GET /api/substances - consulta publica (sem device) da base de contraindicacoes, para busca manual. */
substancesRouter.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Parametros invalidos." });
  }

  const { busca } = parsed.data;

  const substances = await prisma.g6pdSubstance.findMany({
    where: busca
      ? {
          OR: [
            { nomeSubstancia: { contains: busca, mode: "insensitive" } },
            { sinonimos: { has: busca } },
          ],
        }
      : undefined,
    orderBy: { nomeSubstancia: "asc" },
  });

  res.json(substances);
});
