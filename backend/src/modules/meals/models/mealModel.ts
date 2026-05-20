import type { MealPlan } from "@prisma/client";
import type {
  GenerateMealInput,
  MealData,
  MealPlanResponse,
} from "../types/mealTypes";

export function buildMealPrompt(input: GenerateMealInput) {
  return `Create a 1-day meal plan totalling about ${input.calorieTarget} calories.
Goal: ${input.goal}
Dietary preference: ${input.preference}

Respond as JSON exactly like:
{
  "title": "string",
  "meals": {
    "breakfast": [{ "name": "Oatmeal with berries", "calories": 350, "protein": 18, "carbs": 48, "fat": 8 }],
    "lunch": [{ "name": "Grilled chicken salad", "calories": 500, "protein": 45, "carbs": 30, "fat": 18 }],
    "dinner": [{ "name": "Salmon and rice", "calories": 600, "protein": 42, "carbs": 55, "fat": 22 }],
    "snacks": [{ "name": "Greek yogurt", "calories": 150, "protein": 17, "carbs": 10, "fat": 4 }]
  }
}
Make calories sum near the target.`;
}

export function normalizeMealData(meals: Partial<MealData> | undefined): MealData {
  const source = (meals || {}) as Partial<MealData>;
  return {
    breakfast: normalizeMeals(source.breakfast),
    lunch: normalizeMeals(source.lunch),
    dinner: normalizeMeals(source.dinner),
    snacks: normalizeMeals(source.snacks),
  };
}

export function toMealResponse(
  plan: MealPlan,
  data: MealData
): MealPlanResponse {
  return { ...plan, data };
}

function normalizeMeals(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((meal) => meal?.name)
    .map((meal) => ({
      name: String(meal.name),
      calories: Number.isFinite(meal.calories) ? meal.calories : 0,
      protein: optionalNumber(meal.protein),
      carbs: optionalNumber(meal.carbs),
      fat: optionalNumber(meal.fat),
    }));
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
