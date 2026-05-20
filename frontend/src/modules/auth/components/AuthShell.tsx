import { Link } from "react-router-dom";
import { Dumbbell, Flame, Salad, Zap } from "lucide-react";
import type { ReactNode } from "react";

const perks = [
  { icon: Dumbbell, text: "AI Workout Generator" },
  { icon: Salad,    text: "Smart Meal Planning" },
  { icon: Zap,      text: "Real-time AI Coach" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between bg-[#07070b] border-r border-white/[0.08] p-10 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow-xs">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-[16px] text-white">FitAI </span>
            <span className="font-extrabold text-[16px] text-accent">Coach</span>
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="section-label mb-3">AI Fitness Platform</p>
            <h2 className="text-4xl font-black text-white leading-tight">
              Your personal<br />
              <span className="text-gradient-red">AI fitness coach</span><br />
              is ready.
            </h2>
            <p className="text-white/50 mt-4 leading-relaxed">
              Workouts, meals, calorie tracking and a 24/7 AI coach — everything in one place.
            </p>
          </div>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-white/70 text-sm">
                <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                  <p.icon className="h-3.5 w-3.5 text-accent" />
                </div>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/25 text-xs">
          Powered by Llama 3.1 via Groq
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="h-10 w-10 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow-xs">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-fg">FitAI Coach</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-fg">{title}</h1>
            <p className="text-muted text-sm mt-2">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
