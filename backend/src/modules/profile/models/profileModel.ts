import type { User } from "@prisma/client";
import type { ProfileResponse } from "../types/profileTypes";

export function toProfileResponse(user: User): ProfileResponse {
  const { password, ...profile } = user;
  return profile;
}
