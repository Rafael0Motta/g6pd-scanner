import { FormEvent, useEffect, useState } from "react";
import {
  criarSubstancia,
  editarSubstancia,
  excluirSubstancia,
  listarSubstanciasAdmin,
  type SubstanceInput,
} from "../lib/api";
import type { CategoriaSubstancia, NivelRisco, Substance } from "@g6pd/shared-types";

const NIVEIS: NivelRisco[] = ["ALTO", "MODERADO", "BAIXO"];
const CATEGORIAS: CategoriaSubstancia[] = ["MEDICAMENTO", "ALIMENTO", "CORANTE", "OUTRO"];

const FORM_VAZIO: SubstanceInput = {
  nomeSubstancia: "",
  sinonimos: [],
  nivelRisco: "ALTO",
  categoria: "MEDICAMENTO",
  observacoes: "",
  fonteReferencia: "",
};

export function Substances() {
  const [substancias, setSubstancias] = useState<Substance[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<SubstanceInput>(FORM_VAZIO);
  const [sinonimosTexto, setSinonimosTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    listarSubstanciasAdmin().then(setSubstancias);
  }

  useEffect(carregar, []);

  function iniciarEdicao(s: Substance) {
    setEditandoId(s.id);
    setForm({
      nomeSubstancia: s.nomeSubstancia,
      sinonimos: s.sinonimos,
      nivelRisco: s.nivelRisco,
      categoria: s.categoria,
      observacoes: s.observacoes ?? "",
      fonteReferencia: s.fonteReferencia ?? "",
    });
    setSinonimosTexto(s.sinonimos.join(", "));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setSinonimosTexto("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const dados: SubstanceInput = {
      ...form,
      sinonimos: sinonimosTexto
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editandoId) {
        await editarSubstancia(editandoId, dados);
      } else {
        await criarSubstancia(dados);
      }
      cancelarEdicao();
      carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function onExcluir(id: string) {
    if (!confirm("Excluir esta substância da base?")) return;
    await excluirSubstancia(id);
    carregar();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Base de contraindicações (g6pd_substances)</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="col-span-2 text-sm text-gray-700 md:col-span-1">
          Nome da substância
          <input
            required
            value={form.nomeSubstancia}
            onChange={(e) => setForm((f) => ({ ...f, nomeSubstancia: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="col-span-2 text-sm text-gray-700 md:col-span-1">
          Sinônimos (separados por vírgula)
          <input
            value={sinonimosTexto}
            onChange={(e) => setSinonimosTexto(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm text-gray-700">
          Nível de risco
          <select
            value={form.nivelRisco}
            onChange={(e) => setForm((f) => ({ ...f, nivelRisco: e.target.value as NivelRisco }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {NIVEIS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-700">
          Categoria
          <select
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as CategoriaSubstancia }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 text-sm text-gray-700">
          Observações
          <textarea
            value={form.observacoes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={2}
          />
        </label>

        <label className="col-span-2 text-sm text-gray-700">
          Fonte de referência
          <input
            value={form.fonteReferencia ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, fonteReferencia: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {editandoId ? "Salvar alterações" : "Adicionar substância"}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelarEdicao} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Sinônimos</th>
              <th className="px-4 py-2">Risco</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Atualizado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {substancias.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-900">{s.nomeSubstancia}</td>
                <td className="px-4 py-2 text-gray-500">{s.sinonimos.join(", ")}</td>
                <td className="px-4 py-2">{s.nivelRisco}</td>
                <td className="px-4 py-2">{s.categoria}</td>
                <td className="px-4 py-2 text-gray-400">{new Date(s.updatedAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => iniciarEdicao(s)} className="mr-2 text-green-700">
                    Editar
                  </button>
                  <button onClick={() => onExcluir(s.id)} className="text-red-600">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
