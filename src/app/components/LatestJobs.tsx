"use client";

import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import JobCardSkeleton from "./JobCardSkeleton";
import Link from "next/link";
import { ArrowUpRight, BellPlus } from "lucide-react";
import { Job } from "../types/job";
import { usePathname } from "next/navigation";

export default function LatestJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/jobs");
        const data = await res.json();

        if (Array.isArray(data)) {
          const latestJobs = (data as Job[]).slice(0, 6); // ✅ take 4 latest
          setJobs(latestJobs);
        } else {
          console.error("Invalid data format from API");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ Conditionally choose grid columns based on route
  const gridClass =
    pathname === "/home"
      ? "grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0"
      : "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0";

  return (
    <section className="container mx-auto mb-6">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-md font-normal text-white flex items-center gap-2">
          <BellPlus size={16} strokeWidth={1.6} />
          Latest <span className="text-[#F97316]">Jobs</span>
        </h2>
        <Link
          href="/home/jobs"
          className="text-xs h-8 rounded-sm flex items-center justify-center gap-2 text-white transition"
        >
          All jobs{" "}
          <ArrowUpRight size={16} strokeWidth={1.5} className="text-white" />
        </Link>
      </div>

      {/* Job Grid */}
      <div className={gridClass}>
        {isLoading
          ? [...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)
          : jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </section>
  );
}
