"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, Check, Users } from "lucide-react";

const TALENT = [
  { role: "Product Designer", skill: "Product & UX", initial: "P" },
  { role: "UI/UX Designer", skill: "Design systems", initial: "U" },
  { role: "Frontend Developer", skill: "React & web", initial: "F" },
];

export function HeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex min-h-[360px] w-full max-w-[500px] items-center justify-center sm:min-h-[420px]">
      {/* Dotted texture */}
      <div
        aria-hidden="true"
        className="absolute inset-3 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border-strong) 0.7px, transparent 0.7px)",
          backgroundSize: "17px 17px",
          maskImage:
            "radial-gradient(ellipse at center, black 15%, transparent 75%)",
        }}
      />

      {/* Orbital paths */}
      <motion.svg
        viewBox="0 0 500 420"
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        animate={reduceMotion ? undefined : { rotate: [0, 2, 0] }}
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
          stroke="var(--color-border-default)"
          strokeDasharray="3 7"
        />
        <ellipse
          cx="250"
          cy="210"
          rx="135"
          ry="175"
          stroke="var(--color-border-subtle)"
          transform="rotate(-28 250 210)"
        />
        <path
          d="M70 280 C150 280 155 120 230 145 S350 275 430 95"
          stroke="var(--color-border-strong)"
          strokeDasharray="4 6"
        />
        <circle cx="70" cy="280" r="4" fill="var(--color-brand)" />
        <circle cx="230" cy="145" r="4" fill="var(--color-brand)" />
        <circle cx="430" cy="95" r="4" fill="var(--color-brand)" />
      </motion.svg>

      {/* Main Employer Visual Card */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-[88%] max-w-[370px]"
      >
        <div className="rounded-panel border border-border-default bg-surface-card p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xs font-medium uppercase tracking-[0.12em] text-brand">
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

          {TALENT.map((person, i) => (
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
                <p className="text-xs-compact font-medium text-text-primary">
                  {person.role}
                </p>
                <p className="mt-1 text-2xs text-text-muted">
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
      </motion.div>

      {/* Floating detail badge: Bottom Left */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[7%] left-0 z-20 hidden rounded-card border border-border-default bg-surface-card px-3.5 py-3 shadow-subtle sm:block"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-brand-soft text-brand">
            <Check size={14} />
          </span>
          <div>
            <p className="text-2xs font-medium text-text-primary">
              Post your opening
            </p>
            <p className="mt-0.5 text-3xs text-text-muted">
              Meet the right talent
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating detail badge: Top Right */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-0 top-[8%] z-20 hidden rounded-card border border-border-default bg-surface-card px-3.5 py-2.5 text-2xs text-text-secondary shadow-subtle sm:block"
      >
        <span className="mr-2 text-brand">✳</span>
        Talent · Teams · Growth
      </motion.div>
    </div>
  );
}
