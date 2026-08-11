import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { clearToken, getToken, login as apiLogin, setToken } from "../lib/api";
import type { Admin } from "@g6pd/shared-types";

interface AuthContextValue {
  autenticado: boolean;
  admin: Admin | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [autenticado, setAutenticado] = useState<boolean>(!!getToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      autenticado,
      admin,
      async entrar(email: string, senha: string) {
        const resposta = await apiLogin({ email, senha });
        setToken(resposta.token);
        setAdmin(resposta.admin);
        setAutenticado(true);
      },
      sair() {
        clearToken();
        setAdmin(null);
        setAutenticado(false);
      },
    }),
    [autenticado, admin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
