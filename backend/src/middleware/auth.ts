// ─────────────────────────────────────────────────────────────
// Auth Middleware
//
// Provides three things used across the whole backend:
//   1. requireAuth  — Express middleware that rejects requests
//                     without a valid JWT cookie.
//   2. signToken    — Creates a signed JWT for a given userId.
//   3. setAuthCookie / clearAuthCookie — Attach or remove the
//                     httpOnly cookie that stores the JWT.
// ─────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express's Request so controllers can read req.userId
// after the requireAuth middleware has verified the token.
export interface AuthRequest extends Request {
  userId?: string;
}

// ── requireAuth ───────────────────────────────────────────────
// Middleware applied to every protected route.
// Reads the "token" cookie, verifies it with JWT_SECRET, and
// attaches the decoded userId to req so the controller can use it.
// Returns 401 if the cookie is missing or the token is invalid/expired.
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    // jwt.verify throws if the signature is wrong or the token is expired.
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    req.userId = payload.sub; // sub = the user's database id
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── signToken ─────────────────────────────────────────────────
// Creates a signed JWT that encodes the userId as the "sub" claim.
// Tokens expire after 7 days — the user must log in again after that.
export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

// ── authCookieOptions (private) ───────────────────────────────
// Returns the correct cookie settings depending on the environment.
//   Development  — SameSite=lax, Secure=false  (works over plain http)
//   Production   — SameSite=none, Secure=true  (required for cross-site requests over https)
function authCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true, // JS on the page cannot read this cookie (XSS protection)
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    secure: isProduction,
    path: "/",
  };
}

// ── setAuthCookie ─────────────────────────────────────────────
// Attaches the JWT as an httpOnly cookie on the response.
// Called after a successful login or registration.
export function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    ...authCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
}

// ── clearAuthCookie ───────────────────────────────────────────
// Removes the auth cookie, effectively logging the user out.
// Must use the same path/sameSite/secure options as when it was set.
export function clearAuthCookie(res: Response) {
  res.clearCookie("token", authCookieOptions());
}
