// ─────────────────────────────────────────────────────────────
// Login Page
//
// Renders the sign-in form inside the shared AuthShell wrapper.
// Uses React Hook Form + Zod (loginSchema) for validation so
// inline field errors appear before the form is submitted.
//
// On success: navigates to /dashboard.
// On error:   displays the server message (e.g. "Invalid email
//             or password") via getApiErrorMessage.
// ─────────────────────────────────────────────────────────────

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../components/AuthProvider";
import { loginSchema } from "../schemas/authSchemas";
import { getApiErrorMessage } from "../../../lib/errors";

type Form = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // ── Form setup ────────────────────────────────────────────
  // zodResolver bridges React Hook Form with Zod schema validation.
  // Errors for each field are surfaced via formState.errors.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(loginSchema),
  });

  // ── onSubmit ──────────────────────────────────────────────
  // Calls AuthProvider.login which POSTs to /api/auth/login and
  // sets the auth cookie + context user on success.
  const onSubmit = async (data: Form) => {
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to continue your journey.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        {/* ── Navigation links ── */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted">
            New here?{" "}
            <Link to="/register" className="text-accent">
              Create an account
            </Link>
          </p>
          <Link to="/forgot-password" className="text-accent">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
