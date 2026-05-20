// ─────────────────────────────────────────────────────────────
// Layout — main app shell
//
// Renders the chrome that surrounds every authenticated page:
//   • Desktop sidebar (hidden on mobile) with logo, nav links,
//     MusicBar, user info, and logout button
//   • Mobile top bar with logo and hamburger button
//   • Mobile slide-in drawer (right side) with full nav
//   • Main content area where child pages are rendered
//   • Mobile bottom tab bar with the 5 most-used links
//   • Floating "AI Powered" badge (desktop only)
//
// The `links` array defines every navigation item.
// `bottomLinks` takes the first 5 for the mobile tab bar.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/components/AuthProvider";
import MusicBar from "../modules/music/components/MusicBar";
import ThemeToggle from "./ThemeToggle";
import {
  Camera,
  Dumbbell,
  Flame,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Menu,
  MessageSquare,
  Pill,
  Salad,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";

// ── Navigation links ──────────────────────────────────────────
// Ordered list of all pages accessible from the sidebar/drawer.
const links = [
  { to: "/dashboard",    label: "Dashboard",  icon: LayoutDashboard },
  { to: "/workouts",     label: "Workouts",   icon: Dumbbell },
  { to: "/meals",        label: "Meals",      icon: Salad },
  { to: "/calorie-check",label: "Calories",   icon: Camera },
  { to: "/supplements",  label: "Supps",      icon: Pill },
  { to: "/chat",         label: "AI Coach",   icon: MessageSquare },
  { to: "/music",        label: "Music",      icon: ListMusic },
  { to: "/profile",      label: "Profile",    icon: UserIcon },
];

// The mobile bottom tab bar only shows the first 5 links to fit the screen.
const bottomLinks = links.slice(0, 5);

// ── Layout ────────────────────────────────────────────────────
export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logs out the user and navigates to the login page.
  const handleLogout = async () => {
    await logout();
    nav("/login");
  };

  // Returns the Tailwind class string for a nav link based on its active state.
  const navItem = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-grad-primary text-white shadow-glow-sm"
        : "text-white/65 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-full flex flex-col md:flex-row">

      {/* ── Desktop sidebar ── */}
      {/* Sticky full-height sidebar, visible on md+ screens only */}
      <aside className="hidden md:flex w-64 flex-col sidebar-glass border-r border-white/[0.08] p-5 sticky top-0 h-screen">
        <Link to="/dashboard" className="flex items-center gap-2.5 mb-8 group">
          <div className="h-9 w-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow-xs group-hover:shadow-glow transition">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-[15px] leading-none text-white">FitAI Coach</div>
            <div className="text-[10px] text-accent font-semibold tracking-widest uppercase mt-0.5">Powered by AI</div>
          </div>
        </Link>

        <div className="section-label mb-2 px-3">Navigation</div>
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => navItem(isActive)}>
              <l.icon className="h-4 w-4 shrink-0" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer: music player, user info, logout */}
        <div className="mt-4 space-y-3 border-t border-white/[0.08] pt-4">
          <MusicBar compact />
          <div className="rounded-xl bg-white/5 border border-white/[0.08] p-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-grad-primary flex items-center justify-center shrink-0 shadow-glow-xs">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-white">{user?.name}</div>
                <div className="text-[11px] text-white/50 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="btn-ghost flex-1 text-sm !py-2 !bg-white/[0.08] !text-white !border-white/10 hover:!border-accent/40 hover:!bg-white/[0.12]">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
            <ThemeToggle className="!bg-white/[0.08] !text-white !border-white/10 hover:!border-accent/40" />
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      {/* Sticky header shown on small screens with logo and hamburger */}
      <header className="md:hidden flex items-center justify-between border-b border-white/[0.08] bg-[rgba(7,7,11,0.92)] backdrop-blur px-4 py-3 sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-grad-primary flex items-center justify-center shadow-glow-xs">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-[15px] text-white">FitAI</span>
          <span className="text-accent font-extrabold text-[15px]">Coach</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="!bg-white/[0.08] !text-white !border-white/10 hover:!border-accent/40" />
          <button
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-white" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {/* Full-screen overlay with a right-side slide-in panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 animate-fade-in">
          {/* Dark backdrop — tap to close */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 sidebar-glass border-l border-white/[0.08] p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-grad-primary flex items-center justify-center">
                  <Flame className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-extrabold text-white">FitAI Coach</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => navItem(isActive)}
                >
                  <l.icon className="h-4 w-4 shrink-0" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto pt-4 space-y-3 border-t border-white/[0.08]">
              <MusicBar compact />
              <div className="rounded-xl bg-white/5 border border-white/[0.08] p-3">
                <div className="text-xs text-white/50">Signed in as</div>
                <div className="text-sm font-semibold truncate text-white">{user?.name}</div>
              </div>
              <button onClick={handleLogout} className="btn-ghost w-full !bg-white/[0.08] !text-white !border-white/10 hover:!bg-white/[0.12]">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      {/* Page content area — children are the feature page components */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-28 md:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      {/* Fixed tab bar at the bottom of the screen on small devices */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 sidebar-glass border-t border-white/[0.08] z-20 safe-area-pb">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {bottomLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition active:scale-95 min-h-[56px] ${
                  isActive ? "text-accent" : "text-white/60"
                }`
              }
            >
              <l.icon className="h-5 w-5" />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── "AI Powered" floating badge ── */}
      {/* Desktop-only decorative badge in the bottom-right corner */}
      <div className="hidden md:flex fixed bottom-6 right-6 items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-3 py-1.5 text-[11px] font-semibold text-accent shadow-glow-xs animate-glow-pulse pointer-events-none">
        <Zap className="h-3 w-3" />
        AI Powered
      </div>
    </div>
  );
}
