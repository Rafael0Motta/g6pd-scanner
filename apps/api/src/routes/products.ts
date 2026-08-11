import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireDeviceId } from "../middleware/deviceId";
import { Classificacao } from "@prisma/client";

export const productsRouter = Router();

productsRouter.use(requireDeviceId);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  classificacao: z.nativeEnum(Classificacao).optional(),
  busca: z.string().trim().min(1).optional(),
});

/** GET /api/products - historico/catalogo do device, paginado e filtravel. */
productsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Parametros de busca invalidos." });
  }
  const { page, pageSize, classificacao, busca } = parsed.data;

  const where = {
    deviceId: req.device!.id,
    ...(classificacao ? { classificacao } : {}),
    ...(busca ? { nomeProduto: { contains: busca, mode: "insensitive" as const } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { matches: { include: { substance: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ data, page, pageSize, total });
});

/** GET /api/products/:id */
productsRouter.get("/:id", async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, deviceId: req.device!.id },
    include: { matches: { include: { substance: true } } },
  });
  if (!product) {
    return res.status(404).json({ error: "Produto nao encontrado." });
  }
  res.json(product);
});

const patchSchema = z.object({
  nomeProduto: z.string().trim().min(1).optional(),
  classificacao: z.nativeEnum(Classificacao).optional(),
});

/** PATCH /api/products/:id - edicao manual pelo usuario (ex: corrigir nome/classificacao). */
productsRouter.patch("/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados de edicao invalidos." });
  }

  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, deviceId: req.device!.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Produto nao encontrado." });
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      ...parsed.data,
      origem: "MANUAL",
    },
    include: { matches: { include: { substance: true } } },
  });

  res.json(product);
});

/** DELETE /api/products/:id */
productsRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, deviceId: req.device!.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Produto nao encontrado." });
  }
  await prisma.product.delete({ where: { id: existing.id } });
  res.status(204).send();
});
