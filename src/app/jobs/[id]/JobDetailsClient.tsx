// src/app/jobs/[id]/JobDetailsClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LocationIcon,
  ExperienceIcon,
  SalaryIcon,
  CalendarIcon,
} from "../../components/Icons";
import { ArrowLeft, Share2 } from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";

// Define Job type
export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  apply: string;
  description: string;
};

// Props type
type JobDetailsClientProps = {
  job: Job;
};

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const actualDescription = job.description || "";

  const isActualLink =
    job.companyLink &&
    (job.companyLink.startsWith("http") ||
      job.companyLink.startsWith("www.") ||
      job.companyLink.includes(".com") ||
      job.companyLink.includes(".in") ||
      job.companyLink.includes(".org"));

  // Copy Mail function
  const copyMail = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(job.mail)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = job.mail;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Copy failed", err);
      }

      document.body.removeChild(textArea);
    }
  };

  const openMail = () => {
    window.location.href = `mailto:${job.mail}`;
  };

  // Share function
  const handleShare = () => {
    const shareData = {
      title: job.title,
      text: `
${job.title} at ${job.company}

📍 Location: ${job.location}
💼 Experience: ${job.experience}
💰 Salary: ${job.salary}
📅 Posted on: ${job.postedDate}

${actualDescription.substring(0, 100)}...
`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log("Share error:", err));
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
          >
            <ArrowLeft size={12} />
          </Link>

          <button
            onClick={handleShare}
            className="border h-8 px-2 border-gray-200 rounded-sm flex items-center justify-between gap-2 hover:bg-gray-100"
          >
            <Share2 size={12} /> <h1 className="text-xs">Share</h1>
          </button>
        </div>

        {/* Job Title & Company */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">{job.title}</h1>
            <h2 className="text-sm font-light text-[#F97316]">{job.company}</h2>
          </div>

          <h2 className="text-sm text-gray-700">JOB ID : {job.id}</h2>
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

        {isActualLink && (
          <a
            href={job.companyLink.startsWith("http") ? job.companyLink : `https://${job.companyLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-blue-600 mb-4 flex items-center gap-2"
          >
            <h1>Learn about company</h1>
            <MdArrowOutward />
          </a>
        )}

        {actualDescription && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
            <p className="text-gray-700 text-md font-light whitespace-pre-line leading-relaxed">
              {actualDescription}
            </p>
          </div>
        )}

        {/* Apply Button + Mail */}
        <div className="flex flex-col gap-3">
          {job.mail && (
            <div className="border-t pt-6 border-gray-300">
              <h1 className="text-lg font-semibold">You can apply directly to the hiring team</h1>
              <p className="text-gray-700">Please remember to attach your portfolio and updated resume</p>
              <p className="py-3 text-blue-700">{job.mail}</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyMail}
                  className={`border py-3 rounded-sm text-sm cursor-pointer transition-colors ${
                    copied ? "border-green-600 text-green-700" : "border-gray-300 text-gray-700"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Mail"}
                </button>
                <button
                  onClick={openMail}
                  className="bg-amber-600 py-3 rounded-sm text-sm cursor-pointer text-white font-light"
                >
                  Send Mail
                </button>
              </div>
            </div>
          )}

          {job.apply && (
            <a
              href={job.apply}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 text-blue-600 flex items-center gap-2 w-full"
            >
              <button className="px-6 w-full py-3 bg-[#1E293B] text-white rounded-sm hover:bg-[#1E293B]/90 cursor-pointer text-sm font-light">
                Apply Now
              </button>
            </a>
          )}

          <Link href="/join">
            <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm font-medium flex items-center justify-center gap-2 transition w-full">
              <IoLogoWhatsapp size={18} />
              <span>Join for more</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
