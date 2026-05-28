export default function JobCardSkeleton() {
  return (
    <div className="border border-gray-100 bg-white p-4 h-36 rounded-md animate-pulse flex flex-col justify-between">
      
      {/* Top */}
      <div className="flex justify-between">
        <div>
          {/* Title */}
          <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>

          {/* Company */}
          <div className="h-4 w-24 bg-gray-100 rounded"></div>
        </div>

        {/* Time */}
        <div className="h-3 w-14 bg-gray-100 rounded mt-1"></div>
      </div>

      {/* Bottom */}
      <div className="flex gap-6 text-xs">
        {/* Experience */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-100 rounded"></div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}