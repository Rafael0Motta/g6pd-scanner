import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useNavigate } from "react-router-dom";
import { enviarScan } from "../lib/api";
import { ClassificacaoBadge } from "../components/ClassificacaoBadge";
import type { ScanResponse } from "@g6pd/shared-types";

export function Scanner() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ScanResponse | null>(null);
  const navigate = useNavigate();

  async function capturarEEnviar() {
    setErro(null);
    setResultado(null);
    try {
      const foto = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 80,
        allowEditing: false,
      });

      if (!foto.base64String) {
        setErro("Não foi possível capturar a imagem. Tente novamente.");
        return;
      }

      setCarregando(true);
      const mediaType = foto.format === "png" ? "image/png" : "image/jpeg";
      const resposta = await enviarScan(foto.base64String, mediaType);
      setResultado(resposta);
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes("cancel")) {
        return;
      }
      setErro(err instanceof Error ? err.message : "Erro ao escanear o produto.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">Escanear produto</h1>
      <p className="text-sm text-gray-500">
        Fotografe a lista de ingredientes ou o rótulo do produto de forma legível.
      </p>

      <button
        onClick={capturarEEnviar}
        disabled={carregando}
        className="flex items-center justify-center gap-2 rounded-xl bg-green-700 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {carregando ? "Analisando…" : "📷 Tirar foto"}
      </button>

      {erro && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{erro}</div>
      )}

      {resultado && (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{resultado.product.nomeProduto}</h2>
            <ClassificacaoBadge classificacao={resultado.product.classificacao} />
          </div>

          {resultado.precisaConfirmacaoManual && (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
              Confiança baixa na leitura da imagem — confirme ou edite os dados manualmente.
            </div>
          )}

          {resultado.product.ingredientesExtraidos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Ingredientes detectados:</p>
              <p className="text-sm text-gray-600">{resultado.product.ingredientesExtraidos.join(", ")}</p>
            </div>
          )}

          {resultado.product.matches && resultado.product.matches.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Substâncias que motivaram a classificação:</p>
              <ul className="list-inside list-disc text-sm text-gray-600">
                {resultado.product.matches.map((match) => (
                  <li key={match.id}>
                    {match.substance?.nomeSubstancia} — detectado em "{match.trechoDetectado}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => navigate(`/produto/${resultado.product.id}`)}
            className="mt-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700"
          >
            Ver detalhes / editar
          </button>
        </div>
      )}
    </div>
  );
}
