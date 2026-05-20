import type { z } from "zod";
import type { profileSchema } from "../schemas/profileSchemas";

export type Goal = "LOSE_WEIGHT" | "GAIN_MUSCLE" | "MAINTAIN";
export type Experience = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ProfileForm = z.infer<typeof profileSchema>;

export interface ProfileResponse extends ProfileForm {
  id: string;
  name: string;
  email: string;
  onboarded: boolean;
}
