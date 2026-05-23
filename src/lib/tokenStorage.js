// src/lib/tokenStorage.js
// ─────────────────────────────────────────────────────────────────────────────
// Couche d'abstraction sur le stockage des tokens.
// Centralise les clés et facilite un futur passage à sessionStorage
// ou à des cookies httpOnly sans toucher au reste du code.
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_KEY = "kelasi_access_token";
const REFRESH_KEY = "kelasi_refresh_token";

// ── Lecture ──────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// ── Écriture ─────────────────────────────────────────────────
export const setTokens = ({ accessToken, refreshToken }) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
};

// ── Suppression ──────────────────────────────────────────────
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// ── Décodage JWT sans dépendance externe ─────────────────────
// Retourne le payload décodé, ou null si le token est absent/malformé.
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// ── Vérifie si un access token est expiré (avec marge de 60s) ─
export const isTokenExpiredSoon = (token, marginSeconds = 60) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp - Date.now() / 1000 < marginSeconds;
};
