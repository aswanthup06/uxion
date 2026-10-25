import { SearchX, WifiOff } from "lucide-react";

export function EmptyState({ onClear, canClear }: { onClear: () => void; canClear: boolean }) {
  return (
    <div className="rounded-panel border border-dashed border-border-default bg-surface-card px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-surface-muted text-text-muted">
        <SearchX className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-base font-semibold text-text-primary">No jobs match these filters</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">
        Try a broader title, remove a location, or widen the experience range.
      </p>
      {canClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors duration-normal focus-visible:ring-2 focus-visible:ring-brand outline-none"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-panel border border-dashed border-status-error-border bg-surface-card px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-status-error-bg text-status-error">
        <WifiOff className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-base font-semibold text-text-primary">Jobs didn’t load</p>
      <p className="mt-1 text-sm text-text-secondary">Check your connection, then try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-brand-hover shadow-subtle transition-colors duration-normal focus-visible:ring-2 focus-visible:ring-brand outline-none"
      >
        Try again
      </button>
    </div>
  );
}
