"use client";

import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/app/components/home/SiteFooter";

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
  return (
    <main className="min-h-dvh bg-white text-slate-900">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-12 flex items-center gap-2 text-sm sm:mb-16"
        >
          <Link
            href="/"
            className="text-slate-500 transition-colors hover:text-[#087F50]"
          >
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span aria-current="page" className="font-medium text-[#087F50]">
            Terms &amp; Conditions
          </span>
        </nav>

        {/* Header */}
        <header className="mb-12 max-w-2xl border-b border-slate-200 pb-8 sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
            <ShieldCheck size={14} strokeWidth={1.8} />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Terms &amp; Conditions
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            By using Zenoway, you agree to comply with the following terms
            and conditions. Please read them carefully before using our
            platform.
          </p>
        </header>

        {/* Terms Sections */}
        <section aria-label="Terms and conditions sections">
          <div className="divide-y divide-slate-200">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className="flex gap-4 py-6 sm:gap-6 sm:py-7"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-sm font-semibold text-[#087F50]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {section.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 border-t border-slate-200 pt-8 sm:mt-12 sm:pt-10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[#087F50]">
              <Mail size={19} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Questions about these terms?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Contact our team if you need clarification about these
                conditions.
              </p>
              <a
                href="mailto:support@zenoway.online"
                className="mt-2 inline-block text-sm font-medium text-[#087F50] transition-colors hover:text-[#066640]"
              >
                support@zenoway.online
              </a>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
