import { z } from "zod";

export const goalSchema = z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]);
export const experienceSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  age: z.number().int().min(10).max(120),
  weight: z.number().min(20).max(400),
  height: z.number().min(80).max(260),
  goal: goalSchema,
  experience: experienceSchema,
});
