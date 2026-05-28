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
    <section className="container mx-auto px-4 py-6 h-full overflow-scroll">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3 items-center">
          <Link
            href="/"
            className="h-10 w-10 flex items-center justify-center gap-2 border border-white/20 rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={12} />
          </Link>
          <h1 className="text-xl font-bold">
            All <span className="">Jobs</span>
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto ">
          {/* 🔍 Job Title */}
          <div className="relative w-full md:w-72 bg-white rounded-md border border-gray-200">
            <input
              type="text"
              placeholder="Search job title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowTitleSuggestions(true);
              }}
              onFocus={() => setShowTitleSuggestions(true)}
              className="px-4 py-3 rounded-md bg-white text-sm w-full focus:ring-0 focus:outline-none"
            />
            {showTitleSuggestions && search && (
              <ul className="absolute top-full mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto z-20">
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
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {title}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* 📍 Location */}
          <div className="relative w-full md:w-64 bg-white rounded-md border border-gray-200">
            <input
              type="text"
              placeholder="Search location..."
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="px-4 py-3   bg-white text-sm w-full focus:ring-0 focus:outline-none rounded-md"
            />
            {showSuggestions && locationQuery && (
              <ul className="absolute top-full mt-2 w-full bg-white rounded-md border border-gray-200  shadow-lg max-h-48 overflow-auto z-20">
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
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
      setTempExperienceRange(experienceRange);
    }
  }}
>
  <DialogTrigger asChild>
    <div className="relative w-full md:w-64">
      <button
        className="
          w-full px-4 py-3 bg-white border border-gray-200
          rounded-md text-sm text-left
          flex items-center justify-between
          hover:border-gray-300 transition-all duration-200
        "
      >
        <span className="text-gray-700">
          {experienceRange[0] === 0 && experienceRange[1] === 0
            ? "Fresher"
            : `${experienceRange[0]} - ${experienceRange[1]} years`}
        </span>

        <span className="text-gray-400 text-xs">
          Experience
        </span>
      </button>
    </div>
  </DialogTrigger>

  <DialogContent className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6">
    
    <DialogHeader className="mb-4">
      <DialogTitle className="text-lg font-semibold text-gray-900">
        Experience Level
      </DialogTitle>

      <p className="text-sm text-gray-500 mt-1">
        Select your preferred experience range
      </p>
    </DialogHeader>

    <div className="flex flex-col gap-6">
      
      {/* Selected Value */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
        <span className="text-2xl font-semibold text-gray-900">
          {tempExperienceRange[0] === 0 &&
          tempExperienceRange[1] === 0
            ? "Fresher"
            : `${tempExperienceRange[0]} - ${tempExperienceRange[1]} yrs`}
        </span>
      </div>

      {/* Slider */}
      <div className="px-1">
       <Slider
  min={0}
  max={15}
  step={1}
  value={tempExperienceRange}
  onValueChange={(val: [number, number]) =>
    setTempExperienceRange(val)
  }
  className="
    [&_[role=slider]]:bg-[#F97316]
    [&_[role=slider]]:border-0
    [&_[data-orientation=horizontal]]:h-2
    [&_[data-slot=slider-track]]:bg-gray-200
    [&_[data-slot=slider-range]]:bg-[#F97316]
  "
/>
      </div>
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 mt-8">
      
      <DialogTrigger asChild>
        <button
          className="
            px-5 py-2.5 rounded-xl text-sm
            border border-gray-200
            hover:bg-gray-50 transition
          "
        >
          Cancel
        </button>
      </DialogTrigger>

      <DialogTrigger asChild>
        <button
          className="
            px-5 py-2.5 rounded-xl text-sm font-medium
            bg-[#F97316] text-white
            hover:bg-[#ea580c]
            transition
          "
          onClick={() =>
            setExperienceRange(tempExperienceRange)
          }
        >
          Apply
        </button>
      </DialogTrigger>
    </div>
  </DialogContent>
</Dialog>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {filteredJobs.slice(0, visibleCount).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {visibleCount < filteredJobs.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="px-6 py-3 rounded-full border border-gray-300 w-full text-gray-600 text-sm font-medium hover:bg-gray-200 cursor-pointer duration-500"
              >
                Load more
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
