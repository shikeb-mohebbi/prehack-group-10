import type { WorkoutPlan } from "@prisma/client";
import type {
  DayPlan,
  GenerateWorkoutInput,
  WorkoutAiResponse,
  WorkoutPlanResponse,
} from "../types/workoutTypes";

export function buildWorkoutPrompt(input: GenerateWorkoutInput) {
  return `Build a ${input.days}-day weekly workout plan.
Goal: ${input.goal}
Experience: ${input.experience}
Equipment: ${input.equipment}

Respond as JSON exactly like:
{
  "title": "string",
  "days": [
    { "day": "Day 1 - Push", "exercises": [ { "name": "Bench Press", "sets": 4, "reps": "8-10" } ] }
  ]
}
Each day must have 4-6 exercises with realistic sets and reps.`;
}

export function normalizeWorkoutPlan(parsed: WorkoutAiResponse): DayPlan[] {
  if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
    throw new Error("AI response did not include workout days. Please try again.");
  }

  return parsed.days.map((day, dayIndex) => ({
    day: day.day || `Day ${dayIndex + 1}`,
    exercises: (Array.isArray(day.exercises) ? day.exercises : [])
      .filter((exercise) => exercise?.name)
      .map((exercise, exerciseIndex) => ({
        id: `${dayIndex}-${exerciseIndex}`,
        name: exercise.name,
        sets: Number.isFinite(exercise.sets) ? exercise.sets : 3,
        reps: String(exercise.reps || "8-12"),
        done: false,
      })),
  }));
}

export function toWorkoutResponse(
  plan: WorkoutPlan,
  data: DayPlan[]
): WorkoutPlanResponse {
  return { ...plan, data };
}
