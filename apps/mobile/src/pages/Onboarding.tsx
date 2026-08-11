import { useState } from "react";
import { getOrCreateDeviceId, marcarOnboardingConcluido } from "../lib/deviceId";

export function Onboarding({ onConcluido }: { onConcluido: () => void }) {
  const [processando, setProcessando] = useState(false);

  async function continuar() {
    setProcessando(true);
    await getOrCreateDeviceId();
    await marcarOnboardingConcluido();
    onConcluido();
  }

  return (
    <div className="flex h-full flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">🧪</div>
        <h1 className="text-2xl font-bold text-gray-900">G6PD Scanner</h1>
        <p className="text-gray-600">
          Fotografe o rótulo de um produto e o app procura, na composição, substâncias que costumam ser
          contraindicadas para quem tem deficiência de G6PD.
        </p>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-900">
          <strong>Aviso importante:</strong> este app é uma ferramenta de apoio e não substitui orientação
          médica ou farmacêutica. Sempre confirme com um profissional de saúde em caso de dúvida.
        </div>
        <p className="text-xs text-gray-400">
          Não é necessário criar conta. Seu histórico fica salvo apenas neste aparelho.
        </p>
      </div>
      <button
        onClick={continuar}
        disabled={processando}
        className="w-full rounded-xl bg-green-700 py-3 text-center font-semibold text-white disabled:opacity-60"
      >
        {processando ? "Preparando…" : "Começar a usar"}
      </button>
    </div>
  );
}
