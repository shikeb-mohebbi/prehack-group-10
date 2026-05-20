// ─────────────────────────────────────────────────────────────
// API Error Message Helper
//
// Centralises the logic for turning an unknown error value
// (from a catch block or React Query's onError callback) into
// a user-friendly string that can be displayed in the UI.
//
// Priority order for extracting the message:
//   1. Server-sent error body: { error: "..." } or { message: "..." }
//   2. Well-known HTTP status codes (401 → session expired)
//   3. Network errors (no response received at all)
//   4. Generic JavaScript Error objects
//   5. The caller-provided fallback string
// ─────────────────────────────────────────────────────────────

import axios from "axios";

type ErrorPayload = {
  error?: string;
  message?: string;
};

// ── getApiErrorMessage ────────────────────────────────────────
// Accepts any thrown value and returns a human-readable string.
//
// Usage in React Query:
//   onError: (error) => setErr(getApiErrorMessage(error))
//
// Usage in async try/catch:
//   catch (err) { setError(getApiErrorMessage(err, "Save failed")) }
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    // Use the server's own error message if available.
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (serverMessage) return serverMessage;

    // Expired or missing cookie — ask the user to log in again.
    if (error.response?.status === 401) {
      return "Your session expired. Please sign in again.";
    }

    // No response at all — backend isn't reachable.
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Could not reach the server. Check that the backend is running and try again.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
