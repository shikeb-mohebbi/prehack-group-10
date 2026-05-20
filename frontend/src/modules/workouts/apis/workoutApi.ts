import { api } from "../../../lib/api";
import type { WorkoutForm, WorkoutPlan } from "../types/workoutTypes";

export async function getWorkoutPlans() {
  const { data } = await api.get<{ plans: WorkoutPlan[] }>("/workouts");
  return data.plans;
}

export async function generateWorkoutPlan(input: WorkoutForm) {
  const { data } = await api.post<{ plan: WorkoutPlan }>("/workouts/generate", input);
  return data.plan;
}

export async function toggleWorkoutExercise(planId: string, exId: string) {
  const { data } = await api.patch<{ plan: WorkoutPlan }>(
    `/workouts/${planId}/exercise/${exId}`
  );
  return data.plan;
}

export async function deleteWorkoutPlan(id: string) {
  await api.delete(`/workouts/${id}`);
}
