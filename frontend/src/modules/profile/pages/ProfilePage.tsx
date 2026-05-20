// ─────────────────────────────────────────────────────────────
// Profile Settings Page
//
// Allows signed-in users to update their fitness profile:
// age, weight (kg), height (cm), fitness goal, and experience
// level. Changes are saved to the backend via PUT /api/profile.
//
// After a successful save:
//   - Calls auth refresh so the context user object is up to date.
//   - Shows a brief success message.
//
// The read-only account card at the top shows name and email,
// which cannot be changed from this page.
// ─────────────────────────────────────────────────────────────

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import BackButton from "../../../components/BackButton";
import { useAuth } from "../../auth/components/AuthProvider";
import { updateProfile } from "../apis/profileApi";
import { profileSchema } from "../schemas/profileSchemas";
import type { ProfileForm } from "../types/profileTypes";
import { CheckCircle, Dumbbell, Mail, Ruler, Target, User, Weight } from "lucide-react";
import { getApiErrorMessage } from "../../../lib/errors";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ── Form setup ────────────────────────────────────────────
  // Pre-fills fields from the currently loaded user object.
  // Falls back to common defaults so inputs are never empty.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age:        user?.age        || 25,
      weight:     user?.weight     || 70,
      height:     user?.height     || 175,
      goal:       user?.goal       || "MAINTAIN",
      experience: user?.experience || "BEGINNER",
    },
  });

  // ── onSubmit ──────────────────────────────────────────────
  // Saves the profile via the API, then refreshes the auth context
  // so other parts of the app (e.g. AI prompts) use the new values.
  const onSubmit = async (data: ProfileForm) => {
    setError("");
    setMessage("");
    try {
      await updateProfile(data);
      await refresh();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Update failed"));
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <BackButton />
      <header>
        <p className="section-label mb-1">Account</p>
        <h1 className="text-3xl font-extrabold text-fg">Profile Settings</h1>
      </header>

      {/* ── Account info card (read-only) ── */}
      <div className="card flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-grad-primary flex items-center justify-center shrink-0 shadow-glow-xs">
          <User className="h-7 w-7 text-white" />
        </div>
        <div>
          <div className="font-extrabold text-lg text-fg">{user?.name}</div>
          <div className="flex items-center gap-1.5 text-muted text-sm">
            <Mail className="h-3.5 w-3.5" />
            {user?.email}
          </div>
        </div>
      </div>

      {/* ── Edit form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="card grid sm:grid-cols-2 gap-5">

        {/* Age */}
        <div>
          <label className="label flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-accent" /> Age</label>
          <input className="input" type="number" {...register("age")} />
          {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
        </div>

        {/* Weight */}
        <div>
          <label className="label flex items-center gap-1.5"><Weight className="h-3.5 w-3.5 text-accent" /> Weight (kg)</label>
          <input className="input" step="0.1" type="number" {...register("weight")} />
          {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>}
        </div>

        {/* Height */}
        <div>
          <label className="label flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-accent" /> Height (cm)</label>
          <input className="input" step="0.1" type="number" {...register("height")} />
          {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height.message}</p>}
        </div>

        {/* Fitness goal */}
        <div>
          <label className="label flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-accent" /> Fitness goal</label>
          <select className="input" {...register("goal")}>
            <option value="LOSE_WEIGHT">Lose Weight</option>
            <option value="GAIN_MUSCLE">Gain Muscle</option>
            <option value="MAINTAIN">Maintain</option>
          </select>
        </div>

        {/* Experience level */}
        <div className="sm:col-span-2">
          <label className="label flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 text-accent" /> Experience level</label>
          <select className="input" {...register("experience")}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* Success / error messages */}
        {message && (
          <p className="sm:col-span-2 text-accent text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {message}
          </p>
        )}
        {error && <p className="sm:col-span-2 text-red-400 text-sm">{error}</p>}

        {/* Submit */}
        <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
