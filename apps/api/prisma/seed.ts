// Seed da base g6pd_substances.
//
// IMPORTANTE: esta base precisa ser curada por um profissional de saude.
// Os itens abaixo sao EXEMPLOS PARA REVISAO, nao uma lista clinica validada.
// Nao adicione substancias geradas por IA sem revisao humana - use o painel
// admin (CRUD de g6pd_substances) para a curadoria real.

import { PrismaClient, NivelRisco, CategoriaSubstancia } from "@prisma/client";

const prisma = new PrismaClient();

const EXEMPLOS_PARA_REVISAO = [
  {
    nomeSubstancia: "Primaquina",
    sinonimos: ["primaquine"],
    nivelRisco: NivelRisco.ALTO,
    categoria: CategoriaSubstancia.MEDICAMENTO,
    observacoes: "EXEMPLO - REVISAR. Antimalarico classicamente contraindicado em deficiencia de G6PD.",
    fonteReferencia: "EXEMPLO - REVISAR (adicionar fonte clinica oficial)",
  },
  {
    nomeSubstancia: "Azul de metileno",
    sinonimos: ["methylene blue", "azul de metileno"],
    nivelRisco: NivelRisco.ALTO,
    categoria: CategoriaSubstancia.MEDICAMENTO,
    observacoes: "EXEMPLO - REVISAR.",
    fonteReferencia: "EXEMPLO - REVISAR",
  },
  {
    nomeSubstancia: "Naftalina",
    sinonimos: ["naphthalene", "cânfora de naftalina", "bolinha de naftalina"],
    nivelRisco: NivelRisco.ALTO,
    categoria: CategoriaSubstancia.OUTRO,
    observacoes: "EXEMPLO - REVISAR.",
    fonteReferencia: "EXEMPLO - REVISAR",
  },
  {
    nomeSubstancia: "Fava (Vicia faba)",
    sinonimos: ["favas", "fava beans", "broad beans"],
    nivelRisco: NivelRisco.ALTO,
    categoria: CategoriaSubstancia.ALIMENTO,
    observacoes: "EXEMPLO - REVISAR. Origem do nome 'favismo'.",
    fonteReferencia: "EXEMPLO - REVISAR",
  },
];

async function main() {
  for (const substancia of EXEMPLOS_PARA_REVISAO) {
    await prisma.g6pdSubstance.upsert({
      where: { nomeSubstancia: substancia.nomeSubstancia },
      update: {},
      create: substancia,
    });
  }
  console.log(`Seed concluido: ${EXEMPLOS_PARA_REVISAO.length} EXEMPLOS PARA REVISAO inseridos/verificados.`);
  console.log("Revise cada item pelo painel admin antes de considerar a base confiavel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
