// ─────────────────────────────────────────────────────────────
// Meal Controller
//
// Handles AI-powered meal plan generation and management:
//   generateMealPlan — call Groq AI, save to DB, return plan
//   getMealPlans     — list all plans for the current user
//   deleteMealPlan   — remove a plan from the DB
//
// Meal data (the structured object with breakfast/lunch/dinner/
// snacks arrays) is stored as a JSON string in MealPlan.data and
// parsed back into typed objects when returned to the client.
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { groqChat, safeParseJson } from "../../../lib/groq";
import { AuthRequest } from "../../../middleware/auth";
import {
  buildMealPrompt,
  normalizeMealData,
  toMealResponse,
} from "../models/mealModel";
import { generateMealSchema } from "../schemas/mealSchemas";
import type { MealAiResponse, MealData } from "../types/mealTypes";

// ── generateMealPlan ──────────────────────────────────────────
// POST /api/meals/generate
// Flow:
//   1. Validate the form input (calorieTarget, goal, preference).
//   2. Ask Groq AI (as a registered dietitian) for a day's meals
//      in strict JSON format, matching the MealAiResponse schema.
//   3. Parse and normalize the response into typed MealData.
//   4. Save the plan to the database under the current user.
//   5. Return the saved plan with its database ID.
export async function generateMealPlan(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const input = generateMealSchema.parse(req.body);
    const raw = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a registered dietitian. Always respond with strict valid JSON. No prose, no markdown.",
        },
        { role: "user", content: buildMealPrompt(input) },
      ],
      { json: true, temperature: 0.6 }
    );
    const parsed = safeParseJson<MealAiResponse>(raw);
    const mealData = normalizeMealData(parsed.meals);

    const plan = await prisma.mealPlan.create({
      data: {
        userId:        req.userId!,
        title:         parsed.title || `${input.calorieTarget} kcal plan`,
        calorieTarget: input.calorieTarget,
        goal:          input.goal,
        preference:    input.preference,
        data:          JSON.stringify(mealData),
      },
    });

    return res.json({ plan: toMealResponse(plan, mealData) });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}

// ── getMealPlans ──────────────────────────────────────────────
// GET /api/meals
// Returns all meal plans belonging to the current user, most
// recent first. The JSON string in plan.data is parsed back into
// a MealData object before being sent to the client.
export async function getMealPlans(req: AuthRequest, res: Response) {
  const plans = await prisma.mealPlan.findMany({
    where:   { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    plans: plans.map((plan) =>
      toMealResponse(plan, JSON.parse(plan.data) as MealData)
    ),
  });
}

// ── deleteMealPlan ────────────────────────────────────────────
// DELETE /api/meals/:planId
// Deletes a meal plan. The userId filter ensures users can only
// delete their own plans.
export async function deleteMealPlan(req: AuthRequest, res: Response) {
  await prisma.mealPlan.deleteMany({
    where: { id: req.params.planId, userId: req.userId! },
  });

  return res.json({ ok: true });
}
