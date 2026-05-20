import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { forgotPassword } from "../apis/authApi";
import { getApiErrorMessage } from "../../../lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Enter your email address.");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Something went wrong. Try again."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`We sent a password reset link to ${email}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            The link expires in 1 hour. If you do not see it, check your spam folder.
          </p>
          <Link to="/login" className="btn-primary w-full block text-center">
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="text-center text-sm text-muted">
          Remember it?{" "}
          <Link to="/login" className="text-accent">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
