/**
 * Backend kökü (protokol + host + port, sonda / yok).
 * Mobil ile aynı API: varsayılan http://localhost:5103 (launchSettings "http" profili).
 * Farklı makine / IP için .env içinde VITE_API_ORIGIN kullan.
 */
const raw = import.meta.env.VITE_API_ORIGIN || "http://localhost:5103";
export const API_ORIGIN = String(raw).replace(/\/$/, "");

/** /api öneki ile controller kökü */
export const API_URL = `${API_ORIGIN}/api`;

export const API_AUTH_URL = `${API_ORIGIN}/api/auth`;

/** Göreli görsel yolu veya tam URL */
export function assetUrl(path) {
  if (path == null || path === "") return "";
  const p = String(path);
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${API_ORIGIN}/${p.replace(/^\//, "")}`;
}
