import { Bot, Loader2, Zap } from "lucide-react";

interface AiGeneratingStateProps {
  label?: string;
}

export default function AiGeneratingState({ label = "Generating your plan…" }: AiGeneratingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="relative mb-5">
        <div className="h-16 w-16 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center animate-pulse-glow">
          <Bot className="h-8 w-8 text-accent" />
        </div>
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-grad-primary flex items-center justify-center shadow-glow-xs">
          <Loader2 className="h-3 w-3 text-white animate-spin" />
        </div>
      </div>
      <p className="font-bold text-fg mb-1">{label}</p>
      <p className="text-sm text-muted">Powered by Llama 3.1 · usually takes 5–15 seconds</p>
      <div className="flex items-center gap-1.5 mt-4">
        <Zap className="h-3.5 w-3.5 text-accent animate-glow-pulse" />
        <span className="text-xs text-accent font-semibold">AI Processing</span>
      </div>
    </div>
  );
}
