// ─────────────────────────────────────────────────────────────
// Meals Page — AI Meal Planner
//
// Lets users configure and generate a full-day meal plan using
// the Groq AI backend, then displays all saved plans.
//
// Form fields: calorie target, fitness goal, dietary preference
// After generation: new plan appears at the top of the list.
//
// Each plan shows:
//   • Plan title + metadata (calorie target, actual kcal, goal, diet)
//   • Four meal sections: Breakfast, Lunch, Dinner, Snacks
//   • Each meal item shows name, calories, protein/carbs/fat
//   • Delete button to remove the plan
//
// State management:
//   useQuery  — loads and caches the plan list
//   useMutation (generate) — calls POST /api/meals/generate
//   useMutation (del)      — calls DELETE /api/meals/:id
// ─────────────────────────────────────────────────────────────

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMealPlan,
  generateMealPlan,
  getMealPlans,
} from "../apis/mealApi";
import { mealSchema } from "../schemas/mealSchemas";
import type { MealPlan } from "../types/mealTypes";
import { useState } from "react";
import { Trash2, Loader2, Flame, Salad } from "lucide-react";
import BackButton from "../../../components/BackButton";
import EmptyState from "../../../components/ui/EmptyState";
import AiGeneratingState from "../../../components/ui/AiGeneratingState";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";
import { mealIcon } from "../../../lib/icons";

type Form = z.infer<typeof mealSchema>;

// Labels for each meal section shown in the plan card
const sectionLabels: Record<keyof MealPlan["data"], string> = {
  breakfast: "Breakfast",
  lunch:     "Lunch",
  dinner:    "Dinner",
  snacks:    "Snacks",
};

export default function Meals() {
  const qc = useQueryClient();
  const [err, setErr] = useState("");

  // ── Data fetching ─────────────────────────────────────────
  const {
    data: plans,
    isLoading,
    isError,
    error: plansError,
    refetch,
  } = useQuery({
    queryKey: ["meals"],
    queryFn:  getMealPlans,
  });

  // ── Form setup ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(mealSchema),
    defaultValues: { calorieTarget: 2000, goal: "MAINTAIN", preference: "NONE" },
  });

  // ── Mutations ─────────────────────────────────────────────

  // generate — calls AI to create a meal plan, then refreshes the list
  const generate = useMutation({
    mutationFn: generateMealPlan,
    onSuccess:  () => { setErr(""); qc.invalidateQueries({ queryKey: ["meals"] }); },
    onError:    (error) =>
      setErr(getApiErrorMessage(error, "Failed to generate. Check your API key or try again.")),
  });

  // del — removes an entire meal plan
  const del = useMutation({
    mutationFn: deleteMealPlan,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["meals"] }),
    onError:    (error) =>
      setErr(getApiErrorMessage(error, "Could not delete that meal plan. Please try again.")),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />
      <header>
        <p className="section-label mb-1">Nutrition Intelligence</p>
        <h1 className="text-3xl font-extrabold text-fg">AI Meal Planner</h1>
        <p className="text-muted text-sm mt-1">Balanced, preference-aware meals to hit your daily target.</p>
      </header>

      {/* ── Config form ── */}
      <form
        onSubmit={handleSubmit((d) => { setErr(""); generate.mutate(d); })}
        className="card grid sm:grid-cols-3 gap-4"
      >
        <div>
          <label className="label">Calorie target</label>
          <input className="input" type="number" {...register("calorieTarget")} />
          {errors.calorieTarget && (
            <p className="text-red-400 text-xs mt-1">{errors.calorieTarget.message}</p>
          )}
        </div>
        <div>
          <label className="label">Goal</label>
          <select className="input" {...register("goal")}>
            <option value="LOSE_WEIGHT">Lose Weight</option>
            <option value="GAIN_MUSCLE">Gain Muscle</option>
            <option value="MAINTAIN">Maintain</option>
          </select>
        </div>
        <div>
          <label className="label">Diet</label>
          <select className="input" {...register("preference")}>
            <option value="NONE">No preference</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="VEGAN">Vegan</option>
            <option value="HALAL">Halal</option>
            <option value="KETO">Keto</option>
            <option value="HIGH_PROTEIN">High protein</option>
          </select>
        </div>
        {err && (
          <div className="sm:col-span-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {err}
          </div>
        )}
        <button className="btn-primary sm:col-span-3 !py-3" disabled={generate.isPending}>
          {generate.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Salad className="h-4 w-4" /> Generate meal plan</>}
        </button>
      </form>

      {/* ── AI generating overlay ── */}
      {generate.isPending && (
        <div className="card border-accent/25">
          <AiGeneratingState label="Building your personalized meal plan…" />
        </div>
      )}

      {/* ── Saved meal plans ── */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-fg">Saved meal plans</h2>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="card animate-pulse space-y-3">
            <div className="h-5 bg-panel2 rounded w-1/3" />
            <div className="grid md:grid-cols-4 gap-3 mt-2">
              {[0,1,2,3].map(i => <div key={i} className="rounded-xl bg-panel2 h-36" />)}
            </div>
          </div>
        )}

        {isError && (
          <div className="card">
            <ErrorState
              message={getApiErrorMessage(plansError, "Could not load meal plans.")}
              onRetry={() => void refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && plans?.length === 0 && (
          <div className="card">
            <EmptyState
              icon={Salad}
              title="No meal plans yet"
              description="Generate a meal plan above. Tell us your calorie target and dietary preferences."
            />
          </div>
        )}

        {!isError && plans?.map((p) => {
          // Sum all meal calories across sections to show actual vs target
          const total = (Object.values(p.data) as { calories: number }[][])
            .flat()
            .reduce((s, m) => s + (m.calories || 0), 0);
          return (
            <div key={p.id} className="card">
              {/* Plan header */}
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="chip-accent">Target {p.calorieTarget} kcal</span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      <Flame className="h-3 w-3" /> ~{total} kcal
                    </span>
                    <span className="chip">{p.goal.replace("_", " ")}</span>
                    <span className="chip">{p.preference}</span>
                  </div>
                </div>
                <button onClick={() => del.mutate(p.id)} className="btn-ghost !p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Meal sections: Breakfast, Lunch, Dinner, Snacks */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {(Object.keys(p.data) as (keyof MealPlan["data"])[]).map((k) => {
                  const SectionIcon = mealIcon(k);
                  return (
                    <div key={k} className="rounded-2xl bg-panel2 border border-border p-4 transition hover:border-accent/40">
                      <div className="font-semibold mb-3 flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-panel border border-border flex items-center justify-center text-brand">
                          <SectionIcon size={18} />
                        </span>
                        {sectionLabels[k]}
                      </div>

                      {/* Individual meal items */}
                      <ul className="space-y-2">
                        {p.data[k].map((m, i) => (
                          <li key={i} className="flex gap-3 items-center rounded-xl bg-panel border border-border p-2 transition hover:border-accent/40">
                            <span className="h-10 w-10 rounded-lg bg-panel2 border border-border flex items-center justify-center shrink-0 text-accent">
                              <SectionIcon size={20} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{m.name}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/25">{m.calories} kcal</span>
                                {(m as any).protein != null && <span className="chip">P {(m as any).protein}g</span>}
                                {(m as any).carbs   != null && <span className="chip">C {(m as any).carbs}g</span>}
                                {(m as any).fat     != null && <span className="chip">F {(m as any).fat}g</span>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
