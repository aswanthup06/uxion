export default function JobCardSkeleton() {
  return (
    <div className="relative overflow-hidden py-6 border-b border-white/10 animate-pulse">
      {/* Top flex: title + id/date */}
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          {/* Job title */}
          <div className="h-5 w-32 bg-gray-600 rounded"></div>
          {/* Company */}
          <div className="h-4 w-24 bg-[#F97316]/50 rounded"></div>
        </div>

        {/* ID and postedAt */}
        <div className="flex flex-col items-end gap-2">
          <div className="h-3 w-12 bg-gray-700 rounded"></div>
          <div className="h-3 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Bottom flex: location & experience */}
      <div className="flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          <div className="h-3 w-20 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>


    </div>
  );
}
