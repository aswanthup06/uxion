import { SearchX, WifiOff } from "lucide-react";

export function EmptyState({ onClear, canClear }: { onClear: () => void; canClear: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
        <SearchX className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">No jobs match these filters</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Try a broader title, remove a location, or widen the experience range.
      </p>
      {canClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
        <WifiOff className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">Jobs didn’t load</p>
      <p className="mt-1 text-sm text-slate-500">Check your connection, then try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-[#0FA968] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C8F58]"
      >
        Try again
      </button>
    </div>
  );
}
