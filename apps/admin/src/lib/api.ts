import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminStats,
  Classificacao,
  NivelRisco,
  CategoriaSubstancia,
  PaginatedResponse,
  Product,
  Substance,
} from "@g6pd/shared-types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const ADMIN_PREFIX = `/api/${import.meta.env.VITE_ADMIN_ROUTE_SLUG}-admin`;

const TOKEN_KEY = "g6pd_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${ADMIN_PREFIX}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro na requisicao (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function login(dados: AdminLoginRequest): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>("/login", { method: "POST", body: JSON.stringify(dados) });
}

export async function listarSubstanciasAdmin(): Promise<Substance[]> {
  return request<Substance[]>("/substances");
}

export interface SubstanceInput {
  nomeSubstancia: string;
  sinonimos: string[];
  nivelRisco: NivelRisco;
  categoria: CategoriaSubstancia;
  observacoes?: string | null;
  fonteReferencia?: string | null;
}

export async function criarSubstancia(dados: SubstanceInput): Promise<Substance> {
  return request<Substance>("/substances", { method: "POST", body: JSON.stringify(dados) });
}

export async function editarSubstancia(id: string, dados: Partial<SubstanceInput>): Promise<Substance> {
  return request<Substance>(`/substances/${id}`, { method: "PATCH", body: JSON.stringify(dados) });
}

export async function excluirSubstancia(id: string): Promise<void> {
  return request<void>(`/substances/${id}`, { method: "DELETE" });
}

export async function listarProdutosAdmin(params: { page?: number; classificacao?: Classificacao } = {}): Promise<
  PaginatedResponse<Product>
> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.classificacao) query.set("classificacao", params.classificacao);
  return request<PaginatedResponse<Product>>(`/products?${query.toString()}`);
}

export async function buscarStats(): Promise<AdminStats> {
  return request<AdminStats>("/stats");
}
