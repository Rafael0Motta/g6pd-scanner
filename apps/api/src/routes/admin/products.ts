import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/adminAuth";
import { Classificacao } from "@prisma/client";

export const adminProductsRouter = Router();

adminProductsRouter.use(requireAdminAuth);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  classificacao: z.nativeEnum(Classificacao).optional(),
});

/** GET /.../products - visao geral de todos os scans de todos os devices, para auditoria da IA. */
adminProductsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Parametros invalidos." });
  }
  const { page, pageSize, classificacao } = parsed.data;

  const where = classificacao ? { classificacao } : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        matches: { include: { substance: true } },
        device: { select: { deviceId: true, nomeApelido: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ data, page, pageSize, total });
});
