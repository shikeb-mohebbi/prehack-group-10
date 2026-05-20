// ─────────────────────────────────────────────────────────────
// Dashboard Page
//
// The home screen shown after login. Provides an overview of
// the user's activity and quick access to all AI features.
//
// Sections:
//   • Welcome header with name and workout streak counter
//   • Daily motivational quote (rotates by day-of-month)
//   • Stats row: goal, experience level, saved plan count
//   • Quick action tiles linking to the main AI features
//   • Latest workout plan preview (first 3 days)
//   • Latest meal plan preview (meal counts per section)
//   • "More AI tools" strip: Supplements and AI Chat
//
// Data:
//   workoutPlans and mealPlans are fetched via React Query so
//   they share the same cache as the individual feature pages.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../../auth/components/AuthProvider";
import { getMealPlans } from "../../meals/apis/mealApi";
import { getWorkoutPlans } from "../../workouts/apis/workoutApi";
import { dashboardQuotes, goalLabel } from "../types/dashboardTypes";
import ErrorState from "../../../components/ui/ErrorState";
import { getApiErrorMessage } from "../../../lib/errors";
import {
  ArrowRight,
  Bot,
  Camera,
  Dumbbell,
  Flame,
  MessageSquare,
  Pill,
  Quote,
  Salad,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // ── Data fetching ─────────────────────────────────────────
  // Both queries share cache keys with the Workouts/Meals pages,
  // so data isn't re-fetched when the user navigates back here.
  const workouts = useQuery({ queryKey: ["workouts"], queryFn: getWorkoutPlans });
  const meals    = useQuery({ queryKey: ["meals"],    queryFn: getMealPlans });

  const latestWorkout = workouts.data?.[0];
  const latestMeal    = meals.data?.[0];

  // ── Motivational quote ────────────────────────────────────
  // Picks a quote deterministically by day-of-month so it
  // changes daily without needing API calls or random seeds.
  const quote = useMemo(
    () => dashboardQuotes[new Date().getDate() % dashboardQuotes.length],
    []
  );

  // ── Streak counter ────────────────────────────────────────
  // Derived from the first character of the user ID as a simple
  // pseudo-random stable value. Not a real streak tracker.
  const streak = useMemo(() => {
    const base = user?.id ? user.id.charCodeAt(0) % 14 : 3;
    return Math.max(1, base + 1);
  }, [user?.id]);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome header ── */}
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="section-label mb-1">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-black text-fg">{user?.name ?? "Athlete"}</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-grad-primary text-white shadow-glow">
          <Flame className="h-5 w-5" />
          <div className="text-sm">
            <div className="font-extrabold leading-none">{streak} day</div>
            <div className="text-[11px] opacity-85 leading-none mt-0.5">streak</div>
          </div>
        </div>
      </header>

      {/* ── Motivational quote card ── */}
      <div className="relative rounded-2xl bg-grad-primary overflow-hidden shadow-glow p-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex items-start gap-3">
          <Quote className="h-5 w-5 shrink-0 mt-0.5 opacity-80" />
          <p className="text-sm sm:text-base font-medium italic leading-relaxed">{quote}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Target}    label="Goal"        value={goalLabel[user?.goal || "MAINTAIN"]} />
        <StatCard icon={TrendingUp} label="Level"      value={(user?.experience || "—").toLowerCase()} />
        <StatCard icon={Dumbbell}  label="Saved plans" value={String(workouts.data?.length ?? 0)} />
      </section>

      {/* ── Quick actions ── */}
      <section>
        <p className="section-label mb-3">Quick actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction to="/workouts"      icon={Dumbbell}      label="Generate Workout" tag="Workout Engine" />
          <QuickAction to="/meals"         icon={Salad}         label="Meal Planner"     tag="Nutrition AI" />
          <QuickAction to="/chat"          icon={MessageSquare} label="AI Coach Chat"    tag="AI Coach" />
          <QuickAction to="/calorie-check" icon={Camera}        label="Calorie Check"    tag="Smart Calories" />
        </div>
      </section>

      {/* ── Latest workout + meal plan preview cards ── */}
      <section className="grid md:grid-cols-2 gap-5">
        <PlanCard
          title="Latest workout"
          link="/workouts"
          isLoading={workouts.isLoading}
          error={workouts.error}
          onRetry={() => void workouts.refetch()}
          empty={!latestWorkout}
          emptyMsg="No workout plans yet."
          emptyCta="/workouts"
        >
          {latestWorkout && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-sm text-fg">{latestWorkout.title}</div>
                  <div className="text-xs text-muted">
                    {latestWorkout.days} days · {latestWorkout.experience.toLowerCase()} · {latestWorkout.equipment.toLowerCase()}
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {latestWorkout.data.slice(0, 3).map((d) => (
                  <li key={d.day} className="flex justify-between text-xs text-muted border-b border-border/50 pb-1.5 last:border-0">
                    <span>{d.day}</span>
                    <span className="chip-accent">{d.exercises.length} ex</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </PlanCard>

        <PlanCard
          title="Latest meal plan"
          link="/meals"
          isLoading={meals.isLoading}
          error={meals.error}
          onRetry={() => void meals.refetch()}
          empty={!latestMeal}
          emptyMsg="No meal plans yet."
          emptyCta="/meals"
        >
          {latestMeal && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Salad className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-sm text-fg">{latestMeal.title}</div>
                  <div className="text-xs text-muted">{latestMeal.calorieTarget} kcal · {goalLabel[latestMeal.goal]}</div>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted">
                {[
                  { label: "Breakfast", count: latestMeal.data.breakfast.length },
                  { label: "Lunch",     count: latestMeal.data.lunch.length },
                  { label: "Dinner",    count: latestMeal.data.dinner.length },
                  { label: "Snacks",    count: latestMeal.data.snacks.length },
                ].map((r) => (
                  <li key={r.label} className="flex justify-between border-b border-border/50 pb-1.5 last:border-0">
                    <span>{r.label}</span>
                    <span className="chip-accent">{r.count} items</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </PlanCard>
      </section>

      {/* ── "More AI tools" feature strip ── */}
      <section>
        <p className="section-label mb-3">More AI tools</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <FeatureStrip to="/supplements" icon={Pill} title="Supplement Suggestions" desc="AI-picked supplements for your goal" />
          <FeatureStrip to="/chat"        icon={Bot}  title="AI Coach Chat"           desc="Ask anything about training or nutrition" />
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

// StatCard — single stat tile (goal, level, plan count)
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card card-hover !p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
        <div className="font-bold capitalize text-fg">{value}</div>
      </div>
    </div>
  );
}

// QuickAction — large clickable tile linking to a feature page
function QuickAction({ to, icon: Icon, label, tag }: { to: string; icon: any; label: string; tag: string }) {
  return (
    <Link to={to} className="card card-hover group flex flex-col items-start gap-2 !p-4">
      <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-200 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-accent/70 mb-0.5">{tag}</div>
        <div className="font-bold text-sm text-fg">{label}</div>
      </div>
    </Link>
  );
}

// PlanCard — reusable card that handles loading/error/empty/content states
function PlanCard({
  title, link, isLoading, error, onRetry, empty, emptyMsg, emptyCta, children,
}: {
  title: string; link: string; isLoading: boolean; error: unknown;
  onRetry: () => void; empty: boolean; emptyMsg: string; emptyCta: string;
  children?: ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-fg">{title}</h2>
        <Link to={link} className="text-accent text-xs font-semibold flex items-center gap-1 hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-panel2 rounded w-1/2" />
          <div className="h-3 bg-panel2 rounded w-1/3" />
          <div className="h-3 bg-panel2 rounded w-2/3" />
        </div>
      ) : error ? (
        <ErrorState
          message={getApiErrorMessage(error, "Could not load this dashboard section.")}
          onRetry={onRetry}
        />
      ) : empty ? (
        <div>
          <p className="text-muted text-sm mb-3">{emptyMsg}</p>
          <Link to={emptyCta} className="btn-primary !py-2 !text-xs">
            <Zap className="h-3.5 w-3.5" /> Generate now
          </Link>
        </div>
      ) : children}
    </div>
  );
}

// FeatureStrip — horizontal card linking to a secondary AI feature
function FeatureStrip({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="card card-hover flex items-center gap-4 !p-4 group">
      <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-sm text-fg">{title}</div>
        <div className="text-xs text-muted truncate">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition ml-auto shrink-0" />
    </Link>
  );
}
