"use client";

import { useEffect, useState } from "react";
import JobCard from "@/app/components/JobCard";
import JobCardSkeleton from "@/app/components/JobCardSkeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Job } from "../../types/job";
import { Slider } from "@/components/ui/slider"; // ✅ shadcn slider
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // ✅ modal

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ✅ separate temp vs confirmed
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 10]); // confirmed (for filter)
  const [tempExperienceRange, setTempExperienceRange] = useState<[number, number]>([0, 10]); // dialog temp

  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const [locations, setLocations] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs");
        const data: Job[] = await res.json();

        const sortedData = [...data].sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );

        setJobs(sortedData);
        setFilteredJobs(sortedData);

        setLocations([...new Set(sortedData.map((job) => job.location))].sort());
        setTitles([...new Set(sortedData.map((job) => job.title))].sort());
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;

    // 🔍 filter by title
    if (search) {
      result = result.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 📍 filter by location
    if (locationQuery) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    // 🎯 filter by confirmed experience range
    result = result.filter((job) => {
      if (!job.experience) return true;

      if (
        job.experience.toLowerCase() === "fresher" ||
        job.experience === "0" ||
        job.experience === "0-0"
      ) {
        return experienceRange[0] <= 0;
      }

      const match = job.experience.match(/(\d+)(?:\s*[-+]\s*(\d+))?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        return min >= experienceRange[0] && max <= experienceRange[1];
      }

      return true;
    });

    result = [...result].sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    setFilteredJobs(result);
    setVisibleCount(9);
  }, [search, locationQuery, experienceRange, jobs]);

  return (
    <section className="container mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3 items-center">
          <Link
            href="/"
            className="text-white h-10 w-10 flex items-center justify-center gap-2 border border-white/20 rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={12} />
          </Link>
          <h1 className="text-xl font-bold text-white">
            All <span className="text-[#F97316]">Jobs</span>
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* 🔍 Job Title */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search job title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowTitleSuggestions(true);
              }}
              onFocus={() => setShowTitleSuggestions(true)}
              className="px-4 py-3 rounded-full text-white bgco text-sm w-full focus:ring-0 focus:outline-none"
            />
            {showTitleSuggestions && search && (
              <ul className="absolute top-full mt-2 w-full bgco text-white/70 rounded-2xl shadow-lg max-h-48 overflow-auto z-20">
                {titles
                  .filter((title) =>
                    title.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((title, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setSearch(title);
                        setShowTitleSuggestions(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-[#031225]/40"
                    >
                      {title}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* 📍 Location */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search location..."
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="px-4 py-3 rounded-full text-white bgco text-sm w-full focus:ring-0 focus:outline-none"
            />
            {showSuggestions && locationQuery && (
              <ul className="absolute top-full mt-2 w-full bgco text-white/70 rounded-2xl shadow-lg max-h-48 overflow-auto z-20">
                {locations
                  .filter((loc) =>
                    loc.toLowerCase().includes(locationQuery.toLowerCase())
                  )
                  .map((loc, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setLocationQuery(loc);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-[#031225]/40"
                    >
                      {loc}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* 🎚 Experience (opens modal) */}
          <Dialog
            onOpenChange={(open) => {
              if (open) {
                // when opening, copy confirmed into temp
                setTempExperienceRange(experienceRange);
              }
            }}
          >
            <DialogTrigger asChild>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  readOnly
                  value={
                    experienceRange[0] === 0 && experienceRange[1] === 0
                      ? "Fresher"
                      : `${experienceRange[0]} - ${experienceRange[1]} years`
                  }
                  placeholder="Select Experience"
                  className="px-4 py-3 rounded-full text-white bgco text-sm w-full cursor-pointer focus:ring-0 focus:outline-none"
                />
              </div>
            </DialogTrigger>

            <DialogContent className="bgco text-white border border-white/10 rounded-2xl shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-white/70">
                  Select Experience Range
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <span className="text-sm text-white/70">
                  {tempExperienceRange[0] === 0 && tempExperienceRange[1] === 0
                    ? "Fresher"
                    : `${tempExperienceRange[0]} - ${tempExperienceRange[1]} years`}
                </span>
                <Slider
                  min={0}
                  max={15}
                  step={1}
                  value={tempExperienceRange}
                  onValueChange={(val: [number, number]) =>
                    setTempExperienceRange(val)
                  }
                />
              </div>

              {/* ✨ Footer buttons */}
              <div className="flex justify-end gap-3 mt-6">
                {/* Cancel → do nothing, just close */}
                <DialogTrigger asChild>
                  <button
                    className="px-4 py-2 rounded-lg border border-white/30 text-white/70 hover:bg-white/10 text-sm"
                  >
                    Cancel
                  </button>
                </DialogTrigger>

                {/* Okay → confirm temp */}
                <DialogTrigger asChild>
                  <button
                    className="px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-[#ea580c]"
                    onClick={() => setExperienceRange(tempExperienceRange)}
                  >
                    Okay
                  </button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-0 px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
          <div className="grid px-4 grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-0">
            {filteredJobs.slice(0, visibleCount).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {visibleCount < filteredJobs.length && (
            <div className="flex justify-center mt-6 p-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="px-6 py-3 rounded-full border border-white/20 w-full text-white/50 text-sm font-medium hover:bg-white/10"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-center mt-10">No jobs found.</p>
      )}
    </section>
  );
}
