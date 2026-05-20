// ─────────────────────────────────────────────────────────────
// Supplement Controller
//
// Handles AI-powered supplement suggestions and management:
//   suggestSupplements         — call Groq AI, save to DB
//   getSupplementSuggestions   — list all suggestions for user
//   deleteSupplementSuggestion — remove a suggestion from DB
//
// The AI is prompted to act as an evidence-based sports nutrition
// coach and return beginner-safe suggestions only. Low temperature
// (0.4) makes answers more deterministic and fact-based.
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { groqChat, safeParseJson } from "../../../lib/groq";
import { AuthRequest } from "../../../middleware/auth";
import {
  buildSupplementPrompt,
  normalizeSupplementResponse,
  toSupplementSuggestionResponse,
} from "../models/supplementModel";
import { supplementRequestSchema } from "../schemas/supplementSchemas";
import type {
  SupplementAiResponse,
  SupplementSuggestionData,
} from "../types/supplementTypes";

// ── suggestSupplements ────────────────────────────────────────
// POST /api/supplements/suggest
// Flow:
//   1. Validate the form input (goal, diet, trainingFrequency,
//      budget, currentSupplements, restrictions).
//   2. Fetch the user profile so the AI can personalise advice.
//   3. Ask Groq AI for supplement suggestions in JSON format.
//   4. Parse and normalize the AI response.
//   5. Save the suggestion to the database under the current user.
//   6. Return the saved suggestion with its database ID.
export async function suggestSupplements(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const input = supplementRequestSchema.parse(req.body);
    const user  = await prisma.user.findUnique({ where: { id: req.userId! } });
    const raw   = await groqChat(
      [
        {
          role: "system",
          content:
            "You are an evidence-based sports nutrition coach. Suggest beginner-safe supplements only. Always return strict valid JSON.",
        },
        { role: "user", content: buildSupplementPrompt(input, user) },
      ],
      { json: true, temperature: 0.4 }
    );
    const parsed     = safeParseJson<SupplementAiResponse>(raw);
    const normalized = normalizeSupplementResponse(parsed);

    const suggestion = await prisma.supplementSuggestion.create({
      data: {
        userId:  req.userId!,
        goal:    input.goal,
        summary: normalized.summary,
        data:    JSON.stringify(normalized),
      },
    });

    return res.json({
      suggestion: toSupplementSuggestionResponse(suggestion, normalized),
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}

// ── getSupplementSuggestions ──────────────────────────────────
// GET /api/supplements
// Returns all supplement suggestions belonging to the current
// user, most recent first. The JSON string in suggestion.data is
// parsed back into a SupplementSuggestionData object before
// being sent to the client.
export async function getSupplementSuggestions(req: AuthRequest, res: Response) {
  const suggestions = await prisma.supplementSuggestion.findMany({
    where:   { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    suggestions: suggestions.map((suggestion) =>
      toSupplementSuggestionResponse(
        suggestion,
        JSON.parse(suggestion.data) as SupplementSuggestionData
      )
    ),
  });
}

// ── deleteSupplementSuggestion ────────────────────────────────
// DELETE /api/supplements/:suggestionId
// Deletes a supplement suggestion. The userId filter ensures
// users can only delete their own suggestions.
export async function deleteSupplementSuggestion(req: AuthRequest, res: Response) {
  await prisma.supplementSuggestion.deleteMany({
    where: { id: req.params.suggestionId, userId: req.userId! },
  });

  return res.json({ ok: true });
}
