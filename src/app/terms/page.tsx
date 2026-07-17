"use client";

import { ArrowLeft, Home, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "Use of Our Platform",
    body: "Zenoway provides job listing services for UI/UX professionals. Users must not misuse the platform for spam, fraud, or illegal activities.",
  },
  {
    title: "Job Listings",
    body: "Employers are responsible for the accuracy of job postings. Zenoway does not guarantee employment or hiring results.",
  },
  {
    title: "Liability",
    body: "Zenoway is not responsible for any losses, damages, or disputes arising between employers and job seekers.",
  },
  {
    title: "Changes to Terms",
    body: "We reserve the right to update these terms at any time. Continued use of the platform means you accept the updated terms.",
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* Nav */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 pl-2.5 pr-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>Back</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 pl-2.5 pr-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
        >
          <Home size={15} strokeWidth={2} />
          <span>Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} strokeWidth={2} className="text-amber-600" />
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
          Terms &amp; Conditions
        </h1>
        <p className="text-gray-500 leading-7 max-w-xl">
          By using Zenoway, you agree to comply with the following terms and
          conditions. Please read them carefully before using our platform.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <div
            key={section.title}
            className="group flex gap-5 p-5 border border-gray-200 rounded-sm hover:border-amber-600 transition-colors"
          >
            <span className="flex-none w-9 h-9 flex items-center justify-center rounded-sm bg-amber-50 text-amber-600 text-sm font-semibold group-hover:bg-amber-600 group-hover:text-white transition-colors">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                {section.title}
              </h2>
              <p className="text-sm text-gray-500 leading-7">{section.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact footer */}
      <div className="mt-8 flex items-start gap-4 p-5 border border-gray-200 rounded-sm bg-gray-50">
        <div className="p-2.5 bg-amber-50 rounded-sm text-amber-600">
          <Mail size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Questions about these Terms?
          </h2>
          <a
            href="mailto:support@zenoway.com"
            className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
          >
            support@zenoway.com
          </a>
        </div>
      </div>
    </main>
  );
}