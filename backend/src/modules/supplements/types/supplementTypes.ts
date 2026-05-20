import type { SupplementSuggestion } from "@prisma/client";
import type { z } from "zod";
import type { supplementRequestSchema } from "../schemas/supplementSchemas";

export type SupplementRequest = z.infer<typeof supplementRequestSchema>;

export type SupplementCard = {
  name: string;
  purpose: string;
  dosage: string;
  timing: string;
  priority: "low" | "medium" | "high" | string;
  cautions: string;
};

export type SupplementAiResponse = {
  summary: string;
  nutritionGaps?: string[];
  suggestions?: SupplementCard[];
  disclaimer?: string;
};

export type SupplementSuggestionData = Required<SupplementAiResponse> & {
  suggestions: SupplementCard[];
};

export type SupplementSuggestionResponse = Omit<SupplementSuggestion, "data"> & {
  data: SupplementSuggestionData;
};
