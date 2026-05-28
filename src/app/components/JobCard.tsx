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
      href={`/home/jobs/${job.id}`}
      className="relative overflow-hidden border border-gray-100 bg-white p-4 h-36 flex flex-col justify-between rounded-md"
    >
      <div className="flex justify-between">
        <div className="mb-4">
          <h2 className="text-base font-semibold">
            {job.title}
          </h2>

          <h3 className="text-xs font-light text-gray-600 md:text-sm">
            {job.company}
          </h3>
        </div>

        <div className="flex flex-col items-end text-xs">
          <span className="font-light">
            {timeAgo(job.postedDate)}
          </span>
        </div>
      </div>

      <div className="flex gap-6 text-xs">
        <div className="flex items-center gap-2 w-[80px]">
          <Briefcase size={16} strokeWidth={1} />
          {job.experience}
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={14} strokeWidth={1} />
          {job.location}
        </div>
      </div>
    </Link>
  );
}