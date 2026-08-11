import { prisma } from "../lib/prisma";
import { extrairIngredientesDaImagem } from "../lib/anthropic";
import { classificarIngredientes } from "./matching";
import { OrigemProduto } from "@prisma/client";

export interface ExecutarScanParams {
  deviceId: string;
  base64Image: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

export async function executarScan(params: ExecutarScanParams) {
  const extracao = await extrairIngredientesDaImagem({
    base64Image: params.base64Image,
    mediaType: params.mediaType,
  });

  const resultado = await classificarIngredientes({
    ingredientes: extracao.ingredientes,
    confianca: extracao.confianca,
  });

  const product = await prisma.product.create({
    data: {
      deviceId: params.deviceId,
      nomeProduto: extracao.nome_produto,
      ingredientesExtraidos: extracao.ingredientes,
      classificacao: resultado.classificacao,
      confiancaDeteccao: extracao.confianca,
      origem: OrigemProduto.IA,
      matches: {
        create: resultado.matches.map((m) => ({
          substanceId: m.substanceId,
          trechoDetectado: m.trechoDetectado,
        })),
      },
    },
    include: {
      matches: { include: { substance: true } },
    },
  });

  return {
    product,
    precisaConfirmacaoManual: resultado.precisaConfirmacaoManual,
  };
}
