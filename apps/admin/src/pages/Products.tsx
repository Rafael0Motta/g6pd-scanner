import { useEffect, useState } from "react";
import { listarProdutosAdmin } from "../lib/api";
import type { Classificacao, Product } from "@g6pd/shared-types";

const FILTROS: { label: string; value: Classificacao | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Seguro", value: "SEGURO" },
  { label: "Cautela", value: "CAUTELA" },
  { label: "Contraindicado", value: "CONTRAINDICADO" },
  { label: "Não identificado", value: "NAO_IDENTIFICADO" },
];

export function Products() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [filtro, setFiltro] = useState<Classificacao | undefined>(undefined);

  useEffect(() => {
    listarProdutosAdmin({ classificacao: filtro }).then((res) => setProdutos(res.data));
  }, [filtro]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Produtos escaneados (todos os devices)</h1>
      <p className="text-sm text-gray-500">
        Visão de auditoria para avaliar a qualidade das leituras da IA. Não identifica pessoas — apenas o
        device anônimo que escaneou.
      </p>

      <div className="flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filtro === f.value ? "border-green-700 bg-green-700 text-white" : "border-gray-300 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Produto</th>
              <th className="px-4 py-2">Classificação</th>
              <th className="px-4 py-2">Confiança</th>
              <th className="px-4 py-2">Origem</th>
              <th className="px-4 py-2">Device</th>
              <th className="px-4 py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-900">{p.nomeProduto}</td>
                <td className="px-4 py-2">{p.classificacao}</td>
                <td className="px-4 py-2">{p.confiancaDeteccao != null ? `${Math.round(p.confiancaDeteccao * 100)}%` : "—"}</td>
                <td className="px-4 py-2">{p.origem}</td>
                <td className="px-4 py-2 text-gray-400">{p.deviceId.slice(0, 8)}…</td>
                <td className="px-4 py-2 text-gray-400">{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
