export default function JobDetailsLoading() {
  return (
    <main className="min-h-screen bg-surface-base text-text-primary">
      <div className="mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 animate-pulse">
        {/* Header Skeleton */}
        <header className="border-b border-border-subtle pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Title & Company */}
            <div className="min-w-0 flex-1">
              <div className="h-9 w-3/4 max-w-md rounded-control bg-surface-muted sm:h-10" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-4 w-28 rounded-control bg-surface-subtle" />
                <div className="h-1 w-1 rounded-full bg-border-strong" />
                <div className="h-4 w-16 rounded-control bg-surface-subtle" />
                <div className="h-1 w-1 rounded-full bg-border-strong" />
                <div className="h-4 w-20 rounded-control bg-surface-subtle" />
              </div>
            </div>

            {/* Action Buttons Cluster Skeleton */}
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <div className="h-10 w-24 rounded-control border border-border-default bg-surface-card" />
              <div className="h-10 w-36 rounded-control border border-border-default bg-surface-card" />
              <div className="h-10 w-28 rounded-control bg-surface-muted" />
            </div>
          </div>

          {/* Editorial Specs Metadata Row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="h-4 w-24 rounded-control bg-surface-subtle" />
            <div className="h-1 w-1 rounded-full bg-border-strong" />
            <div className="h-4 w-20 rounded-control bg-surface-subtle" />
            <div className="h-1 w-1 rounded-full bg-border-strong" />
            <div className="h-4 w-16 rounded-control bg-surface-subtle" />
            <div className="h-1 w-1 rounded-full bg-border-strong" />
            <div className="h-4 w-32 rounded-control bg-surface-subtle" />
          </div>

          {/* Location / Residency Pill Skeleton */}
          <div className="mt-4 h-7 w-64 rounded-control border border-border-default bg-surface-subtle" />
        </header>

        {/* Content Skeleton: Job Description */}
        <div className="mt-8 space-y-4">
          <div className="h-5 w-40 rounded-control bg-surface-muted mb-6" />
          
          <div className="space-y-2.5">
            <div className="h-4 w-full rounded-control bg-surface-subtle" />
            <div className="h-4 w-11/12 rounded-control bg-surface-subtle" />
            <div className="h-4 w-4/5 rounded-control bg-surface-subtle" />
            <div className="h-4 w-full rounded-control bg-surface-subtle" />
            <div className="h-4 w-3/4 rounded-control bg-surface-subtle" />
          </div>

          <div className="pt-4 space-y-2.5">
            <div className="h-5 w-32 rounded-control bg-surface-muted mb-4" />
            <div className="h-4 w-full rounded-control bg-surface-subtle" />
            <div className="h-4 w-5/6 rounded-control bg-surface-subtle" />
            <div className="h-4 w-4/5 rounded-control bg-surface-subtle" />
          </div>

          <div className="pt-4 space-y-2.5">
            <div className="h-5 w-36 rounded-control bg-surface-muted mb-4" />
            <div className="h-4 w-full rounded-control bg-surface-subtle" />
            <div className="h-4 w-11/12 rounded-control bg-surface-subtle" />
            <div className="h-4 w-2/3 rounded-control bg-surface-subtle" />
          </div>
        </div>
      </div>
    </main>
  );
}

