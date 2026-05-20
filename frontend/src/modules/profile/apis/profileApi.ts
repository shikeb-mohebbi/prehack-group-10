import { api } from "../../../lib/api";
import type { ProfileForm, ProfileResponse } from "../types/profileTypes";

export async function updateProfile(input: ProfileForm) {
  const { data } = await api.put<{ profile: ProfileResponse }>("/profile", input);
  return data.profile;
}
