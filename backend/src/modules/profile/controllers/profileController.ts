// ─────────────────────────────────────────────────────────────
// Profile Controller
//
// Handles reading and updating the currently signed-in user's
// fitness profile (age, weight, height, goal, experience level).
//
// Both routes are protected by requireAuth middleware, so
// req.userId is always present when these functions run.
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth";
import { toProfileResponse } from "../models/profileModel";
import { profileSchema } from "../schemas/profileSchemas";

// ── getProfile ────────────────────────────────────────────────
// GET /api/profile
// Fetches the user record and returns it through toProfileResponse,
// which shapes it into the profile fields the frontend expects
// (excludes the password hash and other internal fields).
export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });

  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ profile: toProfileResponse(user) });
}

// ── updateProfile ─────────────────────────────────────────────
// PUT /api/profile
// Validates the request body against profileSchema (age, weight,
// height, goal, experience) and writes the changes to the database.
// Also sets onboarded=true so new users won't be redirected to the
// onboarding page after they complete it for the first time.
export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { ...data, onboarded: true },
    });

    return res.json({ profile: toProfileResponse(user) });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}
