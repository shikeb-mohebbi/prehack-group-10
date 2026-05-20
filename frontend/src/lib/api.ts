// ─────────────────────────────────────────────────────────────
// Axios API Client
//
// Creates a shared Axios instance used by every feature module
// to make HTTP requests to the backend.
//
// baseURL resolution:
//   In production, VITE_API_URL is set to the deployed API origin.
//   In development, it is left unset — Vite's proxy configuration
//   in vite.config.ts forwards all /api/* requests to the backend
//   on port 4000, so baseURL="/api" works without CORS issues.
//
// withCredentials: true — required so the browser includes the
//   httpOnly "token" cookie on every request. Without this the
//   backend's auth middleware would always see an empty cookie.
// ─────────────────────────────────────────────────────────────

import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

export const api = axios.create({
  baseURL: configuredApiUrl || "/api",
  withCredentials: true,
});
