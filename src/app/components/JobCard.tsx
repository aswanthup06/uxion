"use client";

import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Job } from "../types/job";

interface JobCardProps {
  job: Job;
}

// ✅ Helper: format "time ago"
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  const shortLabels: { [key: string]: string } = {
    year: "y",
    month: "mo",
    week: "w",
    day: "d",
    hour: "h",
    minute: "m",
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);

    if (count >= 1) {
      return `${count}${shortLabels[unit]} ago`;
    }
  }

  return "Just now";
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="relative overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md duration-700 transition-all bg-white  flex flex-col justify-between"
    >
      <div className="flex justify-between pt-4 px-4">
        <div className="">
          <h2 className="text-base font-semibold">{job.title}</h2>

          <h3 className="text-xs font-medium text-green-700 md:text-sm">
            {job.company}
          </h3>
        </div>

        <div className="flex flex-col items-end text-xs">
          <span className="font-normal">{timeAgo(job.postedDate)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 pt-2 text-xs">
        {/* <MapPin size={14} strokeWidth={1} /> */}
        {job.location}
      </div>

      <div className="grid grid-cols-3 text-xs border-t border-gray-200">
        <div className="flex justify-center items-center gap-2 pl-4 py-4 border-r border-gray-200 min-w-0">
          {/* <Briefcase size={16} strokeWidth={1} className="shrink-0" /> */}
          <span className="truncate">{job.experience}</span>
        </div>

        <div className="flex justify-center items-center gap-2  py-4 min-w-0 border-r border-gray-200">
          <span className="truncate">Full-Time</span>
        </div>

        <div className="flex justify-center items-center gap-2  py-4 min-w-0">
          <span className="truncate">Onsite</span>
        </div>
      </div>
    </Link>
  );
}
