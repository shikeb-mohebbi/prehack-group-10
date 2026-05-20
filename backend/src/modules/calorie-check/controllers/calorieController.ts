// ─────────────────────────────────────────────────────────────
// Calorie Check Controller
// Handles AI-powered meal photo / text analysis.
// POST /api/calorie/analyze  → analyze a meal and save result
// GET  /api/calorie          → list the user's saved analyses
// DELETE /api/calorie/:id    → delete one analysis record
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { groqChat, safeParseJson } from "../../../lib/groq";
import { AuthRequest } from "../../../middleware/auth";
import {
  buildCaloriePrompt,
  normalizeCalorieEstimate,
  toCalorieAnalysisResponse,
} from "../models/calorieModel";
import { calorieAnalyzeSchema } from "../schemas/calorieSchemas";
import type { CalorieAiResponse, CalorieItem } from "../types/calorieTypes";

// ── analyzeMealPhoto ──────────────────────────────────────────
// Validates the incoming request (image and/or text description),
// sends it to the Groq AI model for calorie estimation,
// then saves and returns the structured analysis.
export async function analyzeMealPhoto(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate the request body against the calorie schema.
    // The schema requires either an imageDataUrl or a description (or both).
    const input = calorieAnalyzeSchema.parse(req.body);
    const prompt = buildCaloriePrompt(input);

    // Check if a vision-capable model is configured in the environment.
    const visionModel = getConfiguredVisionModel();

    // Guard: if the user sent only a photo but no vision model is configured,
    // we can't analyse it. Ask them to add a text description instead.
    if (input.imageDataUrl && !visionModel && !input.description) {
      return res.status(400).json({
        error:
          "Photo analysis needs GROQ_VISION_MODEL on the server. Add meal notes to use text-only estimation.",
      });
    }

    // Build the user message content:
    // - Vision path: send both the text prompt AND the image as a multipart array.
    // - Text-only path: send just the text prompt string.
    const userContent = input.imageDataUrl && visionModel
      ? [
          { type: "text" as const, text: prompt },
          { type: "image_url" as const, image_url: { url: input.imageDataUrl } },
        ]
      : prompt;

    // Call the Groq AI model.
    // IMPORTANT: Vision models on Groq do NOT support response_format json_object.
    // When using a vision model we skip json mode and rely on safeParseJson to
    // extract the JSON block from the model's free-form text output.
    // For text-only requests we CAN use json mode for stricter output.
    const raw = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a nutrition analyst. Estimate calories from food photos or descriptions. Always return strict valid JSON and include uncertainty.",
        },
        { role: "user", content: userContent },
      ],
      {
        json: !(input.imageDataUrl && visionModel), // skip json mode for vision calls
        model: input.imageDataUrl && visionModel ? visionModel : undefined,
        temperature: 0.2,
      }
    );

    // Parse the AI's raw text output into a typed object,
    // stripping any markdown fences the model may have added.
    const parsed = safeParseJson<CalorieAiResponse>(raw);

    // Normalise the AI response: fill in missing fields, clamp numbers, etc.
    const estimate = normalizeCalorieEstimate(parsed);

    // Persist the analysis in the database linked to the current user.
    const analysis = await prisma.calorieAnalysis.create({
      data: {
        userId: req.userId!,
        imageName: input.imageName || null,
        description: input.description || null,
        mealName: estimate.mealName,
        calories: estimate.calories,
        protein: estimate.protein ?? null,
        carbs: estimate.carbs ?? null,
        fat: estimate.fat ?? null,
        confidence: estimate.confidence,
        notes: estimate.notes,
        // The items array is JSON-serialised because SQLite has no array type.
        data: JSON.stringify(estimate.items),
      },
    });

    // Return the newly created analysis with the parsed items array attached.
    return res.json({
      analysis: toCalorieAnalysisResponse(analysis, estimate.items),
    });
  } catch (error: any) {
    // Zod validation errors have an `issues` array — return the first message.
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}

// ── getCalorieAnalyses ────────────────────────────────────────
// Returns all saved calorie analyses for the logged-in user,
// most recent first, with the stored JSON items array decoded.
export async function getCalorieAnalyses(req: AuthRequest, res: Response) {
  const analyses = await prisma.calorieAnalysis.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    analyses: analyses.map((analysis) =>
      toCalorieAnalysisResponse(
        analysis,
        JSON.parse(analysis.data) as CalorieItem[]
      )
    ),
  });
}

// ── deleteCalorieAnalysis ─────────────────────────────────────
// Deletes a single analysis record. Uses deleteMany with both
// id and userId so a user can only delete their own records.
export async function deleteCalorieAnalysis(req: AuthRequest, res: Response) {
  await prisma.calorieAnalysis.deleteMany({
    where: { id: req.params.analysisId, userId: req.userId! },
  });

  return res.json({ ok: true });
}

// ── getConfiguredVisionModel (private) ───────────────────────
// Reads the GROQ_VISION_MODEL env variable.
// Returns undefined if it is blank or still set to a placeholder value,
// which signals callers to fall back to text-only analysis.
function getConfiguredVisionModel() {
  const value = process.env.GROQ_VISION_MODEL?.trim();
  if (!value || value.includes("your_")) return undefined;
  return value;
}
