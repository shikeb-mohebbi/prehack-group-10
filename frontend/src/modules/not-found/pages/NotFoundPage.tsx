import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center text-center p-6">
      <div className="animate-fade-in">
        <div className="h-14 w-14 rounded-2xl bg-grad-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Flame className="h-7 w-7 text-white" />
        </div>
        <div className="text-8xl font-black text-gradient-red mb-3">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">This route doesn't exist. Let's get you back on track.</p>
        <Link to="/" className="btn-primary !px-6 !py-3">
          Back to home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
