"use client";
import { jobs } from "@/app/data/jobs";
import Link from "next/link";
import {
  LocationIcon,
  ExperienceIcon,
  SalaryIcon,
  CalendarIcon,
} from "../../components/Icons";
import { ArrowLeft, Share2 } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";

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
 // Share function
const handleShare = () => {
  const shareData = {
    title: job.title,
    text: `
${job.title} at ${job.company}

📍 Location: ${job.location}
💼 Experience: ${job.experience}
💰 Salary: ${job.salary}
📅 Posted on: ${job.postedDate}`,
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  if (navigator.share) {
    navigator
      .share(shareData)
      .catch((err) => console.log("Share error:", err));
  } else {
    navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    alert("Job details copied to clipboard!");
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between mb-6">
          <Link
            href="/"
            className="border h-8 w-8 border-gray-200 rounded-sm flex items-center justify-center gap-2 hover:bg-gray-100"
          ><ArrowLeft size={12}/>
              
          </Link>

          <button
            onClick={handleShare}
            className="border h-8 px-2 border-gray-200 rounded-sm flex items-center justify-between gap-2 hover:bg-gray-100"
          >
            <Share2 size={12} /> <h1 className="text-xs">Share</h1>
          </button>
        </div>

        {/* Job Title & Company */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">{job.title}</h1>
            <h2 className="text-sm font-light text-[#F97316]">{job.company}</h2>
          </div>

          {/* Share button */}
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
        <div className="flex flex-col gap-3">
          <button className="px-6 py-3 bg-[#1E293B] text-white rounded-sm hover:bg-[#1E293B]/90 cursor-pointer text-sm font-light">
            Apply Now
          </button>

        <Link href="/join">
      <button
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm font-medium flex items-center justify-center gap-2 transition w-full"
      >
        <IoLogoWhatsapp size={18} />
        <span>Join for more</span>
      </button>
    </Link>
        </div>
      </div>
    </div>
  );
}
