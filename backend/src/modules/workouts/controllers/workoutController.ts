// ─────────────────────────────────────────────────────────────
// Workout Controller
//
// Handles AI-powered workout plan generation and management:
//   generateWorkoutPlan — call Groq AI, save to DB, return plan
//   getWorkoutPlans     — list all plans for the current user
//   toggleExercise      — mark an exercise done / not done
//   deleteWorkoutPlan   — remove a plan from the DB
//
// Workout data (the array of day plans with exercises) is stored
// as a JSON string in WorkoutPlan.data. It is parsed back into
// typed objects whenever a plan is returned to the client.
// ─────────────────────────────────────────────────────────────

import { NextFunction, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { groqChat, safeParseJson } from "../../../lib/groq";
import { AuthRequest } from "../../../middleware/auth";
import {
  buildWorkoutPrompt,
  normalizeWorkoutPlan,
  toWorkoutResponse,
} from "../models/workoutModel";
import { generateWorkoutSchema } from "../schemas/workoutSchemas";
import type { DayPlan, WorkoutAiResponse } from "../types/workoutTypes";

// ── generateWorkoutPlan ───────────────────────────────────────
// POST /api/workouts/generate
// Flow:
//   1. Validate the form input (goal, days, experience, equipment).
//   2. Ask Groq AI for a weekly workout plan in JSON format.
//   3. Parse and normalize the AI response into a typed DayPlan[].
//   4. Save the plan to the database under the current user.
//   5. Return the saved plan with its database ID.
export async function generateWorkoutPlan(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const input = generateWorkoutSchema.parse(req.body);
    const raw = await groqChat(
      [
        {
          role: "system",
          content:
            "You are an expert fitness coach. Always respond with strict valid JSON matching the requested schema. No prose, no markdown.",
        },
        { role: "user", content: buildWorkoutPrompt(input) },
      ],
      { json: true, temperature: 0.6 }
    );
    const parsed = safeParseJson<WorkoutAiResponse>(raw);
    const dayPlans = normalizeWorkoutPlan(parsed);

    const plan = await prisma.workoutPlan.create({
      data: {
        userId:     req.userId!,
        title:      parsed.title || `${input.goal} - ${input.days} day plan`,
        goal:       input.goal,
        days:       input.days,
        experience: input.experience,
        equipment:  input.equipment,
        data:       JSON.stringify(dayPlans),
      },
    });

    return res.json({ plan: toWorkoutResponse(plan, dayPlans) });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    return next(error);
  }
}

// ── getWorkoutPlans ───────────────────────────────────────────
// GET /api/workouts
// Returns all workout plans belonging to the current user, most
// recent first. The JSON string in plan.data is parsed back into
// DayPlan[] before being sent so the client receives typed objects.
export async function getWorkoutPlans(req: AuthRequest, res: Response) {
  const plans = await prisma.workoutPlan.findMany({
    where:   { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    plans: plans.map((plan) =>
      toWorkoutResponse(plan, JSON.parse(plan.data) as DayPlan[])
    ),
  });
}

// ── toggleExercise ────────────────────────────────────────────
// PATCH /api/workouts/:planId/exercises/:exId/toggle
// Flips the `done` boolean on a single exercise within a plan.
// The entire plan.data JSON is rewritten on each toggle because
// SQLite doesn't support partial JSON updates.
// Returns the full updated plan so the client can re-render.
export async function toggleExercise(req: AuthRequest, res: Response) {
  const { planId, exId } = req.params;
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: req.userId! },
  });

  if (!plan) {
    return res.status(404).json({ error: "Not found" });
  }

  const days = JSON.parse(plan.data) as DayPlan[];
  let found = false;
  for (const day of days) {
    for (const exercise of day.exercises) {
      if (exercise.id === exId) {
        exercise.done = !exercise.done;
        found = true;
      }
    }
  }

  if (!found) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  const updated = await prisma.workoutPlan.update({
    where: { id: plan.id },
    data:  { data: JSON.stringify(days) },
  });

  return res.json({ plan: toWorkoutResponse(updated, days) });
}

// ── deleteWorkoutPlan ─────────────────────────────────────────
// DELETE /api/workouts/:planId
// Deletes a workout plan. The userId filter ensures users can
// only delete their own plans (not other users' data).
export async function deleteWorkoutPlan(req: AuthRequest, res: Response) {
  await prisma.workoutPlan.deleteMany({
    where: { id: req.params.planId, userId: req.userId! },
  });

  return res.json({ ok: true });
}
