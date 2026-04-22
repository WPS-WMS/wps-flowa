function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

// URL da API (chamadas fetch). Se não definida, cai no Render de produção.
const API_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_API_URL ?? "https://wps-one-backend-production.onrender.com",
);

/** Base usada em `apiFetch` e como fallback para ficheiros públicos. */
export const API_BASE_URL = API_URL;

/**
 * Base para montar URLs de ficheiros servidos em `/uploads/...` (portal, avatares, anexos relativos).
 * Defina `NEXT_PUBLIC_ASSET_PUBLIC_ORIGIN` no build do frontend quando quiser outro domínio na barra
 * de endereços (ex.: `https://api.wpsone.com.br` após apontar DNS + domínio customizado no Render).
 * Para usar `https://wpsone.com.br/...`, o hosting tem de fazer proxy de `/uploads` para a API.
 * Se vazio, usa a mesma base que `NEXT_PUBLIC_API_URL`.
 */
export const ASSET_PUBLIC_BASE_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_ASSET_PUBLIC_ORIGIN?.trim() || API_URL,
);

/** Monta URL absoluta para paths relativos da API (ex.: `/uploads/portal/...`). */
export function publicFileUrl(path: string): string {
  const p = String(path || "").trim();
  if (!p) return "";
  if (p.startsWith("data:") || p.startsWith("blob:")) return p;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${ASSET_PUBLIC_BASE_URL}${p}`;
  return `${ASSET_PUBLIC_BASE_URL}/${p}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Compat: versões antigas podem ter salvo como "token"
  return localStorage.getItem("wps_token") || localStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  try {
    const res = await fetch(url, { ...options, headers });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro de rede";
    throw new Error(`Falha ao conectar com a API: ${msg}. Verifique se o backend está rodando em ${API_BASE_URL}`);
  }
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("wps_token", token);
    // Compat: outras telas/ambientes podem procurar por "token"
    localStorage.setItem("token", token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wps_token");
    localStorage.removeItem("token");
  }
}
