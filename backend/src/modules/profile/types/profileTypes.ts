import type { User } from "@prisma/client";

export type Goal = "LOSE_WEIGHT" | "GAIN_MUSCLE" | "MAINTAIN";
export type Experience = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ProfileResponse = Omit<User, "password">;
