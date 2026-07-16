"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Job-listing style card */}
        <div className="mb-8 rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Briefcase size={18} className="text-indigo-600" />
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              Closed
            </span>
          </div>
          <p className="mb-1 text-xs font-medium tracking-wide text-gray-400">
            Position ID: 404
          </p>
          <h2 className="mb-1 text-base font-semibold text-gray-900">
            Page not found
          </h2>
          <p className="text-sm text-gray-500">
            This listing isn't available anymore — it may have been moved or
            never existed.
          </p>
        </div>

        {/* Copy */}
        <div className="text-left">
          <h1 className="mb-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
            Let's get you back to job hunting
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-gray-500 sm:text-base">
            The page you were looking for has moved or doesn't exist. Head
            back and pick up where you left off.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Zenoway
          </Link>
        </div>
      </div>
    </div>
  );
}