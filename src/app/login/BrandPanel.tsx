"use client";

import Link from "next/link";
import { ArrowUpRight, Compass, Leaf } from "lucide-react";

export default function BrandPanel() {
  return (
    <aside className="relative hidden min-h-0 overflow-hidden bg-[#F4F8F5] p-8 text-[#163D30] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/4 h-80 w-80 rounded-full border border-[#D7E7DC]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-[30%] h-48 w-48 rounded-full border border-[#D7E7DC]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-[#E6F1E9]"
      />

      <Link
        href="/"
        aria-label="Zenoway home"
        className="relative z-10 inline-flex w-fit items-center gap-2.5 text-xl font-semibold tracking-tight"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#087F50] shadow-sm ring-1 ring-[#E1EBE4]">
          <Leaf size={19} strokeWidth={1.8} />
        </span>
        zenoway
      </Link>

      <div className="relative z-10 my-10 max-w-lg">
        <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#087F50]">
          <span className="h-px w-6 bg-[#087F50]" />
          Your next chapter
        </p>
        <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#153D30] xl:text-5xl">
          Find work that
          <br />
          fits your life.
        </h2>
        <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#64766C]">
          Discover meaningful opportunities and take the next step in your
          career, on your terms.
        </p>

        <div className="mt-9 inline-flex items-center gap-3 border-t border-[#DCE8DF] pt-5 text-sm font-medium text-[#315747]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#087F50] ring-1 ring-[#E1EBE4]">
            <Compass size={19} strokeWidth={1.7} />
          </span>
          A clearer path to your next opportunity
          <ArrowUpRight size={16} className="text-[#087F50]" />
        </div>
      </div>

      <p className="relative z-10 text-xs text-[#718279]">
        Make your next move count.
      </p>
    </aside>
  );
}
