export default function JobCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col justify-between rounded-card border border-border-default bg-surface-card p-5">
      <div>
        {/* Top: Title + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-5 w-3/5 rounded-control bg-surface-muted" />
          <div className="h-4 w-4 shrink-0 rounded-control bg-surface-subtle" />
        </div>

        {/* Company · Category · Posted Time */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3.5 w-24 rounded-control bg-surface-subtle" />
          <div className="h-1 w-1 rounded-full bg-border-strong" />
          <div className="h-3.5 w-16 rounded-control bg-surface-subtle" />
          <div className="h-1 w-1 rounded-full bg-border-strong" />
          <div className="h-3.5 w-12 rounded-control bg-surface-subtle" />
        </div>

        {/* Editorial Specs: Work Mode · Experience · Job Type */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-3.5 w-14 rounded-control bg-surface-subtle" />
          <div className="h-1 w-1 rounded-full bg-border-strong" />
          <div className="h-3.5 w-20 rounded-control bg-surface-subtle" />
          <div className="h-1 w-1 rounded-full bg-border-strong" />
          <div className="h-3.5 w-16 rounded-control bg-surface-subtle" />
        </div>
      </div>

      {/* Bottom Row: Salary on left, Location on right */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-1">
        <div className="h-4 w-28 rounded-control bg-surface-muted" />
        <div className="h-3.5 w-24 rounded-control bg-surface-subtle" />
      </div>
    </div>
  );
}