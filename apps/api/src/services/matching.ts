import { prisma } from "../lib/prisma";
import { Classificacao, NivelRisco } from "@prisma/client";
import { CONFIANCA_MINIMA_AUTOMATICA } from "@g6pd/shared-types";

// Faixa Unicode de marcas diacriticas combinantes (usada para remover acentos apos normalize("NFD")).
const DIACRITICOS = /[̀-ͯ]/g;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .trim();
}

export interface MatchEncontrado {
  substanceId: string;
  nivelRisco: NivelRisco;
  trechoDetectado: string;
}

export interface ResultadoClassificacao {
  classificacao: Classificacao;
  precisaConfirmacaoManual: boolean;
  matches: MatchEncontrado[];
}

/**
 * Cruza os ingredientes extraidos pela IA contra a base curada
 * g6pd_substances (nome + sinonimos), usando correspondencia por substring
 * nos dois sentidos apos normalizacao (sem acento, minusculo).
 */
export async function classificarIngredientes(params: {
  ingredientes: string[];
  confianca: number;
}): Promise<ResultadoClassificacao> {
  const { ingredientes, confianca } = params;

  if (ingredientes.length === 0) {
    return { classificacao: Classificacao.NAO_IDENTIFICADO, precisaConfirmacaoManual: true, matches: [] };
  }

  const substancias = await prisma.g6pdSubstance.findMany();
  const ingredientesNormalizados = ingredientes.map((i) => ({ original: i, normalizado: normalizar(i) }));

  const matches: MatchEncontrado[] = [];

  for (const substancia of substancias) {
    const termos = [substancia.nomeSubstancia, ...substancia.sinonimos].map(normalizar).filter(Boolean);

    for (const ingrediente of ingredientesNormalizados) {
      const bateu = termos.some(
        (termo) => ingrediente.normalizado.includes(termo) || termo.includes(ingrediente.normalizado)
      );
      if (bateu) {
        matches.push({
          substanceId: substancia.id,
          nivelRisco: substancia.nivelRisco,
          trechoDetectado: ingrediente.original,
        });
        break;
      }
    }
  }

  const confiancaBaixa = confianca < CONFIANCA_MINIMA_AUTOMATICA;

  let classificacao: Classificacao;
  if (confiancaBaixa) {
    classificacao = Classificacao.NAO_IDENTIFICADO;
  } else if (matches.some((m) => m.nivelRisco === NivelRisco.ALTO)) {
    classificacao = Classificacao.CONTRAINDICADO;
  } else if (matches.length > 0) {
    // MODERADO ou BAIXO: tratado como CAUTELA por seguranca (nao ha
    // confirmacao clinica automatica de que risco BAIXO e realmente seguro).
    classificacao = Classificacao.CAUTELA;
  } else {
    classificacao = Classificacao.SEGURO;
  }

  return {
    classificacao,
    precisaConfirmacaoManual: confiancaBaixa,
    matches,
  };
}
