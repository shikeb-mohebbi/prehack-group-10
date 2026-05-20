import { api } from "../../../lib/api";
import type {
  SupplementForm,
  SupplementSuggestion,
} from "../types/supplementTypes";

export async function suggestSupplements(input: SupplementForm) {
  const { data } = await api.post<{ suggestion: SupplementSuggestion }>(
    "/supplements/suggest",
    input
  );
  return data.suggestion;
}

export async function getSupplementSuggestions() {
  const { data } = await api.get<{ suggestions: SupplementSuggestion[] }>(
    "/supplements"
  );
  return data.suggestions;
}

export async function deleteSupplementSuggestion(id: string) {
  await api.delete(`/supplements/${id}`);
}
