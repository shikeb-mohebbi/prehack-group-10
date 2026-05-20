// ─────────────────────────────────────────────────────────────
// ProtectedRoute — authentication & onboarding guard
//
// Wraps any route that requires a signed-in user.
// Three possible outcomes:
//
//   1. Still loading — show a loading placeholder while the
//      initial /api/auth/me request is in flight.
//
//   2. Not signed in — redirect to /login, passing the attempted
//      URL in location state so the login page can redirect back
//      after a successful login.
//
//   3. Signed in but not onboarded — redirect to /onboarding so
//      new users fill in their profile before accessing any feature.
//      The /onboarding path itself is excluded from this redirect
//      to avoid an infinite loop.
//
//   4. Signed in and onboarded — render children normally.
// ─────────────────────────────────────────────────────────────

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still waiting for the session check to complete.
  if (loading) {
    return <div className="p-10 text-muted">Loading...</div>;
  }

  // No session — send to login, remembering where the user was going.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account exists but profile not yet filled in.
  if (!user.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
