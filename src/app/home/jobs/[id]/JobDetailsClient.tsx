// src/app/jobs/[id]/JobDetailsClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import Image from "next/image";

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

  // --- GOOGLE JOBS SCHEMA GENERATION (fixed) ---
  const getJobPostingSchema = () => {
    // Generate valid ISO date string (YYYY-MM-DD)
    let datePostedISO = new Date().toISOString().split("T")[0];
    try {
      if (job.postedDate) {
        datePostedISO = new Date(job.postedDate).toISOString().split("T")[0];
      }
    } catch (e) {
      console.error("Invalid date format", e);
    }

    // Recommended: expiry date so Google doesn't have to guess/expire it itself.
    // Adjust the window (e.g. 45 days) to whatever makes sense for your listings.
    const postedDateObj = new Date(datePostedISO);
    const validThroughDate = new Date(postedDateObj);
    validThroughDate.setDate(validThroughDate.getDate() + 45);
    const validThroughISO = validThroughDate.toISOString().split("T")[0];

    const isRemote = job.location?.trim().toLowerCase() === "remote";

    const locationParts = job.location ? job.location.split(",") : [];
    const locality = locationParts[0]?.trim() || "Kochi";
    const region = locationParts[1]?.trim() || "Kerala";

    const baseSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: actualDescription,
      datePosted: datePostedISO,
      validThrough: validThroughISO,
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
        sameAs: isActualLink
          ? job.companyLink.startsWith("http")
            ? job.companyLink
            : `https://${job.companyLink}`
          : "https://www.zenoway.com",
      },
      directApply: true,
    };

    if (isRemote) {
      // Do NOT invent a fake jobLocation for remote roles.
      // Google requires a real place for jobLocation — "Remote" is not one.
      return {
        ...baseSchema,
        jobLocationType: "TELECOMMUTE",
        // Adjust this to wherever candidates are actually allowed to apply from.
        applicantLocationRequirements: {
          "@type": "Country",
          name: "India",
        },
      };
    }

    // On-site / hybrid roles: use a real address.
    return {
      ...baseSchema,
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: locality,
          addressRegion: region,
          addressCountry: "IN",
        },
      },
    };
  };

  const schemaJson = getJobPostingSchema();

  return (
    <main className="h-[calc(100dvh-48px)] overflow-y-auto   pb-20 md:pb-0">
      {/* 🚀 Dynamic Google Jobs Rich Schema Insertion */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaJson).replace(/</g, "\\u003c"), // Escape < to prevent potential XSS injection
        }}
      />

      <div className="relative  overflow-hidden border-b border-gray-200 flex">
        <div className="relative p-6">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, transparent 50%, rgba(24,24,27,0.03) 100%)",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse at center, #000 60%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, #000 60%, transparent 100%)",
            }}
          />
          <span className="inline-flex items-center text-sm font-medium text-orange-600">
            {job.company} is Hiring
          </span>

          <h1 className="mt-1 text-5xl font-bold leading-tight tracking-tight text-zinc-900">
            {job.title}
          </h1>
          <div className="w-3/4">
            <p className="mt-2 text-base leading-8 text-zinc-600">
              Are you passionate about designing intuitive and engaging digital
              experiences? Join{" "}
              <span className="font-semibold">{job.company}</span> and work on
              real-world products with a collaborative team. You'll contribute
              to user-centered solutions, build meaningful experiences, and grow
              your skills while working on exciting projects.
            </p>
          </div>

          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-zinc-500">
              Location: {job.location}
            </h4>
          </div>
        </div>

        <div className="w-[500px] grid border-l border-zinc-200">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Opportunity
            </p>
            <p className="mt-1 font-semibold text-zinc-900">
              Full-Time Position
            </p>
          </div>

          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Experience
            </p>
            <p className="mt-1 font-semibold text-zinc-900">
              {job.experience || "1–3 Years"}
            </p>
          </div>

          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Type
            </p>
            <p className="mt-1 font-semibold text-zinc-900">Onsite</p>
          </div>

          <div className=" bg-zinc-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Salary Range
            </p>
            <p className="mt-1 font-semibold text-zinc-900">{job.salary}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row  justify-center w-full">
        <div className="w-full md:w-auto md:flex-1 border-r border-gray-200">
          {actualDescription && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>

              <div className="text-sm font-medium whitespace-pre-line leading-loose text-gray-600">
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

        <div className="w-full md:w-[340px] lg:w-[340px] xl:w-[460px] md:shrink-0">
          <div className="flex flex-col gap-3 bg-white p-6 h-fit">
            {job.mail && (
              <div>
                <h1 className="text-lg font-semibold">
                  Apply Directly to the Hiring Team
                </h1>

                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Send your updated resume and portfolio to the email below. A
                  clear and professional email can improve your chances of
                  getting noticed.
                </p>

                <p className="py-4 text-blue-700 text-md break-all font-medium tracking-wider">
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
                    className="bg-black py-3 rounded-sm text-sm cursor-pointer text-white hover:bg-black/90 transition"
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

          {/* Compliance / Legal Links Footer */}

          <div
            className="
          flex flex-wrap gap-x-3 gap-y-1.5 px-6 py-4  mt-2
          border-y border-gray-200  text-[11px] font-medium text-gray-700 mx-6 md:mx-0
        "
          >
            <Link
              href="/about"
              className="hover:text-gray-800 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-gray-800 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-800 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-800 transition-colors"
            >
              Contact
            </Link>
            <p className="w-full text-[10px] text-gray-700 font-normal mt-1">
              &copy; {new Date().getFullYear()} Zenoway
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
