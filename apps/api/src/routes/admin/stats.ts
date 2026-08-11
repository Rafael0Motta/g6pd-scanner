import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/adminAuth";
import { Classificacao } from "@prisma/client";
import type { AdminStats } from "@g6pd/shared-types";

export const adminStatsRouter = Router();

adminStatsRouter.use(requireAdminAuth);

/** GET /.../stats - metricas basicas para o dashboard do painel. */
adminStatsRouter.get("/", async (_req, res) => {
  const [totalScans, totalDevices, totalSubstancias, agrupado] = await Promise.all([
    prisma.product.count(),
    prisma.device.count(),
    prisma.g6pdSubstance.count(),
    prisma.product.groupBy({ by: ["classificacao"], _count: { classificacao: true } }),
  ]);

  const distribuicaoClassificacao: Record<Classificacao, number> = {
    SEGURO: 0,
    CAUTELA: 0,
    CONTRAINDICADO: 0,
    NAO_IDENTIFICADO: 0,
  };
  for (const grupo of agrupado) {
    distribuicaoClassificacao[grupo.classificacao] = grupo._count.classificacao;
  }

  const taxaNaoIdentificado = totalScans > 0 ? distribuicaoClassificacao.NAO_IDENTIFICADO / totalScans : 0;

  const stats: AdminStats = {
    totalScans,
    distribuicaoClassificacao,
    taxaNaoIdentificado,
    totalDevices,
    totalSubstancias,
  };

  res.json(stats);
});
