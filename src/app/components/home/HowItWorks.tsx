"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Check, Search } from "lucide-react";

const STEPS = [
  {
    title: "Find a role",
    description:
      "Explore design and frontend jobs by role, location, or tech stack.",
  },
  {
    title: "Read the details",
    description:
      "Check the requirements, work mode, and how to contact the employer.",
  },
  {
    title: "Apply directly",
    description:
      "Reach out through the listed HR email or company careers page.",
  },
];

const JOBS = [
  ["Product Designer", "Remote · Full-time"],
  ["UI/UX Designer", "Kochi · Hybrid"],
  ["Frontend Developer", "Bengaluru · Full-time"],
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2 });

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % STEPS.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [active, inView, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="px-5 py-12 sm:px-8 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-9 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-14">
          {/* Left: Introduction and steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent">
              How it works
            </p>

            <h2 className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-[28px]">
              Your next role,
              <br />
              without the extra steps.
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
              Discover opportunities and connect with employers directly.
              No application portal in between.
            </p>

            <div className="mt-7">
              {STEPS.map((step, index) => {
                const selected = active === index;

                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-pressed={selected}
                    className="group flex w-full cursor-pointer gap-3 border-t border-border-default py-4 text-left last:border-b outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                  >
                    <span
                      className={`mt-0.5 w-6 shrink-0 text-xs tabular-nums font-medium ${
                        selected ? "text-brand-accent" : "text-text-muted"
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-semibold transition-colors ${
                          selected ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {step.title}
                      </span>

                      <AnimatePresence initial={false}>
                        {selected && (
                          <motion.span
                            initial={
                              reduceMotion
                                ? false
                                : { opacity: 0, height: 0 }
                            }
                            animate={{ opacity: 1, height: "auto" }}
                            exit={
                              reduceMotion
                                ? undefined
                                : { opacity: 0, height: 0 }
                            }
                            transition={{ duration: 0.2 }}
                            className="block overflow-hidden"
                          >
                            <span className="block max-w-xs pt-1.5 text-sm leading-5 text-text-secondary">
                              {step.description}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    <ArrowRight
                      size={15}
                      className={`mt-0.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                        selected ? "text-brand-accent" : "text-text-muted"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <Link
              href="/jobs"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-accent transition-colors hover:text-brand"
            >
              Browse all jobs
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Right: Animated job preview */}
          <div className="flex min-w-0 items-center">
            <div className="relative w-full overflow-hidden rounded-panel border border-border-default bg-surface-subtle p-4 sm:p-6">
              {/* Preview header */}
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <span className="text-xs font-semibold text-text-primary">
                  {["Job search", "Role details", "Application"][active]}
                </span>

                <span className="text-xs text-text-muted">
                  Step 0{active + 1} of 03
                </span>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 5 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion ? undefined : { opacity: 0, y: -5 }
                  }
                  transition={{ duration: 0.2 }}
                  className="pt-5"
                >
                  {/* Step 1: Search jobs */}
                  {active === 0 && (
                    <div>
                      <div className="flex items-center gap-2 rounded-control border border-border-default bg-surface-card px-3 py-2.5">
                        <Search
                          size={15}
                          className="shrink-0 text-text-muted"
                        />

                        <span className="text-sm text-text-primary">
                          UI/UX Designer
                        </span>

                        <span className="ml-auto text-xs text-text-muted">
                          India
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {JOBS.map(([title, meta], index) => (
                          <div
                            key={title}
                            className="flex items-center gap-3 rounded-card border border-border-default bg-surface-card p-3 shadow-subtle"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-brand-soft text-xs font-semibold text-brand">
                              {title[0]}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-text-primary">
                                {title}
                              </span>

                              <span className="mt-1 block text-xs text-text-secondary">
                                {meta}
                              </span>
                            </span>

                            {index === 0 && (
                              <span className="text-xs font-semibold text-brand-accent">
                                New
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Read role details */}
                  {active === 1 && (
                    <div className="rounded-card border border-border-default bg-surface-card p-4 sm:p-5 shadow-subtle">
                      <span className="text-xs font-semibold text-brand-accent">
                        DESIGN · FULL-TIME
                      </span>

                      <h3 className="mt-3 text-base font-semibold tracking-tight text-text-primary">
                        Product Designer
                      </h3>

                      <p className="mt-1 text-sm text-text-secondary">
                        Company name · Remote, India
                      </p>

                      <div className="my-5 border-t border-border-subtle" />

                      <p className="text-sm font-medium text-text-primary">
                        About the role
                      </p>

                      <div className="mt-3 space-y-2">
                        {[100, 92, 72, 84].map((width, index) => (
                          <motion.div
                            key={index}
                            className="h-1.5 rounded-pill bg-surface-muted"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{
                              delay: index * 0.06,
                              duration: 0.3,
                            }}
                          />
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-border-subtle pt-4 text-sm text-text-secondary">
                        <Check
                          size={15}
                          className="shrink-0 text-brand-accent"
                        />
                        Direct employer contact available
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact the employer */}
                  {active === 2 && (
                    <div className="rounded-card border border-border-default bg-surface-card p-4 sm:p-5 shadow-subtle">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-sm font-semibold text-brand">
                          A
                        </span>

                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            Your application
                          </p>

                          <p className="mt-0.5 text-xs text-text-muted">
                            Email to the hiring team
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm">
                        <p className="break-words border-b border-border-subtle pb-3 text-text-muted">
                          To:{" "}
                          <span className="text-text-primary">
                            hr@company.com
                          </span>
                        </p>

                        <p className="border-b border-border-subtle pb-3 text-text-muted">
                          Subject:{" "}
                          <span className="text-text-primary">
                            Product Designer application
                          </span>
                        </p>

                        <p className="min-h-20 leading-6 text-text-secondary">
                          Hello, I’m interested in the Product Designer role.
                          Please find my portfolio and resume attached.
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-4 text-sm font-medium text-brand">
                        <Check size={15} className="shrink-0" />
                        Ready to contact the employer
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Step indicators */}
              <div className="mt-5 flex gap-1.5">
                {STEPS.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    aria-label={`Show step ${index + 1}`}
                    aria-pressed={active === index}
                    onClick={() => setActive(index)}
                    className={`h-1 flex-1 cursor-pointer rounded-pill transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                      active === index ? "bg-brand-accent" : "bg-border-default"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
