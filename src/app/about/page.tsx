
"use client";

import Link from "next/link";
import {
  Target,
  Users,
  Rocket,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import { PiLinkedinLogoFill } from "react-icons/pi";
import SiteFooter from "@/app/components/home/SiteFooter";

const values = [
  {
    icon: Target,
    title: "Our mission",
    body: "Zenoway connects early-stage startups with job seekers, making it easier for both sides to find the right fit without the noise of traditional job boards.",
  },
  {
    icon: Users,
    title: "Who it's for",
    body: "We're building for people looking for their next opportunity and employers who want to connect with people who care about doing good work.",
  },
  {
    icon: Rocket,
    title: "Why we built it",
    body: "Job hunting shouldn't feel like shouting into a void. We focus on clear job listings and direct connections to make finding the right opportunity simpler.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-surface-page text-text-primary">
        <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-24">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-12 flex items-center gap-2 text-sm sm:mb-16"
          >
            <Link
              href="/"
              className="text-text-muted transition-colors hover:text-brand"
            >
              Home
            </Link>

            <span className="text-border-strong">/</span>

            <span
              aria-current="page"
              className="font-medium text-brand"
            >
              About
            </span>
          </nav>

          {/* Hero */}
          <section className="mb-16 max-w-3xl sm:mb-20">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              About Zenoway
            </p>

            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              A simpler way to find your next opportunity.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
              Zenoway is a career platform built to bring job seekers and
              employers closer together. We want finding work and discovering
              the right people to feel clearer, more direct, and less
              complicated.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/jobs"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand px-5 py-3 text-sm font-medium text-text-inverse shadow-xs transition-colors hover:bg-brand-hover"
              >
                Explore opportunities
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-brand"
              >
                Get in touch
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </section>

          {/* Values */}
          <section aria-labelledby="about-values-heading">
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                What drives us
              </p>

              <h2
                id="about-values-heading"
                className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
              >
                Built around people.
              </h2>
            </div>

            <div className="border-y border-border-subtle">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-4 border-b border-border-subtle py-7 last:border-b-0 sm:gap-5 sm:py-8"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                      <Icon size={19} strokeWidth={1.7} />
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-6 text-text-primary sm:text-lg">
                        {value.title}
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                        {value.body}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Social links */}
          <section className="mt-16 border-t border-border-subtle pt-8 sm:mt-20 sm:pt-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  Stay connected
                </p>

                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                  Follow our journey.
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                  Follow Zenoway for career updates, new job postings, and
                  opportunities.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                <a
                  href="https://linkedin.com/company/zenoway"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Zenoway on LinkedIn"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand px-4 py-3 text-sm font-medium text-text-inverse shadow-xs transition-colors hover:bg-brand-hover"
                >
                  <PiLinkedinLogoFill size={17} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={14} />
                </a>

                <a
                  href="https://www.instagram.com/zenoway_career/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Zenoway on Instagram"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-3 text-sm font-medium text-text-secondary shadow-xs transition-colors hover:border-brand hover:text-brand"
                >
                  <Instagram size={17} strokeWidth={1.8} />
                  <span>Instagram</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
