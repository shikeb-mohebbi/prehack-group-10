import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Camera,
  Dumbbell,
  Flame,
  Music,
  Pill,
  Salad,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    tag: "Workout Engine",
    title: "AI-Built Weekly Splits",
    body: "Tell us your goal, level and equipment. Get a personalized weekly program in seconds.",
    color: "from-red-600/20 to-rose-900/10",
  },
  {
    icon: Salad,
    tag: "Nutrition Intelligence",
    title: "Smart Meal Planning",
    body: "Hit your calorie target with balanced, AI-generated meals tailored to your preferences.",
    color: "from-orange-600/20 to-red-900/10",
  },
  {
    icon: Bot,
    tag: "AI Coach",
    title: "Chat With Your Coach",
    body: "Ask anything — form tips, recovery, supplements, motivation. Available 24/7.",
    color: "from-rose-600/20 to-red-900/10",
  },
  {
    icon: Camera,
    tag: "Smart Calories",
    title: "Photo Calorie Check",
    body: "Snap a photo of your meal. Our AI estimates calories and macros instantly.",
    color: "from-red-700/20 to-rose-900/10",
  },
  {
    icon: Pill,
    tag: "Supplement Hub",
    title: "AI Supplement Guide",
    body: "Personalized supplement recommendations based on your goals and training level.",
    color: "from-red-500/20 to-rose-800/10",
  },
  {
    icon: Music,
    tag: "Focus Mode",
    title: "Workout Music Player",
    body: "Built-in playlist with high-energy tracks to keep you locked in during training.",
    color: "from-rose-700/20 to-red-900/10",
  },
];

const stats = [
  { value: "3.1", unit: "Llama", label: "AI Model" },
  { value: "8",   unit: "+",    label: "AI features" },
  { value: "100", unit: "%",    label: "Personalized" },
  { value: "24",  unit: "/7",   label: "Always on" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(7,7,11,0.88)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow-xs">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[15px] text-white">FitAI </span>
              <span className="font-extrabold text-[15px] text-accent">Coach</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-white/70 hover:text-white transition">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-5 !rounded-xl">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-accent/[0.08] blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 mb-8">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent tracking-wide">Powered by Llama 3.1 via Groq AI</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Train Smarter.{" "}
            <br />
            <span className="text-gradient-red">Eat Better.</span>
            <br />
            Stay Consistent.
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            FitAI Coach generates personalized workout plans, meal plans, and supplement
            recommendations — then coaches you through every step with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary !px-8 !py-3.5 !text-base !rounded-2xl w-full sm:w-auto">
              Start coaching free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-semibold border-2 border-accent/60 text-accent hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 w-full sm:w-auto">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-white/[0.08] bg-white/[0.03]">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-white">
                {s.value}<span className="text-accent">{s.unit}</span>
              </div>
              <div className="text-xs text-white/50 font-medium uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            One app. <span className="text-gradient-red">Every edge.</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            From workouts to nutrition to music — your complete AI fitness platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${f.color} p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center group-hover:bg-accent/25 transition">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent/80">{f.tag}</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-grad-primary overflow-hidden shadow-glow p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <Flame className="h-12 w-12 mx-auto mb-4 opacity-90 animate-float" />
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Ready to train smarter?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join FitAI Coach and get your first personalized workout plan in under 30 seconds.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-accent font-extrabold px-8 py-3.5 rounded-2xl hover:bg-white/90 transition text-[15px]">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-white/30 text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-lg bg-grad-primary flex items-center justify-center">
            <Flame className="h-3 w-3 text-white" />
          </div>
          <span className="font-bold text-white/50">FitAI Coach</span>
        </div>
        Built for the CSC105 Hackathon · React · Express · Prisma · SQLite · Groq
      </footer>
    </div>
  );
}
