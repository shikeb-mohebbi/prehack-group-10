// ─────────────────────────────────────────────────────────────
// Register Page
//
// Renders the account creation form inside the shared AuthShell.
// Uses React Hook Form + Zod (registerSchema) for validation.
//
// On success: navigates to /onboarding so the new user fills in
//             their fitness profile before accessing features.
// On error:   displays the server message (e.g. "Email already
//             registered") via getApiErrorMessage.
// ─────────────────────────────────────────────────────────────

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../components/AuthProvider";
import { registerSchema } from "../schemas/authSchemas";
import { getApiErrorMessage } from "../../../lib/errors";

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // useAuth().register is aliased to "signup" to avoid naming
  // conflict with React Hook Form's own "register" function.
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // ── Form setup ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(registerSchema),
  });

  // ── onSubmit ──────────────────────────────────────────────
  // Calls AuthProvider.register which POSTs to /api/auth/register.
  // New users are sent to /onboarding to complete their profile.
  const onSubmit = async (data: Form) => {
    setError("");
    try {
      await signup(data.name, data.email, data.password);
      navigate("/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Takes less than a minute.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Name field ── */}
        <div>
          <label className="label">Name</label>
          <input className="input" {...register("name")} placeholder="Alex" />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* ── Email field ── */}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* ── Password field ── */}
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            {...register("password")}
            placeholder="Password"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ── Server error ── */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* ── Submit ── */}
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        {/* ── Sign-in link ── */}
        <p className="text-center text-sm text-muted">
          Already have one?{" "}
          <Link to="/login" className="text-accent">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
