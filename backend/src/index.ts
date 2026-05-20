// ─────────────────────────────────────────────────────────────
// Express App Entry Point
//
// This file wires together every piece of the backend:
//   1. Loads environment variables from .env (dotenv/config).
//   2. Creates the Express app and registers global middleware
//      (CORS, JSON body parsing, cookie parsing).
//   3. Mounts each feature module's router under /api/<feature>.
//   4. Registers a catch-all error handler for unexpected crashes.
//   5. Starts the HTTP server on the configured PORT.
// ─────────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/routers/authRouter";
import profileRoutes from "./modules/profile/routers/profileRouter";
import workoutRoutes from "./modules/workouts/routers/workoutRouter";
import mealRoutes from "./modules/meals/routers/mealRouter";
import chatRoutes from "./modules/chat/routers/chatRouter";
import calorieRoutes from "./modules/calorie-check/routers/calorieRouter";
import supplementRoutes from "./modules/supplements/routers/supplementRouter";

const app = express();

// ── expandClientOrigins ───────────────────────────────────────
// CLIENT_URL can be a comma-separated list of origins.
// This function expands each origin so that both "localhost" and
// "127.0.0.1" variants are automatically allowed — without this,
// a browser using 127.0.0.1 would be blocked if CLIENT_URL only
// lists localhost (or vice versa).
function expandClientOrigins(value: string) {
  const origins = new Set<string>();
  for (const rawOrigin of value.split(",")) {
    const origin = rawOrigin.trim().replace(/\/+$/, "");
    if (!origin) continue;
    origins.add(origin);

    try {
      const url = new URL(origin);
      if (url.hostname === "localhost") {
        url.hostname = "127.0.0.1";
        origins.add(url.toString().replace(/\/+$/, ""));
      } else if (url.hostname === "127.0.0.1") {
        url.hostname = "localhost";
        origins.add(url.toString().replace(/\/+$/, ""));
      }
    } catch {
      // Ignore invalid origins; CORS will reject them below.
    }
  }
  return origins;
}

// Build the set of allowed CORS origins from environment.
// Default: http://localhost:5173 (Vite dev server).
const allowedOrigins = expandClientOrigins(
  process.env.CLIENT_URL || "http://localhost:5173"
);

// ── Global middleware ─────────────────────────────────────────

// CORS — only the origins listed in CLIENT_URL are permitted.
// credentials: true is required so the browser sends cookies
// (the auth token cookie) with every cross-origin request.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

// Parse JSON request bodies up to 8 MB — needed because calorie
// check requests can include a base64-encoded photo (typically 2–4 MB).
app.use(express.json({ limit: "8mb" }));

// Parse cookies from the request headers so req.cookies.token
// is available in the auth middleware.
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────
// Simple endpoint the frontend (or monitoring tools) can hit to
// confirm the server is running. Returns { ok: true }.
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ── Feature routers ───────────────────────────────────────────
// Each module handles one feature domain and is mounted under its
// own /api/<name> prefix.  Routes within each router are relative
// to this prefix (e.g. authRouter has "/login" → /api/auth/login).
app.use("/api/auth",        authRoutes);
app.use("/api/profile",     profileRoutes);
app.use("/api/workouts",    workoutRoutes);
app.use("/api/meals",       mealRoutes);
app.use("/api/chat",        chatRoutes);
app.use("/api/calorie",     calorieRoutes);
app.use("/api/supplements", supplementRoutes);

// ── Global error handler ──────────────────────────────────────
// Express calls this 4-argument middleware whenever a route calls
// next(err) or throws inside an async handler.
// Returns a JSON error response with the appropriate HTTP status.
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[error]", err);
    const status = err.status || 500;
    res
      .status(status)
      .json({ error: err.message || "Internal server error" });
  }
);

// ── Server start ──────────────────────────────────────────────
// Reads PORT from the environment (default 4000).
// The Vite proxy in the frontend is configured to forward /api
// requests to this same port.
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`FitAI Coach API listening on http://localhost:${PORT}`);
});
