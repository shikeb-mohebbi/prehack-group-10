import { z } from "zod";

export const profileSchema = z.object({
  age: z.coerce.number().int().min(10).max(120),
  weight: z.coerce.number().min(20).max(400),
  height: z.coerce.number().min(80).max(260),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});
