import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { resetPassword } from "../apis/authApi";
import { getApiErrorMessage } from "../../../lib/errors";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is missing a token.">
        <Link to="/forgot-password" className="btn-primary w-full block text-center">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Reset failed. The link may have expired."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell title="Password updated!" subtitle="You can now sign in with your new password.">
        <div className="space-y-4">
          <p className="text-sm text-muted">Redirecting to login in a moment…</p>
          <Link to="/login" className="btn-primary w-full block text-center">
            Go to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoFocus
          />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
        <p className="text-center text-sm text-muted">
          <Link to="/login" className="text-accent">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
