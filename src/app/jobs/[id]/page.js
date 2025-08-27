"use client";
import { jobs } from "@/app/data/jobs";
import Link from "next/link";
import {
  LocationIcon,
  ExperienceIcon,
  SalaryIcon,
  CalendarIcon,
} from "../../components/Icons";
import { Share2 } from "lucide-react";

export default function JobDetails({ params }) {
  const job = jobs.find((j) => j.id.toString() === params.id);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Job not found.</p>
      </div>
    );
  }

  // Share function
  const handleShare = () => {
    const shareData = {
      title: job.title,
      text: `Check out this job: ${job.title} at ${job.company}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log("Share error:", err));
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto p-8">
        {/* Job Title & Company */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{job.title}</h1>
            <h2 className="text-sm font-light text-blue-600">{job.company}</h2>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="border h-8 px-2 border-gray-200 rounded-sm flex items-center justify-between gap-2 hover:bg-gray-100"
          >
            <Share2 size={12} /> <h1 className="text-xs">Share</h1>
          </button>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <LocationIcon />
            {job.location}
          </div>

          <div className="flex items-center gap-2">
            <ExperienceIcon />
            {job.experience}
          </div>

          <div className="flex items-center gap-2">
            <SalaryIcon />
            {job.salary}
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon />
            {job.postedDate}
          </div>
        </div>

        {/* JD Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Job Description
          </h3>
          <p className="text-gray-700 text-md font-light whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Apply Button + Back */}
        <div className="flex flex-col gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700">
            Apply Now
          </button>
          <Link
            href="/"
            className="px-6 py-2 border rounded-sm text-gray-700 hover:bg-gray-50 flex justify-center"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
