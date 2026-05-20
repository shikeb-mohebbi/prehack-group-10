import type { z } from "zod";
import type { supplementSchema } from "../schemas/supplementSchemas";

export type SupplementForm = z.infer<typeof supplementSchema>;

export interface SupplementCard {
  name: string;
  purpose: string;
  dosage: string;
  timing: string;
  priority: string;
  cautions: string;
}

export interface SupplementSuggestionData {
  summary: string;
  nutritionGaps: string[];
  suggestions: SupplementCard[];
  disclaimer: string;
}

export interface SupplementSuggestion {
  id: string;
  goal: string;
  summary: string;
  data: SupplementSuggestionData;
  createdAt: string;
}
