// ─────────────────────────────────────────────────────────────
// AuthProvider — global authentication context
//
// Wraps the entire app (via main.tsx) and manages:
//   user    — the signed-in User object, or null if logged out
//   loading — true while the initial session check is in flight
//
// Exported helpers (all update the user state automatically):
//   login    — POST /api/auth/login
//   register — POST /api/auth/register
//   logout   — POST /api/auth/logout + clear user
//   refresh  — re-fetch the current user from /api/auth/me
//              (called after profile updates to sync the context)
//
// The useAuth() hook is the standard way for any component to
// access the current user or call auth actions.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../apis/authApi";
import type { User } from "../types/authTypes";

// ── AuthCtx — context shape ───────────────────────────────────
// The value that every consumer of useAuth() receives.
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

// ── AuthProvider ──────────────────────────────────────────────
// On mount, calls /api/auth/me to restore the session from the
// httpOnly cookie. If the cookie is missing or expired, user
// stays null and loading becomes false.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── refresh ───────────────────────────────────────────────
  // Re-fetches the current user. Called on mount (session restore)
  // and after profile saves so that user.onboarded etc. stay fresh.
  const refresh = async () => {
    try {
      setUser(await getCurrentUser());
    } catch {
      setUser(null);
    }
  };

  // Restore session on first render.
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // ── login ─────────────────────────────────────────────────
  // Calls the login API and stores the returned user object.
  const login = async (email: string, password: string) => {
    setUser(await loginUser(email, password));
  };

  // ── register ──────────────────────────────────────────────
  // Creates a new account and stores the returned user object.
  const register = async (name: string, email: string, password: string) => {
    setUser(await registerUser(name, email, password));
  };

  // ── logout ────────────────────────────────────────────────
  // Calls the logout API (which clears the cookie server-side)
  // then nulls out the local user state.
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

// ── useAuth ───────────────────────────────────────────────────
// Hook that any component can call to get the auth context.
// Throws a clear error if used outside <AuthProvider>.
export function useAuth() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
