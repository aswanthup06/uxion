"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LocationIcon,
  ExperienceIcon,
  SalaryIcon,
  CalendarIcon,
} from "./components/Icons";

// Skeleton Loading Component
const JobCardSkeleton = () => (
  <div className="bg-white rounded-md overflow-hidden border border-gray-200">
    <div className="p-6">
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(9);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-gray-50 py-8 relative">
      <div className="h-full">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B]">
                UX<span className="text-[#F97316]">CURVE</span>{" "}
              </h1>
              <h1 className="text-[#1E293B] text-sm font-semibold">
                Your Gateway to UX Careers
              </h1>
            </div>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {isLoading
              ? // Show skeleton loaders while loading
                [...Array(6)].map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))
              : // Show actual job cards when data is loaded
                jobs.slice(0, visibleCount).map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id}>
                    <div className="bg-white rounded-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg">
                      <div className="p-6">
                        <div className="mb-4">
                          <h2 className="text-base md:text-xl font-semibold text-[#1E293B]">
                            {job.title}
                          </h2>
                          <h3 className="text-sm font-light text-[#F97316] md:text-base">
                            {job.company}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <LocationIcon /> {job.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <ExperienceIcon /> {job.experience}
                          </div>
                          <div className="flex items-center gap-2">
                            <SalaryIcon /> {job.salary}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon /> {job.postedDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Load More */}
          {!isLoading && visibleCount < jobs.length && (
            <div className="mt-4 text-center mb-6">
              <button
                onClick={loadMore}
                className="px-6 py-3 text-sm font-light bg-white border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-100 transition-colors"
              >
                Load More Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}