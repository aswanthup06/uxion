"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  BriefcaseBusiness,
  Users,
} from "lucide-react";

const ROLES = [
  {
    company: "Technologies",
    title: "UI/UX Designer",
    place: "Kochi",
    exp: "1–3 yrs",
    mark: "D",
  },
  {
    company: "Product startup",
    title: "Product Designer",
    place: "Remote",
    exp: "3–5 yrs",
    mark: "P",
  },
  {
    company: "Technology team",
    title: "Frontend Developer",
    place: "Bengaluru",
    exp: "2–4 yrs",
    mark: "F",
  },
];

type Role = (typeof ROLES)[number];
type Audience = "employee" | "employer";

export default function HeroSection({
  jobs = ROLES,
}: {
  jobs?: Role[];
}) {
  const [audience, setAudience] = useState<Audience>("employee");
  const reduceMotion = useReducedMotion();

  const isEmployer = audience === "employer";

  const content = {
    employee: {
      eyebrow: "For people looking for their next move",
      title: "Find work that",
      highlight: "feels right.",
      description:
        "Discover UI/UX, product design and frontend roles from teams that value your work. Connect directly with employers.",
      button: "Explore jobs",
      href: "/jobs",
      secondary: "Find your next opportunity",
    },
    employer: {
      eyebrow: "For teams looking for great people",
      title: "Find people who",
      highlight: "move you forward.",
      description:
        "Connect with designers and developers who can make a difference to your team. Share your opening and find the right fit.",
      button: "Post a job",
      href: "/new",
      secondary: "Meet your next great hire",
    },
  } as const;

  const active = content[audience];

  return (
    <section className="overflow-hidden bg-white text-[#202820]">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-4 sm:px-10 sm:pt-6 lg:px-12">

        <div className="grid items-center gap-8 lg:min-h-[510px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">

          {/* LEFT: SWITCHABLE HERO */}
          <div className="relative z-10 py-5 lg:py-8">

            <motion.div
              key={audience + "-eyebrow"}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-center gap-2.5"
            >
              <span className="h-2 w-2 rounded-pill bg-brand" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                {active.eyebrow}
              </span>
            </motion.div>

            {/* Audience selector */}
            <div
              className="mb-7 inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle p-1"
              role="group"
              aria-label="Choose your audience"
            >
              <button
                type="button"
                onClick={() => setAudience("employee")}
                aria-pressed={!isEmployer}
                className={`flex items-center cursor-pointer gap-2 rounded-control px-3 py-2 text-xs font-medium transition-colors ${
                  !isEmployer
                    ? "bg-surface-card text-brand shadow-subtle ring-1 ring-border-default"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Users size={14} />
                I'm looking for work
              </button>

              <button
                type="button"
                onClick={() => setAudience("employer")}
                aria-pressed={isEmployer}
                className={`flex items-center cursor-pointer gap-2 rounded-control px-3 py-2 text-xs font-medium transition-colors ${
                  isEmployer
                    ? "bg-surface-card text-brand shadow-subtle ring-1 ring-border-default"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <BriefcaseBusiness size={14} />
                I'm hiring
              </button>
            </div>

            {/* Animated title and description */}
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={audience}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 12 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -8 }
                  }
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <h1 className="max-w-[590px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px] text-text-primary">
                    {active.title}
                    <br />
                    <span className="text-brand">
                      {active.highlight}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-text-secondary sm:text-base">
                    {active.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Animated primary CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={audience + "-button"}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 7 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -5 }
                  }
                  transition={{ duration: 0.22 }}
                >
                  <Link
                    href={active.href}
                    className="group inline-flex h-9 items-center gap-3 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    {active.button}
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              <span className="text-xs text-text-muted">
                {active.secondary}
              </span>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border-default pt-5">
              {(isEmployer
                ? ["Reach creative talent", "Direct applications", "Simple hiring"]
                : ["Direct to HR", "Fresh opportunities", "Built for India"]
              ).map((item) => (
                <motion.span
                  key={audience + item}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs text-text-secondary"
                >
                  <Check size={13} className="text-brand" />
                  {item}
                </motion.span>
              ))}
            </div>
          </div>

          {/* RIGHT: LIGHT VISUAL WITH SUBTLE MOTION */}
          <div className="relative mx-auto flex min-h-[360px] w-full max-w-[500px] items-center justify-center sm:min-h-[420px]">

            {/* Dotted texture */}
            <div
              aria-hidden="true"
              className="absolute inset-3 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(#b9c8ba 0.7px, transparent 0.7px)",
                backgroundSize: "17px 17px",
                maskImage:
                  "radial-gradient(ellipse at center, black 15%, transparent 75%)",
              }}
            />

            {/* Orbital paths */}
            <motion.svg
              viewBox="0 0 500 420"
              fill="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              animate={
                reduceMotion ? undefined : { rotate: [0, 2, 0] }
              }
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ellipse
                cx="250"
                cy="210"
                rx="180"
                ry="140"
                stroke="#dce7dc"
                strokeDasharray="3 7"
              />
              <ellipse
                cx="250"
                cy="210"
                rx="135"
                ry="175"
                stroke="#e7ede5"
                transform="rotate(-28 250 210)"
              />
              <path
                d="M70 280 C150 280 155 120 230 145 S350 275 430 95"
                stroke="#b9d1bc"
                strokeDasharray="4 6"
              />
              <circle cx="70" cy="280" r="4" fill="#059669" />
              <circle cx="230" cy="145" r="4" fill="#059669" />
              <circle cx="430" cy="95" r="4" fill="#059669" />
            </motion.svg>

            {/* Visual changes for each audience */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={audience + "-visual"}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, scale: 0.98, y: 8 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.3 }}
                className="relative z-10 w-[88%] max-w-[370px]"
              >
                {isEmployer ? (
                  /* EMPLOYER VISUAL */
                  <div className="rounded-panel border border-border-default bg-surface-card p-5 shadow-card sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
                          Your next hire
                        </p>
                        <h2 className="mt-2 text-xl font-medium tracking-tight text-text-primary">
                          Build your team.
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                        <BriefcaseBusiness size={19} />
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-text-muted">
                      Reach people who care about what they create.
                    </p>

                    <div className="my-5 h-px bg-border-subtle" />

                    {[
                      { role: "Product Designer", skill: "Product & UX", initial: "P" },
                      { role: "UI/UX Designer", skill: "Design systems", initial: "U" },
                      { role: "Frontend Developer", skill: "React & web", initial: "F" },
                    ].map((person, i) => (
                      <motion.div
                        key={person.role}
                        initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: reduceMotion ? 0 : 0.08 * i,
                        }}
                        className="flex items-center gap-3 rounded-control px-2 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-control border border-brand-soft bg-brand-soft text-sm font-semibold text-brand">
                          {person.initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-text-primary">
                            {person.role}
                          </p>
                          <p className="mt-1 text-[11px] text-text-muted">
                            {person.skill}
                          </p>
                        </div>
                        <Check size={15} className="text-brand" />
                      </motion.div>
                    ))}

                    <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-4 text-xs text-text-secondary">
                      <Users size={14} className="text-brand" />
                      Your next great hire starts here.
                    </div>
                  </div>
                ) : (
                  /* EMPLOYEE VISUAL */
                  <div className="rounded-panel border border-border-default bg-surface-card p-5 shadow-card sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
                          Curated opportunities
                        </p>
                        <h2 className="mt-2 text-xl font-medium tracking-tight text-text-primary">
                          Find your next role.
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                        <ArrowUpRight size={19} />
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-text-muted">
                      A better kind of job search.
                    </p>

                    <div className="my-5 h-px bg-border-subtle" />

                    {jobs.slice(0, 3).map((job, index) => (
                      <motion.div
                        key={job.title}
                        initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: reduceMotion ? 0 : 0.08 * index,
                        }}
                        className="group flex items-center gap-3 rounded-control px-2 py-3 transition-colors hover:bg-surface-subtle"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-brand-soft bg-brand-soft text-sm font-semibold text-brand">
                          {job.mark}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-text-primary">
                            {job.title}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-text-muted">
                            {job.company}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-text-secondary">
                            <MapPin size={11} />
                            {job.place}
                            <span className="mx-1 text-border-default">·</span>
                            {job.exp}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="text-text-muted transition-colors group-hover:text-brand"
                        />
                      </motion.div>
                    ))}

                    <Link
                      href="/jobs"
                      className="mt-3 flex items-center justify-between border-t border-border-subtle pt-4 text-xs font-semibold text-brand hover:text-brand-hover"
                    >
                      Browse all roles
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Floating detail */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[7%] left-0 z-20 hidden rounded-control border border-border-default bg-surface-card px-3.5 py-3 shadow-subtle sm:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-brand-soft text-brand">
                  <Check size={14} />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-text-primary">
                    {isEmployer ? "Post your opening" : "Apply directly"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {isEmployer ? "Meet the right talent" : "No middleman"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-[8%] z-20 hidden rounded-control border border-border-default bg-surface-card px-3.5 py-2.5 text-[11px] text-text-secondary shadow-subtle sm:block"
            >
              <span className="mr-2 text-brand">✳</span>
              {isEmployer ? "Talent · Teams · Growth" : "Design · Product · Tech"}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}