import { z } from "zod";

export const mealSchema = z.object({
  calorieTarget: z.coerce.number().int().min(1000).max(5000),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]),
  preference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KETO", "HIGH_PROTEIN"]),
});
