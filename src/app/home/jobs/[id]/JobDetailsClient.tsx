// src/app/jobs/[id]/JobDetailsClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BanknoteArrowUp,
  BriefcaseBusiness,
  CalendarArrowUp,
  MapPin,
  Share2,
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import LatestJobs from "@/app/components/LatestJobs";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short", // "Jan", "Feb", etc.
      year: "numeric",
    }).format(date);
  };

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

${actualDescription.substring(0, 100)}...
`,
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
    <div className="h-fit md:h-full flex flex-col  gap-2 pb-20 md:pb-0 p-2 ">
      <div className="flex justify-between h-fit">
        <Link
          href="/"
          className=" h-10 w-10 flex items-center justify-center gap-2 border border-white/20 rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={12} />
        </Link>

        <button
          onClick={handleShare}
          className=" h-10 px-4 flex items-center justify-between gap-2 border border-white/20 rounded-full hover:bg-white/10"
        >
          <Share2 size={12} /> <h1 className="text-xs">Share</h1>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 max-h-full md:overflow-hidden justify-center w-full">
        <div className=" bg-white  overflow-scroll">
          <div className="relative">
            <img
              className="md:h-36 w-full object-cover"
              src="/bg3.jpg"
              alt=""
            />
            <div className="absolute top-0 left-0  p-6 w-full h-full flex flex-col justify-between">
              {/* Job Title & Company */}
              <div className="flex justify-between mb-6 w-full">
                <div>
                  <h1 className="text-xl font-bold text-white ">{job.title}</h1>
                  <h2 className="text-sm font-light text-[#F97316]">
                    {job.company}
                  </h2>
                </div>
                <div className="flex flex-col items-end">
                  <h2 className="text-xs text-white ">JOB ID</h2>
                  <h2 className="text-xs text-white ">{job.id}</h2>
                </div>
              </div>

              {/* Info Section */}

              <div className="flex gap-6 text-xs flex-wrap ">
                <div className="flex items-center gap-2 text-white">
                  <MapPin
                    className="text-blue-400"
                    size={14}
                    strokeWidth={1.5}
                  />
                  {job.location}
                </div>

                <div className="flex items-center gap-2 text-white">
                  <BriefcaseBusiness
                    className="text-blue-400"
                    size={14}
                    strokeWidth={1.5}
                  />
                  {job.experience}
                </div>

                <div className="flex items-center gap-2 text-white">
                  <BanknoteArrowUp
                    className="text-blue-400"
                    size={14}
                    strokeWidth={1.5}
                  />
                  {job.salary}
                </div>

                <div className="flex items-center gap-2 text-white">
                  <CalendarArrowUp
                    className="text-blue-400 "
                    size={14}
                    strokeWidth={1.5}
                  />
                  {formatDate(job.postedDate)}
                </div>
              </div>
            </div>
          </div>

          {actualDescription && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>

              <div className="text-sm font-light whitespace-pre-line leading-loose text-gray-600">
                {actualDescription}

                {isActualLink && (
                  <a
                    href={
                      job.companyLink.startsWith("http")
                        ? job.companyLink
                        : `https://${job.companyLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 text-gray-600 text-xs rounded-xs mt-6 flex items-center gap-2 w-full border border-gray-300 justify-center"
                  >
                    <span>Learn about company</span>
                    <MdArrowOutward />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Apply Button + Mail */}
        </div>
        <div className="flex flex-col gap-3 bg-white p-6 h-fit">
          {job.mail && (
            <div>
              <h1 className="text-lg font-semibold">
                Apply Directly to the Hiring Team
              </h1>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Send your updated resume and portfolio to the email below. A
                clear and professional email can improve your chances of getting
                noticed.
              </p>

              <p className="py-4 text-blue-500 text-sm break-all font-medium">
                {job.mail}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyMail}
                  className={`py-3 rounded-sm text-sm cursor-pointer transition-colors hover:bg-gray-100 ${
                    copied
                      ? "border border-green-700 text-green-700"
                      : "border border-gray-300 text-gray-700"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Email"}
                </button>

                <button
                  onClick={openMail}
                  className="bg-amber-600 py-3 rounded-sm text-sm cursor-pointer text-white hover:bg-amber-700 transition"
                >
                  Send Email
                </button>
              </div>
              <Link
                href="/home/email"
                className="mt-3 flex items-center justify-center w-full py-3 border border-gray-300 rounded-sm text-sm text-gray-700 hover:bg-gray-100  transition"
              >
                Learn How to Write a Professional Email
              </Link>
            </div>
          )}

          {job.apply && (
            <a
              href={job.apply}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <button className="px-6 w-full py-3 bg-black text-white rounded-sm hover:bg-gray-800 cursor-pointer text-sm">
                Apply Now
              </button>
            </a>
          )}

          <Link href="/home/join">
            <button className="px-6 py-3 border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-100 cursor-pointer text-sm font-medium flex items-center justify-center gap-2 transition w-full">
              <IoLogoWhatsapp size={18} />
              <span>Join Community</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
