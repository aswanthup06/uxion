import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import type { Job } from "@/app/types/job";
import { isRecent, timeAgo } from "./jobs-utils";

export function JobGridCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex min-h-[10.5rem] flex-col justify-between rounded-2xl border border-[#E8ECE8] bg-white p-5 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0FA968]/40 hover:shadow-[0_12px_28px_-16px_rgba(15,169,104,0.45)] focus-visible:ring-2 focus-visible:ring-[#0FA968]/50"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-[#7A867F]">
          <span>{timeAgo(job.postedDate)}</span>
          {isRecent(job.postedDate) && (
            <span className="flex items-center gap-1.5 font-medium text-[#0B7A4B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0FA968]" aria-hidden />
              New
            </span>
          )}
        </div>
        <h2 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-[#111815] transition-colors group-hover:text-[#0B7A4B]">
          {job.title}
        </h2>
        <p className="mt-1 truncate text-sm text-[#66726B]">{job.company}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F3F5F3] px-3 py-1 text-xs font-medium text-[#3A4640]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7A867F]" aria-hidden />
          <span className="truncate">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F5F3] px-3 py-1 text-xs font-medium text-[#3A4640]">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#7A867F]" aria-hidden />
          {job.experience}
        </span>
      </div>
    </Link>
  );
}

export function JobGridSkeleton() {
  return (
    <div className="flex min-h-[10.5rem] animate-pulse flex-col justify-between rounded-2xl border border-[#E8ECE8] bg-white p-5">
      <div>
        <div className="h-3 w-16 rounded bg-[#EEF1EE]" />
        <div className="mt-4 h-5 w-3/4 rounded bg-[#E3E8E4]" />
        <div className="mt-2 h-4 w-1/3 rounded bg-[#EEF1EE]" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-24 rounded-full bg-[#F3F5F3]" />
        <div className="h-6 w-20 rounded-full bg-[#F3F5F3]" />
      </div>
    </div>
  );
}
