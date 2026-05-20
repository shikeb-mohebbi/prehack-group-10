import type { User } from "@prisma/client";
import type { SafeUser } from "../types/authTypes";

export function toSafeUser(user: User): SafeUser {
  const { password, ...safe } = user;
  return safe;
}
