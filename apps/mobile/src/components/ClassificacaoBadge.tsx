import type { Classificacao } from "@g6pd/shared-types";

const CONFIG: Record<Classificacao, { label: string; classes: string }> = {
  SEGURO: { label: "Seguro", classes: "bg-green-100 text-green-800 border-green-300" },
  CAUTELA: { label: "Cautela", classes: "bg-amber-100 text-amber-800 border-amber-300" },
  CONTRAINDICADO: { label: "Contraindicado", classes: "bg-red-100 text-red-800 border-red-300" },
  NAO_IDENTIFICADO: { label: "Não identificado", classes: "bg-gray-100 text-gray-700 border-gray-300" },
};

export function ClassificacaoBadge({ classificacao }: { classificacao: Classificacao }) {
  const config = CONFIG[classificacao];
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
