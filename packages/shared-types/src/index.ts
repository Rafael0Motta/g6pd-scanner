// Tipos compartilhados entre apps/api, apps/mobile e apps/admin.
// Devem espelhar os enums/modelos definidos em apps/api/prisma/schema.prisma.

export type Classificacao = "SEGURO" | "CAUTELA" | "CONTRAINDICADO" | "NAO_IDENTIFICADO";

export type OrigemProduto = "IA" | "MANUAL";

export type NivelRisco = "ALTO" | "MODERADO" | "BAIXO";

export type CategoriaSubstancia = "MEDICAMENTO" | "ALIMENTO" | "CORANTE" | "OUTRO";

export interface Device {
  id: string;
  deviceId: string;
  nomeApelido: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export interface Substance {
  id: string;
  nomeSubstancia: string;
  sinonimos: string[];
  nivelRisco: NivelRisco;
  categoria: CategoriaSubstancia;
  observacoes: string | null;
  fonteReferencia: string | null;
  updatedAt: string;
}

export interface ScanMatch {
  id: string;
  productId: string;
  substanceId: string;
  trechoDetectado: string;
  substance?: Substance;
}

export interface Product {
  id: string;
  deviceId: string;
  nomeProduto: string;
  imagemUrl: string | null;
  ingredientesExtraidos: string[];
  classificacao: Classificacao;
  confiancaDeteccao: number | null;
  origem: OrigemProduto;
  createdAt: string;
  matches?: ScanMatch[];
}

export interface Admin {
  id: string;
  email: string;
  nome: string;
  createdAt: string;
  lastLoginAt: string | null;
}

// ---- Payloads da IA (Anthropic) ----

export interface AiExtractionResult {
  nome_produto: string;
  ingredientes: string[];
  principio_ativo?: string;
  confianca: number;
}

// ---- Requests / Responses da API ----

export interface ScanResponse {
  product: Product;
  precisaConfirmacaoManual: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminLoginRequest {
  email: string;
  senha: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: Admin;
}

export interface AdminStats {
  totalScans: number;
  distribuicaoClassificacao: Record<Classificacao, number>;
  taxaNaoIdentificado: number;
  totalDevices: number;
  totalSubstancias: number;
}

export const CONFIANCA_MINIMA_AUTOMATICA = 0.7;

export const DEVICE_ID_HEADER = "x-device-id";
