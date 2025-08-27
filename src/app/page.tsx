"use client";
import { useState } from "react";
import { jobs as jobData } from "./data/jobs"; 
import Link from "next/link";
import { LocationIcon, ExperienceIcon, SalaryIcon, CalendarIcon } from "./components/Icons";

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(9); 
  const [jobs] = useState(jobData);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 10); 
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Job Opportunities
          </h1>
          <p className="text-gray-600">
            Find your next career move from our curated listings
          </p>
        </header>

        {/* Job Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {jobs.slice(0, visibleCount).map((job) => (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <div className="bg-white rounded-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg">
                <div className="p-6">
                  {/* Job Title & Company */}
                  <div className="mb-4">
                    <h2 className="text-base md:text-xl font-semibold text-gray-800">
                      {job.title}
                    </h2>
                    <h3 className="text-sm font-light md:text-lg text-blue-600">
                      {job.company}
                    </h3>
                  </div>

                  {/* Job Info with Icons */}
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

        {/* Load More Button */}
        {visibleCount < jobs.length && (
          <div className="mt-8 text-center">
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
  );
}
