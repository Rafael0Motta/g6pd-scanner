import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarProduto, editarProduto, excluirProduto } from "../lib/api";
import { ClassificacaoBadge } from "../components/ClassificacaoBadge";
import type { Classificacao, Product } from "@g6pd/shared-types";

const OPCOES_CLASSIFICACAO: Classificacao[] = ["SEGURO", "CAUTELA", "CONTRAINDICADO", "NAO_IDENTIFICADO"];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [produto, setProduto] = useState<Product | null>(null);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [classificacao, setClassificacao] = useState<Classificacao>("NAO_IDENTIFICADO");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    buscarProduto(id).then((p) => {
      setProduto(p);
      setNome(p.nomeProduto);
      setClassificacao(p.classificacao);
    });
  }, [id]);

  if (!produto) {
    return <p className="p-4 text-sm text-gray-400">Carregando…</p>;
  }

  async function salvar() {
    if (!id) return;
    setSalvando(true);
    try {
      const atualizado = await editarProduto(id, { nomeProduto: nome, classificacao });
      setProduto(atualizado);
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!id) return;
    if (!confirm("Excluir este produto do histórico?")) return;
    await excluirProduto(id);
    navigate("/catalogo");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <button onClick={() => navigate(-1)} className="w-fit text-sm text-gray-500">
        ← Voltar
      </button>

      {!editando ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{produto.nomeProduto}</h1>
            <ClassificacaoBadge classificacao={produto.classificacao} />
          </div>

          <p className="text-xs text-gray-400">
            Escaneado em {new Date(produto.createdAt).toLocaleString("pt-BR")} · origem:{" "}
            {produto.origem === "IA" ? "leitura automática" : "edição manual"}
            {produto.confiancaDeteccao != null && ` · confiança: ${Math.round(produto.confiancaDeteccao * 100)}%`}
          </p>

          {produto.ingredientesExtraidos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Ingredientes detectados</p>
              <p className="text-sm text-gray-600">{produto.ingredientesExtraidos.join(", ")}</p>
            </div>
          )}

          {produto.matches && produto.matches.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Substâncias identificadas</p>
              <ul className="list-inside list-disc text-sm text-gray-600">
                {produto.matches.map((m) => (
                  <li key={m.id}>
                    {m.substance?.nomeSubstancia} ({m.substance?.nivelRisco}) — "{m.trechoDetectado}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEditando(true)}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700"
            >
              Editar manualmente
            </button>
            <button onClick={excluir} className="flex-1 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-700">
              Excluir
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Nome do produto
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Classificação
            <select
              value={classificacao}
              onChange={(e) => setClassificacao(e.target.value as Classificacao)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {OPCOES_CLASSIFICACAO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-2 flex gap-2">
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex-1 rounded-lg bg-green-700 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {salvando ? "Salvando…" : "Salvar"}
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
