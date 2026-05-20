import type { z } from "zod";
import type { calorieAnalyzeSchema } from "../schemas/calorieSchemas";

export type CalorieAnalyzeForm = z.infer<typeof calorieAnalyzeSchema>;

export interface CalorieItem {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface CalorieAnalysis {
  id: string;
  imageName?: string | null;
  description?: string | null;
  mealName: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  confidence: "low" | "medium" | "high" | string;
  notes: string;
  items: CalorieItem[];
  createdAt: string;
}
