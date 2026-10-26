"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles, Sun } from "lucide-react";

const benefits = [
  "Work that inspires you",
  "People who support you",
  "Space to grow",
];

export default function HappyWork() {
  const reduce = useReducedMotion();

  return (
    <section className="overflow-hidden bg-surface-base px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Animated illustration */}
          <div className="relative mx-auto flex min-h-[300px] w-full max-w-[420px] items-center justify-center sm:min-h-[360px]">
            {/* Decorative orbit */}
            <motion.div
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{
                duration: 32,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-[250px] w-[250px] rounded-full border border-dashed border-border-strong sm:h-[300px] sm:w-[300px]"
            />

            {/* Soft central circle */}
            <div className="absolute h-[205px] w-[205px] rounded-full bg-brand-soft/60 sm:h-[250px] sm:w-[250px]" />

            {/* Main character / happy face */}
            <motion.div
              animate={
                reduce ? undefined : { y: [0, -9, 0], rotate: [0, 2, 0, -2, 0] }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border border-border-default bg-surface-card shadow-card-hover sm:h-44 sm:w-44"
            >
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft sm:h-28 sm:w-28">
                <Image
                  src="/logo.png"
                  alt="Zenoway logo"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
              </div>

              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-1 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-text-inverse shadow-subtle"
              >
                <Heart size={19} fill="currentColor" />
              </motion.div>
            </motion.div>

            {/* Floating happiness notes */}
            <motion.div
              animate={reduce ? undefined : { y: [0, -7, 0] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-[14%] flex items-center gap-2 rounded-card border border-border-default bg-surface-card px-3 py-2.5 shadow-subtle sm:left-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-status-warning-bg text-status-warning">
                <Sun size={17} />
              </span>
              <span className="text-xs font-medium text-text-primary">
                Good energy
              </span>
            </motion.div>

            <motion.div
              animate={reduce ? undefined : { y: [0, 7, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              className="absolute bottom-[15%] right-0 flex items-center gap-2 rounded-card border border-border-default bg-surface-card px-3 py-2.5 shadow-subtle sm:right-1"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-soft text-brand-dark">
                <Sparkles size={17} />
              </span>
              <span className="text-xs font-medium text-text-primary">
                Room to grow
              </span>
            </motion.div>

            {/* Small decorative dots */}
            <motion.span
              animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="absolute right-[16%] top-[18%] h-2.5 w-2.5 rounded-full bg-status-warning"
            />

            <span className="absolute bottom-[22%] left-[14%] h-2 w-2 rounded-full bg-brand-accent" />
          </div>

          {/* Happy work message */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="min-w-0"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              <Heart size={14} />A little more happiness
            </div>

            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
              Love what you do.
              <br />
              <span className="text-brand-accent">Live a little more.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary sm:text-base">
              The right job is about more than a title or salary. It is about
              feeling valued, discovering what you are capable of, and having
              the energy to enjoy life beyond your working hours.
            </p>

            <div className="mt-7 space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={reduce ? false : { opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.1,
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                  </span>

                  <span className="text-sm text-text-secondary">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 border-l-2 border-brand-accent pl-4 text-sm italic leading-6 text-text-muted">
              Your career should add to your life, not take it over.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
