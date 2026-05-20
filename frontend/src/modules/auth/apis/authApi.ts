import { api } from "../../../lib/api";
import type { User } from "../types/authTypes";

export async function getCurrentUser() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<{ user: User }>("/auth/login", {
    email,
    password,
  });
  return data.user;
}

export async function registerUser(name: string, email: string, password: string) {
  const { data } = await api.post<{ user: User }>("/auth/register", {
    name,
    email,
    password,
  });
  return data.user;
}

export async function logoutUser() {
  await api.post("/auth/logout");
}

export async function forgotPassword(email: string) {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  await api.post("/auth/reset-password", { token, password });
}
