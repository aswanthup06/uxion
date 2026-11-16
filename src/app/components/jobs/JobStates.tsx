import { SearchX, WifiOff } from "lucide-react";
import { Button } from "@/app/components/Button";

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
        <Button
          variant="secondary"
          size="md"
          onClick={onClear}
          className="mt-5"
        >
          Clear all filters
        </Button>
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
      <Button
        variant="primary"
        size="md"
        onClick={onRetry}
        className="mt-5"
      >
        Try again
      </Button>
    </div>
  );
}
