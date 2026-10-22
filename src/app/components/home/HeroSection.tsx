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
    company: "Daiviksoft Technologies",
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
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#657267]">
                {active.eyebrow}
              </span>
            </motion.div>

            {/* Audience selector */}
            <div
              className="mb-7 inline-flex items-center gap-1 rounded-lg border border-[#e8ece7] bg-[#f8faf7] p-1"
              role="group"
              aria-label="Choose your audience"
            >
              <button
                type="button"
                onClick={() => setAudience("employee")}
                aria-pressed={!isEmployer}
                className={`flex items-center cursor-pointer gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  !isEmployer
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-black/[0.04]"
                    : "text-[#777f75] hover:text-[#202820]"
                }`}
              >
                <Users size={14} />
                I'm looking for work
              </button>

              <button
                type="button"
                onClick={() => setAudience("employer")}
                aria-pressed={isEmployer}
                className={`flex items-center cursor-pointer gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isEmployer
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-black/[0.04]"
                    : "text-[#777f75] hover:text-[#202820]"
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
                  <h1 className="max-w-[590px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
                    {active.title}
                    <br />
                    <span className="text-emerald-700">
                      {active.highlight}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-[#737971] sm:text-base">
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
                    className="group inline-flex h-11 items-center gap-3 rounded-md bg-emerald-700 px-5 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                  >
                    {active.button}
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              <span className="text-xs text-[#858b82]">
                {active.secondary}
              </span>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#ebeee9] pt-5">
              {(isEmployer
                ? ["Reach creative talent", "Direct applications", "Simple hiring"]
                : ["Direct to HR", "Fresh opportunities", "Built for India"]
              ).map((item) => (
                <motion.span
                  key={audience + item}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs text-[#7b8179]"
                >
                  <Check size={13} className="text-emerald-700" />
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
                  <div className="rounded-xl border border-[#e8ece6] bg-white p-5 shadow-[0_16px_50px_-30px_rgba(25,60,35,0.2)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
                          Your next hire
                        </p>
                        <h2 className="mt-2 text-xl font-medium tracking-tight">
                          Build your team.
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <BriefcaseBusiness size={19} />
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-[#858b82]">
                      Reach people who care about what they create.
                    </p>

                    <div className="my-5 h-px bg-[#edf0eb]" />

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
                        className="flex items-center gap-3 rounded-lg px-2 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-800">
                          {person.initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium">
                            {person.role}
                          </p>
                          <p className="mt-1 text-[11px] text-[#858b82]">
                            {person.skill}
                          </p>
                        </div>
                        <Check size={15} className="text-emerald-700" />
                      </motion.div>
                    ))}

                    <div className="mt-3 flex items-center gap-2 border-t border-[#edf0eb] pt-4 text-xs text-[#737971]">
                      <Users size={14} className="text-emerald-700" />
                      Your next great hire starts here.
                    </div>
                  </div>
                ) : (
                  /* EMPLOYEE VISUAL */
                  <div className="rounded-xl border border-[#e8ece6] bg-white p-5 shadow-[0_16px_50px_-30px_rgba(25,60,35,0.2)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
                          Curated opportunities
                        </p>
                        <h2 className="mt-2 text-xl font-medium tracking-tight">
                          Find your next role.
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <ArrowUpRight size={19} />
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-[#8a9087]">
                      A better kind of job search.
                    </p>

                    <div className="my-5 h-px bg-[#edf0eb]" />

                    {jobs.slice(0, 3).map((job, index) => (
                      <motion.div
                        key={job.title}
                        initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: reduceMotion ? 0 : 0.08 * index,
                        }}
                        className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#f6f8f4]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-800">
                          {job.mark}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">
                            {job.title}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-[#8a9087]">
                            {job.company}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#777f75]">
                            <MapPin size={11} />
                            {job.place}
                            <span className="mx-1 text-[#c4c9c0]">·</span>
                            {job.exp}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="text-[#a4aca1] transition-colors group-hover:text-emerald-700"
                        />
                      </motion.div>
                    ))}

                    <Link
                      href="/jobs"
                      className="mt-3 flex items-center justify-between border-t border-[#edf0eb] pt-4 text-xs font-medium text-emerald-800"
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
              className="absolute bottom-[7%] left-0 z-20 hidden rounded-lg border border-[#e8ece6] bg-white px-3.5 py-3 shadow-sm sm:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Check size={14} />
                </span>
                <div>
                  <p className="text-[11px] font-medium">
                    {isEmployer ? "Post your opening" : "Apply directly"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8a9087]">
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
              className="absolute right-0 top-[8%] z-20 hidden rounded-lg border border-[#e8ece6] bg-white px-3.5 py-2.5 text-[11px] text-[#566454] shadow-sm sm:block"
            >
              <span className="mr-2 text-emerald-600">✳</span>
              {isEmployer ? "Talent · Teams · Growth" : "Design · Product · Tech"}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}