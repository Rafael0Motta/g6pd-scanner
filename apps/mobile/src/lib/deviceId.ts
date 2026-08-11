import { Preferences } from "@capacitor/preferences";

const STORAGE_KEY = "g6pd_device_id";
const ONBOARDING_KEY = "g6pd_onboarding_concluido";

function gerarUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback simples para ambientes sem crypto.randomUUID (webviews antigas).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retorna o device_id anonimo persistido localmente, gerando-o na primeira
 * abertura do app. Sem login: este UUID e o unico identificador do usuario.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await Preferences.get({ key: STORAGE_KEY });
  if (existing.value) {
    return existing.value;
  }
  const deviceId = gerarUuid();
  await Preferences.set({ key: STORAGE_KEY, value: deviceId });
  return deviceId;
}

export async function isOnboardingConcluido(): Promise<boolean> {
  const result = await Preferences.get({ key: ONBOARDING_KEY });
  return result.value === "true";
}

export async function marcarOnboardingConcluido(): Promise<void> {
  await Preferences.set({ key: ONBOARDING_KEY, value: "true" });
}
