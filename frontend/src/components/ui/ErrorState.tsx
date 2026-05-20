import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <p className="text-sm font-medium text-fg mb-1">Error</p>
      <p className="text-sm text-muted max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost !py-2 !text-sm mt-4">
          <RefreshCcw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
