interface SkeletonCardProps {
  rows?: number;
  height?: string;
}

export default function SkeletonCard({ rows = 3, height }: SkeletonCardProps) {
  if (height) {
    return <div className={`card animate-pulse ${height}`} />;
  }
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-5 bg-panel2 rounded-lg w-2/5" />
      <div className="h-3 bg-panel2 rounded w-1/3" />
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div key={i} className="h-3 bg-panel2 rounded" style={{ width: `${60 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-panel2 border border-border p-3 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-panel shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-panel rounded w-3/5" />
            <div className="h-2.5 bg-panel rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ cols = 2, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-${cols} gap-4 animate-pulse`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-panel2 border border-border h-40" />
      ))}
    </div>
  );
}
