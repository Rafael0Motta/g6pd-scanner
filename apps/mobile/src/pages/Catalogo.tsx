import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarProdutos } from "../lib/api";
import { ClassificacaoBadge } from "../components/ClassificacaoBadge";
import type { Classificacao, Product } from "@g6pd/shared-types";

const FILTROS: { label: string; value: Classificacao | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Seguro", value: "SEGURO" },
  { label: "Cautela", value: "CAUTELA" },
  { label: "Contraindicado", value: "CONTRAINDICADO" },
  { label: "Não identificado", value: "NAO_IDENTIFICADO" },
];

export function Catalogo() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Classificacao | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    listarProdutos({ classificacao: filtro, busca: busca || undefined })
      .then((res) => setProdutos(res.data))
      .finally(() => setCarregando(false));
  }, [filtro, busca]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">Histórico</h1>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome do produto"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFiltro(f.value)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              filtro === f.value ? "border-green-700 bg-green-700 text-white" : "border-gray-300 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {carregando && <p className="text-sm text-gray-400">Carregando…</p>}

      {!carregando && produtos.length === 0 && (
        <p className="text-sm text-gray-400">Nenhum produto escaneado ainda.</p>
      )}

      <div className="flex flex-col gap-2">
        {produtos.map((produto) => (
          <Link
            key={produto.id}
            to={`/produto/${produto.id}`}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
          >
            <div className="flex items-center gap-3">
              {produto.imagemUrl ? (
                <img src={produto.imagemUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl">
                  🧴
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{produto.nomeProduto}</p>
                <p className="text-xs text-gray-400">{new Date(produto.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            <ClassificacaoBadge classificacao={produto.classificacao} />
          </Link>
        ))}
      </div>
    </div>
  );
}
