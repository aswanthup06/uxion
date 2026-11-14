export default function JobsLoading() {
  return (
    <div className="min-h-full bg-surface-page text-text-primary lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Sidebar Skeleton (Desktop) */}
      <aside className="hidden flex-col gap-7 border-border-default bg-surface-card p-5 lg:flex lg:h-full lg:min-h-0 lg:self-stretch lg:border-r lg:p-6 lg:pb-8 animate-pulse">
        {/* Navigation items */}
        <div className="space-y-2">
          <div className="h-9 w-full rounded-control bg-surface-subtle" />
          <div className="h-9 w-full rounded-control bg-surface-subtle/60" />
        </div>

        {/* Filters */}
        <div className="space-y-6 border-t border-border-subtle pt-6">
          {/* Job Type */}
          <div>
            <div className="h-3 w-16 rounded-control bg-surface-muted mb-3" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 rounded-pill bg-surface-subtle" />
              <div className="h-7 w-20 rounded-pill bg-surface-subtle" />
              <div className="h-7 w-20 rounded-pill bg-surface-subtle" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="h-3 w-20 rounded-control bg-surface-muted mb-3" />
            <div className="space-y-2">
              <div className="h-5 w-full rounded-control bg-surface-subtle" />
              <div className="h-5 w-4/5 rounded-control bg-surface-subtle" />
              <div className="h-5 w-3/4 rounded-control bg-surface-subtle" />
              <div className="h-5 w-5/6 rounded-control bg-surface-subtle" />
            </div>
          </div>

          {/* Experience Select */}
          <div>
            <div className="h-3 w-20 rounded-control bg-surface-muted mb-2" />
            <div className="h-10 w-full rounded-control bg-surface-subtle" />
          </div>

          {/* Salary Select */}
          <div>
            <div className="h-3 w-28 rounded-control bg-surface-muted mb-2" />
            <div className="h-10 w-full rounded-control bg-surface-subtle" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="min-w-0 bg-surface-base px-5 py-5 sm:px-8 lg:h-full lg:overflow-y-auto lg:px-10 lg:py-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-7 w-52 rounded-control bg-surface-muted animate-pulse" />
            <div className="mt-2 h-4 w-72 rounded-control bg-surface-subtle animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-32 rounded-control bg-surface-card border border-border-default animate-pulse" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mt-4 grid grid-cols-1 rounded-control border border-border-default bg-surface-card sm:grid-cols-2 animate-pulse">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="h-4 w-4 rounded-full bg-surface-muted shrink-0" />
            <div className="h-4 w-48 rounded-control bg-surface-subtle" />
          </div>
          <div className="flex items-center gap-3 border-t border-border-default px-4 py-3.5 sm:border-l sm:border-t-0">
            <div className="h-4 w-4 rounded-full bg-surface-muted shrink-0" />
            <div className="h-4 w-36 rounded-control bg-surface-subtle" />
          </div>
        </div>

        {/* Quick Location Pills Skeleton */}
        <div className="mt-3 hidden sm:flex items-center gap-1.5 overflow-hidden animate-pulse">
          <div className="h-4 w-24 rounded-control bg-surface-muted shrink-0 mr-1" />
          <div className="h-6 w-20 rounded-control bg-surface-card border border-border-default shrink-0" />
          <div className="h-6 w-24 rounded-control bg-surface-card border border-border-default shrink-0" />
          <div className="h-6 w-16 rounded-control bg-surface-card border border-border-default shrink-0" />
          <div className="h-6 w-20 rounded-control bg-surface-card border border-border-default shrink-0" />
          <div className="h-6 w-20 rounded-control bg-surface-card border border-border-default shrink-0" />
        </div>

        {/* Job Cards Grid Skeleton */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col justify-between rounded-card border border-border-default bg-surface-card p-5"
            >
              <div>
                {/* Title + Bookmark */}
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

                {/* Specs */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-3.5 w-14 rounded-control bg-surface-subtle" />
                  <div className="h-1 w-1 rounded-full bg-border-strong" />
                  <div className="h-3.5 w-20 rounded-control bg-surface-subtle" />
                  <div className="h-1 w-1 rounded-full bg-border-strong" />
                  <div className="h-3.5 w-16 rounded-control bg-surface-subtle" />
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-5 flex items-center justify-between gap-3 pt-1">
                <div className="h-4 w-28 rounded-control bg-surface-muted" />
                <div className="h-3.5 w-24 rounded-control bg-surface-subtle" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

