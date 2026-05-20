import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  onCtaClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 animate-pop-in">
          <Icon className="h-7 w-7 text-accent/60" />
        </div>
      )}
      <h3 className="font-bold text-fg mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
      {(ctaLabel && ctaTo) && (
        <Link to={ctaTo} className="btn-primary !py-2 !text-sm mt-5">
          <Zap className="h-3.5 w-3.5" /> {ctaLabel}
        </Link>
      )}
      {(ctaLabel && onCtaClick) && (
        <button onClick={onCtaClick} className="btn-primary !py-2 !text-sm mt-5">
          <Zap className="h-3.5 w-3.5" /> {ctaLabel}
        </button>
      )}
    </div>
  );
}
