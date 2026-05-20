import { api } from "../../../lib/api";
import type {
  CalorieAnalysis,
  CalorieAnalyzeForm,
} from "../types/calorieTypes";

export async function analyzeMealPhoto(input: CalorieAnalyzeForm) {
  const { data } = await api.post<{ analysis: CalorieAnalysis }>(
    "/calorie/analyze",
    input
  );
  return data.analysis;
}

export async function getCalorieAnalyses() {
  const { data } = await api.get<{ analyses: CalorieAnalysis[] }>("/calorie");
  return data.analyses;
}

export async function deleteCalorieAnalysis(id: string) {
  await api.delete(`/calorie/${id}`);
}
