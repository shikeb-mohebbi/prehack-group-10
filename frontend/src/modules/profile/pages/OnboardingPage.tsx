// ─────────────────────────────────────────────────────────────
// Onboarding Page
//
// Shown once to new users immediately after registration.
// Collects the fitness profile data needed to personalise AI
// responses throughout the app: age, weight, height, goal, and
// experience level.
//
// On submit:
//   1. Calls updateProfile API (PUT /api/profile).
//   2. Calls auth refresh so user.onboarded becomes true in context.
//   3. Navigates to /dashboard.
//
// ProtectedRoute redirects any signed-in user without onboarded=true
// to this page automatically, so users can't skip it.
// ─────────────────────────────────────────────────────────────

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Flame, Target, Dumbbell, User, Ruler, Weight } from "lucide-react";
import { useAuth } from "../../auth/components/AuthProvider";
import { updateProfile } from "../apis/profileApi";
import { profileSchema } from "../schemas/profileSchemas";
import type { ProfileForm } from "../types/profileTypes";
import { getApiErrorMessage } from "../../../lib/errors";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refresh, user } = useAuth();
  const [error, setError] = useState("");

  // ── Form setup ────────────────────────────────────────────
  // Pre-fills from existing user data in case they partially
  // completed onboarding in a previous session.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age:        user?.age        || undefined,
      weight:     user?.weight     || undefined,
      height:     user?.height     || undefined,
      goal:       user?.goal       || "LOSE_WEIGHT",
      experience: user?.experience || "BEGINNER",
    },
  });

  // ── onSubmit ──────────────────────────────────────────────
  // Saves the profile (sets onboarded=true server-side), then
  // refreshes the auth context so the user object reflects the
  // new onboarded state before navigating away.
  const onSubmit = async (data: ProfileForm) => {
    setError("");
    try {
      await updateProfile(data);
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save"));
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow-xs">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-fg">FitAI Coach</span>
        </Link>

        {/* ── Progress hint ── */}
        <div className="text-center mb-8">
          <p className="section-label mb-2">Step 1 of 1</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-fg">Personalize your plan</h1>
          <p className="text-muted text-sm mt-2 max-w-md mx-auto">
            Tell us about yourself so we can build your perfect workout and nutrition plan.
          </p>
        </div>

        <div className="card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-5">

            {/* ── Age ── */}
            <div>
              <label className="label flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-accent" /> Age
              </label>
              <input className="input" type="number" placeholder="e.g. 22" {...register("age")} />
              {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
            </div>

            {/* ── Weight ── */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5 text-accent" /> Weight (kg)
              </label>
              <input className="input" step="0.1" type="number" placeholder="e.g. 70" {...register("weight")} />
              {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>}
            </div>

            {/* ── Height ── */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-accent" /> Height (cm)
              </label>
              <input className="input" step="0.1" type="number" placeholder="e.g. 175" {...register("height")} />
              {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height.message}</p>}
            </div>

            {/* ── Fitness goal ── */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-accent" /> Fitness goal
              </label>
              <select className="input" {...register("goal")}>
                <option value="LOSE_WEIGHT">Lose Weight</option>
                <option value="GAIN_MUSCLE">Gain Muscle</option>
                <option value="MAINTAIN">Maintain</option>
              </select>
            </div>

            {/* ── Experience level ── */}
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-accent" /> Experience level
              </label>
              <select className="input" {...register("experience")}>
                <option value="BEGINNER">Beginner — just getting started</option>
                <option value="INTERMEDIATE">Intermediate — 1–2 years training</option>
                <option value="ADVANCED">Advanced — 3+ years training</option>
              </select>
            </div>

            {/* ── Error ── */}
            {error && <p className="sm:col-span-2 text-red-400 text-sm">{error}</p>}

            {/* ── Submit ── */}
            <button className="btn-primary sm:col-span-2 !py-3 !text-base mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save & go to dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
