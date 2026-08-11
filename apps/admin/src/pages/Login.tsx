import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await entrar(email, senha);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={onSubmit} className="flex w-80 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-lg font-bold text-gray-900">G6PD Scanner — Admin</h1>
        <p className="text-center text-xs text-gray-400">Acesso restrito.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="rounded-lg bg-green-700 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
