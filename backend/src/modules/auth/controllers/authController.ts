// ─────────────────────────────────────────────────────────────
// Auth Controller
//
// Handles all authentication flows:
//   registerUser     — create account, set auth cookie
//   loginUser        — verify credentials, set auth cookie
//   logoutUser       — clear auth cookie
//   getCurrentUser   — return the signed-in user's data
//   forgotPassword   — generate reset token, send email
//   resetPassword    — verify token, update password
//
// All routes that need a logged-in user receive the userId
// via req.userId (set by requireAuth middleware before this
// controller is called).
// ─────────────────────────────────────────────────────────────

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../../lib/prisma";
import {
  AuthRequest,
  clearAuthCookie,
  setAuthCookie,
  signToken,
} from "../../../middleware/auth";
import { toSafeUser } from "../models/authModel";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas";
import { sendPasswordResetEmail } from "../../../lib/email";

// ── registerUser ──────────────────────────────────────────────
// POST /api/auth/register
// Validates the request body (name, email, password) using
// registerSchema, checks for duplicate emails, hashes the
// password with bcrypt (10 salt rounds), and creates the user
// in the database. On success, signs a JWT and attaches it as
// an httpOnly cookie, then returns the safe user object.
export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });

    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hash },
    });

    setAuthCookie(res, signToken(user.id));
    return res.json({ user: toSafeUser(user) });
  } catch (error: any) {
    if (error?.issues) return res.status(400).json({ error: error.issues[0].message });
    return next(error);
  }
}

// ── loginUser ─────────────────────────────────────────────────
// POST /api/auth/login
// Validates email + password, looks up the user by email, and
// uses bcrypt.compare to verify the password against the stored
// hash. Both "user not found" and "wrong password" return the
// same 401 message to prevent email enumeration.
// On success, signs and attaches the JWT cookie.
export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    setAuthCookie(res, signToken(user.id));
    return res.json({ user: toSafeUser(user) });
  } catch (error: any) {
    if (error?.issues) return res.status(400).json({ error: error.issues[0].message });
    return next(error);
  }
}

// ── logoutUser ────────────────────────────────────────────────
// POST /api/auth/logout
// Removes the auth cookie from the browser by calling
// clearAuthCookie (which sets maxAge=0). No database changes —
// JWT-based auth is stateless so there is no session to destroy.
export function logoutUser(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

// ── getCurrentUser ────────────────────────────────────────────
// GET /api/auth/me
// Protected by requireAuth middleware — req.userId is guaranteed.
// Fetches the full user record from the database and returns it
// without the password field (toSafeUser strips it).
// Used by the frontend AuthProvider on app load to restore session.
export async function getCurrentUser(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });

  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ user: toSafeUser(user) });
}

// ── forgotPassword ────────────────────────────────────────────
// POST /api/auth/forgot-password
// Accepts an email address and, if a matching user exists:
//   1. Deletes any existing reset tokens for that user.
//   2. Generates a cryptographically random 32-byte token.
//   3. Stores the SHA-256 hash of the token (not the raw token)
//      in the PasswordReset table with a 1-hour expiry.
//   4. Sends the raw token embedded in a reset URL to the user's email.
//
// Always returns { ok: true } even if the email is not registered
// — this prevents an attacker from discovering which emails exist.
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ ok: true });
    }

    // Delete any existing tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Generate a secure random token — stored as a SHA-256 hash in the DB
    // so a leaked database cannot be used to reset passwords directly.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const clientUrl = getPrimaryClientUrl();
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.json({ ok: true });
  } catch (error: any) {
    if (error?.issues) return res.status(400).json({ error: error.issues[0].message });
    return next(error);
  }
}

// ── getPrimaryClientUrl (private) ─────────────────────────────
// Extracts the first URL from the comma-separated CLIENT_URL env
// variable. Used to build the password reset link that is emailed
// to the user — it must point to the frontend, not the API.
function getPrimaryClientUrl() {
  const configured = process.env.CLIENT_URL || "http://localhost:5173";
  return configured.split(",")[0].trim().replace(/\/+$/, "");
}

// ── resetPassword ─────────────────────────────────────────────
// POST /api/auth/reset-password
// Accepts the raw token (from the URL query string) and a new
// password. Hashes the token, looks up the matching record, and
// checks it hasn't expired. If valid: updates the user's password
// hash and deletes the reset record so the token can't be reused.
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.passwordReset.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt < new Date()) {
      await prisma.passwordReset.deleteMany({ where: { tokenHash } });
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hash },
    });

    // Consume the token so it cannot be reused.
    await prisma.passwordReset.delete({ where: { tokenHash } });

    return res.json({ ok: true });
  } catch (error: any) {
    if (error?.issues) return res.status(400).json({ error: error.issues[0].message });
    return next(error);
  }
}
