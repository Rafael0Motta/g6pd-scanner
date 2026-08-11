import { useEffect, useState } from "react";
import { buscarSubstancias } from "../lib/api";
import type { Substance } from "@g6pd/shared-types";

const RISCO_CLASSES: Record<Substance["nivelRisco"], string> = {
  ALTO: "text-red-700",
  MODERADO: "text-amber-700",
  BAIXO: "text-gray-600",
};

export function SubstanceSearch() {
  const [busca, setBusca] = useState("");
  const [substancias, setSubstancias] = useState<Substance[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    const timeout = setTimeout(() => {
      buscarSubstancias(busca || undefined)
        .then(setSubstancias)
        .finally(() => setCarregando(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [busca]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">Buscar substância</h1>
      <p className="text-sm text-gray-500">Consulte a base de contraindicações sem precisar escanear.</p>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Nome da substância ou sinônimo"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      {carregando && <p className="text-sm text-gray-400">Buscando…</p>}

      {!carregando && substancias.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma substância encontrada.</p>
      )}

      <div className="flex flex-col gap-2">
        {substancias.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{s.nomeSubstancia}</p>
              <span className={`text-xs font-semibold uppercase ${RISCO_CLASSES[s.nivelRisco]}`}>
                Risco {s.nivelRisco}
              </span>
            </div>
            {s.sinonimos.length > 0 && (
              <p className="text-xs text-gray-400">Também conhecida como: {s.sinonimos.join(", ")}</p>
            )}
            {s.observacoes && <p className="mt-1 text-sm text-gray-600">{s.observacoes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
