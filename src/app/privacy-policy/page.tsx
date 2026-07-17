"use client";

import { ArrowLeft, Home, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "Information We Collect",
    body: "We may collect information such as your name, email address, and portfolio links when you register or apply for jobs. Employers may also provide company details and job postings.",
  },
  {
    title: "How We Use Information",
    body: "We use the collected information to connect job seekers with employers, improve our platform, and send relevant job updates.",
  },
  {
    title: "Third-Party Services",
    body: "We may use third-party services such as Google Analytics and AdSense. These services may use cookies to provide personalized experiences.",
  },
  {
    title: "Your Rights",
    body: "You have the right to request deletion or correction of your data at any time. Please contact us for assistance.",
  },
];

export default function PrivacyPolicyPage() {
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
          <Lock size={14} strokeWidth={2} className="text-amber-600" />
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-gray-500 leading-7 max-w-xl">
          At Zenoway, we respect your privacy and are committed to protecting
          your personal information. This Privacy Policy explains how we
          collect, use, and safeguard your data.
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
            Questions about this Policy?
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