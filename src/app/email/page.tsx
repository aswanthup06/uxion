
"use client";

import Link from "next/link";
import {
  Mail,
  Check,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import SiteFooter from "../components/home/SiteFooter";

const subjectLines = [
  "Application for UI/UX Designer Position",
  "Frontend Developer Application - John Doe",
  "Applying for Product Designer Role | [Your Name]",
];

const documents = [
  {
    title: "Updated resume",
    note: "Use a clear filename, such as YourName_Resume.pdf",
  },
  {
    title: "Portfolio link",
    note: "Check that your projects open correctly",
  },
  {
    title: "Cover letter",
    note: "Optional, unless the job asks for one",
  },
  {
    title: "Relevant certifications",
    note: "Optional; include only what supports your application",
  },
];

const checklist = [
  "Correct recipient email address",
  "Professional subject line",
  "Resume attached and properly named",
  "Portfolio link works and is included",
  "No spelling or grammar mistakes",
];

const mistakes = [
  "Sending an email without a subject line",
  "Forgetting to attach your resume",
  "Using an unprofessional email address",
  "Writing a message that is too long",
  "Leaving out a relevant portfolio link",
  'Using a generic greeting like "To whom it may concern"',
];

const steps = [
  {
    number: "01",
    title: "Use a clear subject line",
    description:
      "Make the role immediately obvious. If the employer provided a reference number or a required format, follow it.",
  },
  {
    number: "02",
    title: "Introduce yourself briefly",
    description:
      "Keep your introduction concise. Mention the position, then highlight one or two relevant skills or experiences in two or three sentences.",
  },
  {
    number: "03",
    title: "Attach the right documents",
    description:
      "Include the materials requested in the job description. Keep filenames professional and make links easy to open.",
  },
  {
    number: "04",
    title: "Review before sending",
    description:
      "A quick final review can prevent avoidable mistakes. Check each item before you press send.",
  },
];

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-gray-600">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF6EF] text-[#087F50]">
        <Check size={12} strokeWidth={2.5} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function EmailGuidePage() {
  return (
    <main className="min-h-screen bg-white text-[#17231D]">
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-12 flex items-center gap-2 text-sm sm:mb-16"
        >
          <Link
            href="/"
            className="text-gray-500 transition-colors hover:text-[#087F50]"
          >
            Home
          </Link>

          <span className="text-gray-300">/</span>

          <span className="font-medium text-[#087F50]" aria-current="page">
            Career Guide
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-16 max-w-3xl sm:mb-20">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
            <Mail size={17} strokeWidth={1.8} />
            <span>Zenoway Career Guide</span>
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#17231D] sm:text-4xl md:text-5xl">
            How to write a professional job application email
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
            A thoughtful email helps recruiters understand who you are and why
            you could be a good fit. Follow these practical steps to make a
            confident first impression.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span>4 simple steps</span>
            <span className="text-gray-300" aria-hidden="true">·</span>
            <span>Sample email</span>
            <span className="text-gray-300" aria-hidden="true">·</span>
            <span>Pre-send checklist</span>
          </div>
        </header>

        {/* Writing steps */}
        <section
          aria-label="Steps for writing a job application email"
          className="mb-16 sm:mb-20"
        >
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
              The process
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Make every email count.
            </h2>
          </div>

          <div className="border-y border-gray-100">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className={`grid grid-cols-[32px_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6 sm:py-8 ${
                  index !== 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <span className="pt-1 text-xs font-semibold tracking-wide text-[#087F50]">
                  {step.number}
                </span>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight text-[#17231D] sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                    {step.description}
                  </p>

                  {index === 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Subject line examples
                      </p>

                      {subjectLines.map((subject) => (
                        <div
                          key={subject}
                          className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                        >
                          <Check
                            size={16}
                            className="mt-1 shrink-0 text-[#087F50]"
                          />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {index === 1 && (
                    <p className="mt-5 border-l-2 border-[#087F50] pl-4 text-sm leading-7 text-gray-600">
                      <span className="font-semibold text-[#17231D]">
                        Tip:
                      </span>{" "}
                      Focus on what you can contribute to the company—not only
                      on what you hope to gain from the role.
                    </p>
                  )}

                  {index === 2 && (
                    <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                      {documents.map((document) => (
                        <div key={document.title} className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#17231D]">
                            <Check
                              size={16}
                              className="shrink-0 text-[#087F50]"
                            />
                            {document.title}
                          </div>

                          <p className="mt-1 pl-6 text-sm leading-6 text-gray-500">
                            {document.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {index === 3 && (
                    <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {checklist.map((item) => (
                        <CheckItem key={item}>{item}</CheckItem>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sample email */}
        <section
          aria-labelledby="sample-heading"
          className="mb-16 sm:mb-20"
        >
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
              Ready-to-use example
            </p>

            <h2
              id="sample-heading"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Sample job application email
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
              Adapt this example to your experience and the role. Replace the
              placeholders before sending.
            </p>
          </div>

          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
            {/* Email header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-7">
              <Mail
                size={17}
                strokeWidth={1.7}
                className="text-[#087F50]"
              />
              <span className="text-sm font-medium text-gray-600">
                New message
              </span>
            </div>

            <div className="p-5 sm:p-8 lg:p-9">
              <div className="mb-7 space-y-4 border-b border-gray-100 pb-6 text-sm sm:flex sm:gap-8 sm:space-y-0">
                <div className="min-w-0 sm:flex-1">
                  <p className="mb-1 text-xs text-gray-400">TO</p>
                  <p className="break-words text-gray-700">
                    Hiring manager / recruiter
                  </p>
                </div>

                <div className="min-w-0 sm:flex-[2]">
                  <p className="mb-1 text-xs text-gray-400">SUBJECT</p>
                  <p className="break-words font-medium leading-6 text-[#17231D]">
                    Application for UI/UX Designer Position | [Your Name]
                  </p>
                </div>
              </div>

              <div className="max-w-2xl space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
                <p>Dear Hiring Team,</p>

                <p>I hope you are doing well.</p>

                <p>
                  I am writing to apply for the UI/UX Designer position at your
                  company. My experience in creating user-centered interfaces
                  and designing responsive web and mobile applications has
                  helped me develop skills that I would be excited to bring to
                  your team.
                </p>

                <p>
                  Please find my resume attached for your review. You can also
                  view selected projects in my portfolio:
                </p>

                <div className="rounded-sm bg-[#F5FAF7] px-4 py-3 sm:px-5">
                  <span className="font-medium text-[#17231D]">
                    Portfolio:{" "}
                  </span>
                  <span className="break-all text-[#087F50]">
                    https://yourportfolio.com
                  </span>
                </div>

                <p>
                  Thank you for your time and consideration. I would welcome
                  the opportunity to discuss how my skills and experience align
                  with this role.
                </p>

                <p className="pt-2">
                  Best regards,
                  <br />
                  <span className="font-semibold text-[#17231D]">
                    [Your Name]
                  </span>
                  <br />
                  [your.email@example.com]
                  <br />
                  [Your phone number]
                </p>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <p className="text-sm leading-6 text-gray-500">
                  <span className="font-semibold text-[#087F50]">
                    Before sending:
                  </span>{" "}
                  Personalize the role title, experience, portfolio URL, and
                  contact details. Remember to attach your resume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section
          aria-labelledby="mistakes-heading"
          className="border-t border-gray-100 pt-10 sm:pt-12"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#EAF6EF] text-[#087F50]">
              <AlertTriangle size={19} strokeWidth={1.7} />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
                Final reminders
              </p>

              <h2
                id="mistakes-heading"
                className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
              >
                Common mistakes to avoid
              </h2>
            </div>
          </div>

          <ul className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {mistakes.map((mistake) => (
              <li
                key={mistake}
                className="flex items-start gap-3 text-sm leading-6 text-gray-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#087F50]" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <footer className="mt-14 border-t border-gray-100 pt-6">
          <p className="text-sm leading-7 text-gray-500">
            A thoughtful email is a small step toward presenting your
            application professionally.
          </p>

          <Link
            href="/jobs"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#087F50] transition-colors hover:text-[#066640]"
          >
            Explore job opportunities
            <ArrowUpRight size={16} />
          </Link>

          <p className="mt-8 text-xs text-gray-400">
            Zenoway · Career resources
          </p>
        </footer>
         
      </div> <SiteFooter />
    </main>
  );
}
