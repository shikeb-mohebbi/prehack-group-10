import type { Experience, Goal } from "../../profile/types/profileTypes";

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal?: Goal | null;
  experience?: Experience | null;
  onboarded: boolean;
}
