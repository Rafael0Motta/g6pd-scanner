import { useEffect, useState } from "react";
import { buscarStats } from "../lib/api";
import type { AdminStats } from "@g6pd/shared-types";

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    buscarStats().then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-sm text-gray-400">Carregando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile label="Total de scans" value={stats.totalScans} />
        <Tile label="Devices ativos" value={stats.totalDevices} />
        <Tile label="Substâncias na base" value={stats.totalSubstancias} />
        <Tile label="Taxa não identificado" value={`${Math.round(stats.taxaNaoIdentificado * 100)}%`} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Distribuição de classificações</p>
        <div className="flex flex-col gap-2">
          {Object.entries(stats.distribuicaoClassificacao).map(([classificacao, total]) => (
            <div key={classificacao} className="flex items-center gap-3">
              <span className="w-40 text-sm text-gray-600">{classificacao}</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: stats.totalScans > 0 ? `${(total / stats.totalScans) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-10 text-right text-sm text-gray-500">{total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
