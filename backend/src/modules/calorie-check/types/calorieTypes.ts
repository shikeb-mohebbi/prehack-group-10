import type { CalorieAnalysis } from "@prisma/client";
import type { z } from "zod";
import type { calorieAnalyzeSchema } from "../schemas/calorieSchemas";

export type CalorieAnalyzeInput = z.infer<typeof calorieAnalyzeSchema>;

export type CalorieItem = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type CalorieAiResponse = {
  mealName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: string;
  notes?: string;
  items?: CalorieItem[];
};

export type CalorieEstimate = Required<
  Pick<CalorieAiResponse, "mealName" | "calories" | "confidence" | "notes">
> &
  Pick<CalorieAiResponse, "protein" | "carbs" | "fat"> & {
    items: CalorieItem[];
  };

export type CalorieAnalysisResponse = Omit<CalorieAnalysis, "data"> & {
  items: CalorieItem[];
};
