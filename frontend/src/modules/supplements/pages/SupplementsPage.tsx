// ─────────────────────────────────────────────────────────────
// Supplements Page — AI Supplement Suggestions
//
// Lets users get evidence-based supplement recommendations
// personalised to their goal, diet, training frequency, and budget.
//
// Form fields:
//   goal               — fitness objective
//   diet               — dietary preference / restriction
//   trainingFrequency  — how many days per week they train
//   budget             — LOW / MEDIUM / HIGH
//   currentSupplements — what they already take (text, optional)
//   restrictions       — allergies or medical notes (text, optional)
//
// Each saved suggestion shows:
//   • Goal chip + summary
//   • Nutrition gap chips (e.g. "Vitamin D")
//   • Per-supplement cards with name, priority, purpose,
//     dosage, timing, and caution notes
//   • Disclaimer text from the AI
//
// State management:
//   useQuery  — loads saved suggestions (GET /api/supplements)
//   useMutation (suggest) — calls POST /api/supplements/suggest
//   useMutation (remove)  — calls DELETE /api/supplements/:id
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pill, ShieldCheck, Trash2 } from "lucide-react";
import BackButton from "../../../components/BackButton";
import EmptyState from "../../../components/ui/EmptyState";
import AiGeneratingState from "../../../components/ui/AiGeneratingState";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";
import {
  deleteSupplementSuggestion,
  getSupplementSuggestions,
  suggestSupplements,
} from "../apis/supplementApi";
import { supplementSchema } from "../schemas/supplementSchemas";
import type { SupplementForm } from "../types/supplementTypes";

// Default form values shown when the page first loads
const defaultForm: SupplementForm = {
  goal:               "GAIN_MUSCLE",
  diet:               "NONE",
  trainingFrequency:  "3-4",
  budget:             "MEDIUM",
  currentSupplements: "",
  restrictions:       "",
};

export default function SupplementsPage() {
  const queryClient = useQueryClient();
  const [form,  setForm]  = useState<SupplementForm>(defaultForm);
  const [error, setError] = useState("");

  // ── Data fetching ─────────────────────────────────────────
  const suggestions = useQuery({
    queryKey: ["supplement-suggestions"],
    queryFn:  getSupplementSuggestions,
  });

  // ── Mutations ─────────────────────────────────────────────

  // suggest — calls AI for personalised supplement recommendations
  const suggest = useMutation({
    mutationFn: suggestSupplements,
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["supplement-suggestions"] });
    },
    onError: (err: any) =>
      setError(getApiErrorMessage(err, "Failed to generate suggestions. Check your API key or try again.")),
  });

  // remove — deletes a saved suggestion
  const remove = useMutation({
    mutationFn: deleteSupplementSuggestion,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["supplement-suggestions"] }),
    onError:    (err) =>
      setError(getApiErrorMessage(err, "Could not delete that suggestion. Please try again.")),
  });

  // Helper to update a single form field without replacing the whole object
  const update = (key: keyof SupplementForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton />
      <header>
        <p className="section-label mb-1">Supplement Hub</p>
        <h1 className="text-3xl font-extrabold text-fg">AI Supplement Suggestions</h1>
        <p className="text-muted text-sm mt-1">
          Food-first supplement ideas matched to your goal, diet, and routine.
        </p>
      </header>

      {/* ── Config form ── */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          const parsed = supplementSchema.safeParse(form);
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message || "Check the supplement form and try again.");
            return;
          }
          suggest.mutate(parsed.data);
        }}
        className="card grid md:grid-cols-3 gap-4"
      >
        <Select
          label="Goal"
          value={form.goal}
          onChange={(value) => update("goal", value)}
          options={[
            ["LOSE_WEIGHT", "Lose Weight"],
            ["GAIN_MUSCLE", "Gain Muscle"],
            ["MAINTAIN",    "Maintain"],
            ["ENERGY",      "Energy"],
            ["RECOVERY",    "Recovery"],
          ]}
        />
        <Select
          label="Diet"
          value={form.diet}
          onChange={(value) => update("diet", value)}
          options={[
            ["NONE",         "No preference"],
            ["VEGETARIAN",   "Vegetarian"],
            ["VEGAN",        "Vegan"],
            ["HALAL",        "Halal"],
            ["KETO",         "Keto"],
            ["HIGH_PROTEIN", "High protein"],
          ]}
        />
        <Select
          label="Training"
          value={form.trainingFrequency}
          onChange={(value) => update("trainingFrequency", value)}
          options={[
            ["1-2", "1-2 days/week"],
            ["3-4", "3-4 days/week"],
            ["5+",  "5+ days/week"],
          ]}
        />
        <Select
          label="Budget"
          value={form.budget}
          onChange={(value) => update("budget", value)}
          options={[
            ["LOW",    "Low"],
            ["MEDIUM", "Medium"],
            ["HIGH",   "High"],
          ]}
        />
        <div>
          <label className="label">Current supplements</label>
          <input
            className="input"
            value={form.currentSupplements}
            onChange={(event) => update("currentSupplements", event.target.value)}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="label">Restrictions</label>
          <input
            className="input"
            value={form.restrictions}
            onChange={(event) => update("restrictions", event.target.value)}
            placeholder="Allergies, medical notes"
          />
        </div>
        {error && (
          <div className="md:col-span-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <button className="btn-primary md:col-span-3 !py-3" disabled={suggest.isPending}>
          {suggest.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Pill className="h-4 w-4" /> Generate suggestions</>}
        </button>
      </form>

      {/* ── AI generating overlay ── */}
      {suggest.isPending && (
        <div className="card border-accent/25">
          <AiGeneratingState label="Researching supplements for your profile…" />
        </div>
      )}

      {/* ── Saved suggestions list ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-fg">Saved suggestions</h2>

        {suggestions.isLoading && (
          <div className="card animate-pulse space-y-3">
            <div className="h-5 bg-panel2 rounded w-1/4" />
            <div className="h-3 bg-panel2 rounded w-2/5" />
            <div className="h-3 bg-panel2 rounded w-1/3" />
          </div>
        )}

        {suggestions.isError && (
          <div className="card">
            <ErrorState
              message={getApiErrorMessage(suggestions.error, "Could not load supplement suggestions.")}
              onRetry={() => void suggestions.refetch()}
            />
          </div>
        )}

        {!suggestions.isLoading && !suggestions.isError && suggestions.data?.length === 0 && (
          <div className="card">
            <EmptyState
              icon={Pill}
              title="No supplement suggestions yet"
              description="Fill in the form above to get AI-powered supplement recommendations based on your goals."
            />
          </div>
        )}

        {/* Suggestion cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          {!suggestions.isError && suggestions.data?.map((suggestion) => (
            <article key={suggestion.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip-accent">{suggestion.goal}</span>
                  <h3 className="font-bold text-lg mt-3">{suggestion.data.summary}</h3>
                </div>
                <button onClick={() => remove.mutate(suggestion.id)} className="btn-ghost !p-2" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Nutrition gap chips (e.g. "Vitamin D", "Omega-3") */}
              {suggestion.data.nutritionGaps.length > 0 && (
                <div className="flex gap-2 flex-wrap my-4">
                  {suggestion.data.nutritionGaps.map((gap) => (
                    <span key={gap} className="chip">{gap}</span>
                  ))}
                </div>
              )}

              {/* Individual supplement items */}
              <ul className="space-y-3">
                {suggestion.data.suggestions.map((item) => (
                  <li key={item.name} className="rounded-xl bg-panel2 border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-bold">{item.name}</h4>
                      <span className="chip-brand">{item.priority}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{item.purpose}</p>
                    <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs text-muted">
                      <span>Dosage: {item.dosage}</span>
                      <span>Timing: {item.timing}</span>
                    </div>
                    <p className="text-xs text-muted mt-2">Caution: {item.cautions}</p>
                  </li>
                ))}
              </ul>

              {/* AI-generated safety disclaimer */}
              <p className="mt-4 text-xs text-muted flex gap-2">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                {suggestion.data.disclaimer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
// Reusable labelled <select> used in the supplement form.
// Options are passed as [value, label] tuples.
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}
