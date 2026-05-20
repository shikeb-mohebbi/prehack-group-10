import type { z } from "zod";
import type { Experience, Goal } from "../../profile/types/profileTypes";
import type { workoutSchema } from "../schemas/workoutSchemas";

export type WorkoutForm = z.infer<typeof workoutSchema>;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  done: boolean;
}

export interface DayPlan {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  goal: Goal;
  days: number;
  experience: Experience;
  equipment: "HOME" | "GYM";
  data: DayPlan[];
  createdAt: string;
}
