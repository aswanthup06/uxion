"use client";

import {
  ArrowLeft,
  Home,
  Target,
  Users,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiLinkedinLogoFill } from "react-icons/pi";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    body: "Zenoway connects early-stage startups with first-time job seekers, making it easier for both sides to find the right fit without the noise of traditional job boards.",
  },
  {
    icon: Users,
    title: "Who It's For",
    body: "Built for UI/UX professionals and developers just starting out, alongside startups that need to move fast and hire people who care about doing good work.",
  },
  {
    icon: Rocket,
    title: "Why We Built It",
    body: "Job hunting shouldn't feel like shouting into a void. Zenoway focuses on direct, transparent listings so applicants know exactly who they're reaching and why.",
  },
];

export default function AboutPage() {
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
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
          About Us
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-3 text-gray-900">
          Built to make job hunting simpler
        </h1>
        <p className="text-gray-500 leading-7 max-w-xl">
          Zenoway is a career platform designed for early-stage startups and
          first-time job seekers — a straightforward way to connect without
          the clutter of traditional hiring platforms.
        </p>
      </div>

      {/* Value cards */}
      <div className="space-y-3 mb-10">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <div
              key={value.title}
              className="group flex gap-5 p-5 border border-gray-200 rounded-sm hover:border-amber-600 transition-colors"
            >
              <span className="flex-none w-9 h-9 flex items-center justify-center rounded-sm bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                  {value.title}
                </h2>
                <p className="text-sm text-gray-500 leading-7">{value.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creator card */}
  {/* Creator card */}
<div className="flex items-center justify-between gap-4 p-5 border border-gray-200 rounded-sm bg-gray-50">
  <div>
    <h2 className="text-sm font-semibold text-gray-900 mb-1">
      Zenoway
    </h2>
    <p className="text-sm text-gray-500">
      Follow us for updates and new job postings
    </p>
  </div>
  <a
    href="https://linkedin.com/company/zenoway"
    target="_blank"
    rel="noopener noreferrer"
    className="flex-none flex items-center gap-2 px-4 py-2 bg-black text-white rounded-sm text-sm hover:bg-gray-800 transition-colors"
  >
    <PiLinkedinLogoFill />
    <span>LinkedIn</span>
  </a>
</div>
    </main>
  );
}