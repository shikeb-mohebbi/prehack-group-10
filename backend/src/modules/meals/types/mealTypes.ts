import type { MealPlan } from "@prisma/client";
import type { z } from "zod";
import type { generateMealSchema } from "../schemas/mealSchemas";

export type GenerateMealInput = z.infer<typeof generateMealSchema>;

export type Meal = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type MealData = {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks: Meal[];
};

export type MealAiResponse = {
  title: string;
  meals: MealData;
};

export type MealPlanResponse = Omit<MealPlan, "data"> & {
  data: MealData;
};
