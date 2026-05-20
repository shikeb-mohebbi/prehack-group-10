import type { WorkoutPlan } from "@prisma/client";
import type { z } from "zod";
import type { generateWorkoutSchema } from "../schemas/workoutSchemas";

export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  done: boolean;
};

export type DayPlan = {
  day: string;
  exercises: Exercise[];
};

export type WorkoutAiResponse = {
  title: string;
  days: {
    day: string;
    exercises: { name: string; sets: number; reps: string | number }[];
  }[];
};

export type WorkoutPlanResponse = Omit<WorkoutPlan, "data"> & {
  data: DayPlan[];
};
