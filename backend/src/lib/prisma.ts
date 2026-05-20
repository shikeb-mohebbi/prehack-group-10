// ─────────────────────────────────────────────────────────────
// Prisma Client singleton
//
// Creating a new PrismaClient() opens a connection pool to the
// SQLite database file defined by DATABASE_URL in .env.
// We export a single shared instance so every module reuses the
// same pool instead of opening a new connection each time.
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
