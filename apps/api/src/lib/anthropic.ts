import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";
import type { AiExtractionResult } from "@g6pd/shared-types";

export const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `Voce e um assistente que le rotulos de produtos (medicamentos, alimentos, cosmeticos) a
partir de fotos e extrai a lista de ingredientes/principios ativos de forma literal, sem
interpretar riscos medicos. Responda SEMPRE em JSON estrito, sem texto fora do JSON, no formato:
{"nome_produto": string, "ingredientes": string[], "principio_ativo": string | null, "confianca": number}

Regras:
- "ingredientes": copie os nomes tal como aparecem no rotulo (nao traduza, nao normalize).
- "principio_ativo": quando o rotulo indicar claramente um principio ativo (ex: medicamentos), preencha; senao use null.
- "confianca": numero entre 0 e 1 representando o quanto voce tem certeza da leitura (imagem borrada,
  cortada ou rotulo parcialmente ilegivel deve resultar em confianca baixa).
- Se a imagem nao permitir leitura nenhuma, retorne ingredientes: [] e confianca proxima de 0.
- Nunca inclua diagnostico, recomendacao medica ou classificacao de risco na resposta - apenas extraia o texto.`;

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Resposta da IA nao contem JSON.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function extrairIngredientesDaImagem(params: {
  base64Image: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<AiExtractionResult> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.mediaType,
              data: params.base64Image,
            },
          },
          {
            type: "text",
            text: "Leia o rotulo desta foto e retorne o JSON descrito nas instrucoes.",
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA sem conteudo de texto.");
  }

  const parsed = extractJson(textBlock.text) as Partial<AiExtractionResult>;

  const ingredientes = Array.isArray(parsed.ingredientes)
    ? parsed.ingredientes.filter((i): i is string => typeof i === "string")
    : [];

  const confianca = typeof parsed.confianca === "number" ? Math.max(0, Math.min(1, parsed.confianca)) : 0;

  return {
    nome_produto: typeof parsed.nome_produto === "string" && parsed.nome_produto.trim() ? parsed.nome_produto : "Produto nao identificado",
    ingredientes,
    principio_ativo: typeof parsed.principio_ativo === "string" ? parsed.principio_ativo : undefined,
    confianca,
  };
}
