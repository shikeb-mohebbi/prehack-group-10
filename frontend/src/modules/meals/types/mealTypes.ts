import type { z } from "zod";
import type { Goal } from "../../profile/types/profileTypes";
import type { mealSchema } from "../schemas/mealSchemas";

export type MealForm = z.infer<typeof mealSchema>;

export interface Meal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealData {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
}

export interface MealPlan {
  id: string;
  title: string;
  calorieTarget: number;
  goal: Goal;
  preference: string;
  data: MealData;
  createdAt: string;
}
