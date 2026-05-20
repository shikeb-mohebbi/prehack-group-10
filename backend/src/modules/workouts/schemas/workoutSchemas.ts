import { z } from "zod";

export const generateWorkoutSchema = z.object({
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]),
  days: z.number().int().min(3).max(6),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  equipment: z.enum(["HOME", "GYM"]),
});
