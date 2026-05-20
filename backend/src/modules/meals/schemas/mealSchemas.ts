import { z } from "zod";

export const generateMealSchema = z.object({
  calorieTarget: z.number().int().min(1000).max(5000),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]),
  preference: z.enum([
    "NONE",
    "VEGETARIAN",
    "VEGAN",
    "HALAL",
    "KETO",
    "HIGH_PROTEIN",
  ]),
});
