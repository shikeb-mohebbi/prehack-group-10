import { api } from "../../../lib/api";
import type { MealForm, MealPlan } from "../types/mealTypes";

export async function getMealPlans() {
  const { data } = await api.get<{ plans: MealPlan[] }>("/meals");
  return data.plans;
}

export async function generateMealPlan(input: MealForm) {
  const { data } = await api.post<{ plan: MealPlan }>("/meals/generate", input);
  return data.plan;
}

export async function deleteMealPlan(id: string) {
  await api.delete(`/meals/${id}`);
}
