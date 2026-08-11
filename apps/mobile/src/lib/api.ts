import { DEVICE_ID_HEADER } from "@g6pd/shared-types";
import type { PaginatedResponse, Product, ScanResponse, Substance, Classificacao } from "@g6pd/shared-types";
import { getOrCreateDeviceId } from "./deviceId";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function authHeaders(): Promise<Record<string, string>> {
  const deviceId = await getOrCreateDeviceId();
  return { [DEVICE_ID_HEADER]: deviceId };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro na requisicao (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function enviarScan(imageBase64: string, mediaType: "image/jpeg" | "image/png" | "image/webp"): Promise<ScanResponse> {
  return request<ScanResponse>("/api/scan", {
    method: "POST",
    body: JSON.stringify({ imageBase64, mediaType }),
  });
}

export async function listarProdutos(params: {
  page?: number;
  classificacao?: Classificacao;
  busca?: string;
} = {}): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.classificacao) query.set("classificacao", params.classificacao);
  if (params.busca) query.set("busca", params.busca);
  return request<PaginatedResponse<Product>>(`/api/products?${query.toString()}`);
}

export async function buscarProduto(id: string): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

export async function editarProduto(id: string, dados: Partial<Pick<Product, "nomeProduto" | "classificacao">>): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export async function excluirProduto(id: string): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: "DELETE" });
}

export async function buscarSubstancias(busca?: string): Promise<Substance[]> {
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
  return request<Substance[]>(`/api/substances${query}`);
}
