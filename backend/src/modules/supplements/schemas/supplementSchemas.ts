import { z } from "zod";

export const supplementRequestSchema = z.object({
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN", "ENERGY", "RECOVERY"]),
  diet: z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KETO", "HIGH_PROTEIN"]),
  trainingFrequency: z.enum(["1-2", "3-4", "5+"]),
  budget: z.enum(["LOW", "MEDIUM", "HIGH"]),
  currentSupplements: z.string().trim().max(500).optional(),
  restrictions: z.string().trim().max(500).optional(),
});
