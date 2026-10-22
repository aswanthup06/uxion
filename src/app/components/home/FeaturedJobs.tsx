"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { JobCard } from "../JobCard_main";
import { C, EASE, HARD, type FeaturedJob } from "./tokens";
import { H2, Label, Mark, Reveal } from "./ui";

const FILTERS: { id: string; label: string; test: (j: FeaturedJob) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "design", label: "Design", test: (j) => /design|ux|ui/i.test(j.role) },
  { id: "frontend", label: "Frontend", test: (j) => /front|react|next|developer|engineer/i.test(j.role) },
  { id: "remote", label: "Remote", test: (j) => /remote/i.test(j.location) },
];

export default function FeaturedJobs({ jobs }: { jobs: FeaturedJob[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("all");

  const filters = useMemo(
    () =>
      FILTERS.map((f) => ({ ...f, count: jobs.filter(f.test).length })).filter(
        (f) => f.id === "all" || f.count > 0,
      ),
    [jobs],
  );

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === active) ?? FILTERS[0];
    return jobs.filter(f.test);
  }, [jobs, active]);

  return (
    <section className="px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label>Fresh listings</Label>
            <H2 className="mt-4">
              Open <Mark>right now</Mark>
            </H2>
          </div>

          <div role="tablist" aria-label="Filter jobs" className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const on = f.id === active;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(f.id)}
                  className="relative rounded-full px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2"
                  style={{
                    color: on ? C.lime : `${C.ink}B3`,
                    ["--tw-ring-color" as string]: C.accent,
                  }}
                >
                  {on ? (
                    <motion.span
                      layoutId="featured-filter"
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ background: C.ink }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full border bg-white"
                      style={{ borderColor: "rgba(6,35,26,0.12)" }}
                    />
                  )}
                  <span className="relative">
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <JobCard {...job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <Reveal className="mt-10 flex justify-center">
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-3 rounded-full border-2 bg-white px-7 py-3.5 text-[15px] font-semibold outline-none transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ borderColor: C.ink, color: C.ink, boxShadow: HARD(4), ["--tw-ring-color" as string]: C.accent }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = HARD(1))}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = HARD(4))}
          >
            View all jobs
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
