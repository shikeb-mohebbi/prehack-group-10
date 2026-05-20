import type { SupplementSuggestion, User } from "@prisma/client";
import type {
  SupplementAiResponse,
  SupplementRequest,
  SupplementSuggestionData,
  SupplementSuggestionResponse,
} from "../types/supplementTypes";

export function buildSupplementPrompt(input: SupplementRequest, user: User | null) {
  const profile = user?.onboarded
    ? `User profile: age ${user.age}, weight ${user.weight}kg, height ${user.height}cm, goal ${user.goal}, experience ${user.experience}.`
    : "User profile is incomplete.";

  return `${profile}
Goal for suggestions: ${input.goal}
Diet pattern: ${input.diet}
Training frequency: ${input.trainingFrequency}
Current supplements: ${input.currentSupplements || "none"}
Health restrictions or cautions: ${input.restrictions || "none"}
Budget: ${input.budget}

Return JSON exactly like:
{
  "summary": "short summary",
  "nutritionGaps": ["protein", "omega-3"],
  "suggestions": [
    {
      "name": "Whey protein",
      "purpose": "helps reach daily protein target",
      "dosage": "20-30g",
      "timing": "after training or with meals",
      "priority": "high",
      "cautions": "avoid if dairy allergy"
    }
  ],
  "disclaimer": "short safety disclaimer"
}
Prioritize food first, simple supplements, and safety for beginners.`;
}

export function normalizeSupplementResponse(
  parsed: SupplementAiResponse
): SupplementSuggestionData {
  return {
    summary: parsed.summary || "Supplement suggestions generated for your goal.",
    nutritionGaps: Array.isArray(parsed.nutritionGaps)
      ? parsed.nutritionGaps.filter(Boolean).map(String)
      : [],
    suggestions: normalizeSuggestions(parsed.suggestions),
    disclaimer:
      parsed.disclaimer ||
      "Supplements are optional and are not medical advice. Check labels and ask a clinician when unsure.",
  };
}

export function toSupplementSuggestionResponse(
  suggestion: SupplementSuggestion,
  data: SupplementSuggestionData
): SupplementSuggestionResponse {
  return { ...suggestion, data };
}

function normalizeSuggestions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item?.name)
    .map((item) => ({
      name: String(item.name),
      purpose: String(item.purpose || "General support"),
      dosage: String(item.dosage || "Follow product label"),
      timing: String(item.timing || "With meals"),
      priority: String(item.priority || "medium"),
      cautions: String(item.cautions || "Check with a clinician if unsure."),
    }));
}
