import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/dashboard", label = "Back to Dashboard" }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted px-3 py-2 rounded-lg border border-border bg-panel hover:bg-panel2 hover:text-accent hover:border-accent/40 transition mb-2"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
