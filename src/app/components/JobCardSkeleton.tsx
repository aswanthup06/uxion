export default function JobCardSkeleton() {
  return (
    <div className="border border-border-subtle bg-surface-card p-4 h-36 rounded-card animate-pulse flex flex-col justify-between">
      
      {/* Top */}
      <div className="flex justify-between">
        <div>
          {/* Title */}
          <div className="h-5 w-40 bg-surface-muted rounded-control mb-3"></div>

          {/* Company */}
          <div className="h-4 w-24 bg-surface-subtle rounded-control"></div>
        </div>

        {/* Time */}
        <div className="h-3 w-14 bg-surface-subtle rounded-control mt-1"></div>
      </div>

      {/* Bottom */}
      <div className="flex gap-6 text-xs">
        {/* Experience */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-surface-muted rounded-pill"></div>
          <div className="h-3 w-16 bg-surface-subtle rounded-control"></div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-surface-muted rounded-pill"></div>
          <div className="h-3 w-20 bg-surface-subtle rounded-control"></div>
        </div>
      </div>
    </div>
  );
}