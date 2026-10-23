"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-white text-[#173D2E]">
      {/* Minimal header */}
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10 sm:py-7">
        <Link
          href="/"
          aria-label="Zenoway home"
          className="group inline-flex cursor-pointer items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#087F50] text-sm font-semibold text-white">
            z
          </span>
          <span className="text-base font-semibold tracking-tight">
            zenoway
          </span>
        </Link>

        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8B9890]">
          Error 404
        </span>
      </header>

      {/* Main content */}
      <section className="relative flex min-h-0 flex-1 items-center px-6 sm:px-10">
        {/* Decorative typography */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-0.08em] top-1/2 -translate-y-1/2 select-none text-[clamp(13rem,39vw,36rem)] font-semibold leading-none tracking-[-0.12em] text-[#F5F8F5]"
        >
          4<span className="text-[#EAF4ED]">0</span>4
        </div>

        {/* Text content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-[#087F50]" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#087F50]">
              Wrong turn
            </span>
          </div>

          <h1 className="max-w-xl text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.065em] text-[#173D2E]">
            Good things
            <br />
            are <span className="text-[#0FA968]">ahead.</span>
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#758279] sm:text-base">
            We couldn’t find the page you were looking for. It may have moved,
            or the link might be outdated.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/"
              className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#087F50] transition-colors hover:text-[#065E3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50] focus-visible:ring-offset-4"
            >
              <ArrowLeft
                size={17}
                strokeWidth={1.7}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Back to home
            </Link>

            <Link
              href="/jobs"
              className="group inline-flex cursor-pointer items-center gap-2 border-b border-[#DCE8DF] pb-1.5 text-sm font-medium text-[#53665A] transition-colors hover:border-[#087F50] hover:text-[#087F50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50] focus-visible:ring-offset-4"
            >
              Explore jobs
              <ArrowUpRight
                size={15}
                strokeWidth={1.7}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Small side marker */}
        <div className="absolute bottom-6 right-6 hidden items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#A1ACA4] sm:flex sm:right-10">
          <ArrowDownRight size={13} />
          Keep moving forward
        </div>
      </section>

      {/* Bottom edge */}
      <footer className="flex shrink-0 items-center justify-between border-t border-[#F0F3F0] px-6 py-4 sm:px-10">
        <span className="text-[10px] tracking-wide text-[#98A39B]">
          Find your next opportunity.
        </span>
        <span className="text-[10px] font-medium tracking-wide text-[#087F50]">
          ZENOWAY
        </span>
      </footer>
    </main>
  );
}