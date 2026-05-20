// ─────────────────────────────────────────────────────────────
// Workouts Page — AI Workout Generator
//
// Lets users configure and generate a personalised weekly workout
// plan using the Groq AI backend, then displays all saved plans.
//
// Form fields: goal, days/week, experience level, equipment
// After generation: the new plan appears at the top of the list.
//
// Each plan shows:
//   • Plan title + metadata chips
//   • Per-day panels with a progress bar
//   • Exercise list where each item can be ticked off as "done"
//   • Delete button to remove the plan
//
// State management:
//   useQuery  — loads and caches the plan list
//   useMutation (generate) — calls POST /api/workouts/generate
//   useMutation (toggle)   — calls PATCH to flip exercise.done
//   useMutation (del)      — calls DELETE /api/workouts/:id
// ─────────────────────────────────────────────────────────────

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWorkoutPlan,
  generateWorkoutPlan,
  getWorkoutPlans,
  toggleWorkoutExercise,
} from "../apis/workoutApi";
import { workoutSchema } from "../schemas/workoutSchemas";
import { useState } from "react";
import { Check, Trash2, Loader2, Timer, Repeat, Trophy, Dumbbell } from "lucide-react";
import BackButton from "../../../components/BackButton";
import EmptyState from "../../../components/ui/EmptyState";
import AiGeneratingState from "../../../components/ui/AiGeneratingState";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";
import { exerciseIcon } from "../../../lib/icons";

type Form = z.infer<typeof workoutSchema>;

export default function Workouts() {
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
    queryKey: ["workouts"],
    queryFn:  getWorkoutPlans,
  });

  // ── Form setup ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(workoutSchema),
    defaultValues: { goal: "GAIN_MUSCLE", days: 4, experience: "BEGINNER", equipment: "GYM" },
  });

  // ── Mutations ─────────────────────────────────────────────

  // generate — calls AI to create a new plan, then refreshes the list
  const generate = useMutation({
    mutationFn: generateWorkoutPlan,
    onSuccess:  () => { setErr(""); qc.invalidateQueries({ queryKey: ["workouts"] }); },
    onError:    (error) =>
      setErr(getApiErrorMessage(error, "Failed to generate. Check your API key or try again.")),
  });

  // toggle — flips done/not-done on a single exercise
  const toggle = useMutation({
    mutationFn: async ({ planId, exId }: { planId: string; exId: string }) =>
      toggleWorkoutExercise(planId, exId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
    onError:   (error) =>
      setErr(getApiErrorMessage(error, "Could not update that exercise. Please try again.")),
  });

  // del — removes an entire workout plan
  const del = useMutation({
    mutationFn: deleteWorkoutPlan,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["workouts"] }),
    onError:    (error) =>
      setErr(getApiErrorMessage(error, "Could not delete that workout plan. Please try again.")),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />
      <header>
        <p className="section-label mb-1">Workout Engine</p>
        <h1 className="text-3xl font-extrabold text-fg">AI Workout Generator</h1>
        <p className="text-muted text-sm mt-1">Tell us your goal — get a tailored weekly plan in seconds.</p>
      </header>

      {/* ── Config form ── */}
      <form
        onSubmit={handleSubmit((d) => { setErr(""); generate.mutate(d); })}
        className="card grid sm:grid-cols-4 gap-4"
      >
        <div>
          <label className="label">Goal</label>
          <select className="input" {...register("goal")}>
            <option value="LOSE_WEIGHT">Lose Weight</option>
            <option value="GAIN_MUSCLE">Gain Muscle</option>
            <option value="MAINTAIN">Maintain</option>
          </select>
        </div>
        <div>
          <label className="label">Days / week</label>
          <input className="input" type="number" min={3} max={6} {...register("days")} />
          {errors.days && <p className="text-red-400 text-xs mt-1">{errors.days.message}</p>}
        </div>
        <div>
          <label className="label">Level</label>
          <select className="input" {...register("experience")}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div>
          <label className="label">Equipment</label>
          <select className="input" {...register("equipment")}>
            <option value="HOME">Home (no gym)</option>
            <option value="GYM">Gym</option>
          </select>
        </div>
        {err && (
          <div className="sm:col-span-4 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {err}
          </div>
        )}
        <button className="btn-primary sm:col-span-4 !py-3" disabled={generate.isPending}>
          {generate.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating with AI…</>
            : <><Dumbbell className="h-4 w-4" /> Generate my workout plan</>}
        </button>
      </form>

      {/* ── AI generating overlay ── */}
      {generate.isPending && (
        <div className="card border-accent/25">
          <AiGeneratingState label="Building your personalized workout plan…" />
        </div>
      )}

      {/* ── Saved plans list ── */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-fg">Saved workouts</h2>

        {isLoading && <LoadingPlans />}

        {isError && (
          <div className="card">
            <ErrorState
              message={getApiErrorMessage(plansError, "Could not load workout plans.")}
              onRetry={() => void refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && plans?.length === 0 && (
          <div className="card">
            <EmptyState
              icon={Dumbbell}
              title="No workout plans yet"
              description="Generate your first AI workout plan above. It takes less than 15 seconds."
            />
          </div>
        )}

        {!isError && plans?.map((p, pi) => (
          <div key={p.id} className={`card animate-slide-up stagger-${Math.min(pi + 1, 6)}`}>
            {/* Plan header: title, metadata chips, delete button */}
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-lg text-fg">{p.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="chip-accent">{p.goal.replace("_", " ")}</span>
                  <span className="chip">{p.days} days/wk</span>
                  <span className="chip">{p.experience.toLowerCase()}</span>
                  <span className="chip">{p.equipment.toLowerCase()}</span>
                </div>
              </div>
              <button
                onClick={() => del.mutate(p.id)}
                className="btn-ghost !p-2 hover:!text-red-400 hover:!border-red-400/30"
                title="Delete plan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Per-day exercise panels */}
            <div className="grid md:grid-cols-2 gap-4">
              {p.data.map((d, di) => {
                const doneCount      = d.exercises.filter((e) => e.done).length;
                const total          = d.exercises.length;
                const allDone        = doneCount === total && total > 0;
                const pct            = total > 0 ? Math.round((doneCount / total) * 100) : 0;
                const firstUndoneIdx = d.exercises.findIndex((e) => !e.done);
                return (
                  <div
                    key={d.day}
                    className={`rounded-2xl bg-panel2 border p-4 transition-all animate-pop-in stagger-${Math.min(di + 1, 6)} ${
                      allDone ? "border-accent/50 shadow-glow" : "border-border"
                    }`}
                  >
                    {/* Day label + trophy icon when all exercises done */}
                    <div className="font-semibold mb-2 flex items-center justify-between">
                      <span className="text-fg">{d.day}</span>
                      <div className="flex items-center gap-2">
                        {allDone && <Trophy className="h-4 w-4 text-amber-400 animate-check-pop" />}
                        <span className="chip text-[11px]">{total} ex</span>
                      </div>
                    </div>

                    {/* Completion progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                        <span>{doneCount}/{total} done</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-panel overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-grad-primary" : "bg-accent"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Exercise rows — click to toggle done */}
                    <ul className="space-y-2.5">
                      {d.exercises.map((e, ei) => {
                        const Icon      = exerciseIcon(e.name);
                        const isActive  = !e.done && ei === firstUndoneIdx;
                        return (
                          <li
                            key={e.id}
                            className={`flex items-center gap-3 rounded-xl bg-panel border p-2.5 transition-all hover:border-accent/40 hover:-translate-y-[1px] ${
                              e.done
                                ? "opacity-60 border-border"
                                : isActive
                                ? "border-accent/40 animate-pulse-glow"
                                : "border-border"
                            }`}
                          >
                            <span className="h-10 w-10 rounded-lg bg-panel2 border border-border flex items-center justify-center shrink-0 text-accent">
                              <Icon size={22} />
                            </span>
                            <button
                              onClick={() => toggle.mutate({ planId: p.id, exId: e.id })}
                              className="flex-1 text-left"
                            >
                              <div className={`font-medium text-sm ${e.done ? "line-through text-muted" : "text-fg"}`}>
                                {e.name}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted">
                                <span className="inline-flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />{e.sets}×{e.reps}
                                </span>
                                {("rest" in e && (e as any).rest) && (
                                  <span className="inline-flex items-center gap-1">
                                    <Timer className="h-3 w-3" />{(e as any).rest}s rest
                                  </span>
                                )}
                              </div>
                            </button>
                            {/* Checkbox indicator */}
                            <span
                              className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                e.done ? "bg-grad-primary border-transparent" : "border-border"
                              }`}
                            >
                              {e.done && <Check className="h-3.5 w-3.5 text-white animate-check-pop" />}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LoadingPlans ──────────────────────────────────────────────
// Skeleton placeholder shown while the plan list is loading.
function LoadingPlans() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="h-5 bg-panel2 rounded-lg w-1/3" />
      <div className="h-3 bg-panel2 rounded w-1/4" />
      <div className="grid md:grid-cols-2 gap-4 mt-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-panel2 h-44" />
        ))}
      </div>
    </div>
  );
}
