import type { ReactNode } from "react";

interface PageHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHeader({ tag, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap mb-2">
      <div>
        {tag && <p className="section-label mb-1">{tag}</p>}
        <h1 className="text-3xl font-extrabold text-fg">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </header>
  );
}
