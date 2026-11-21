"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

export type Stat = { label: string } & (
  | { value: number; suffix?: string }
  | { text: string }
);

function CountUp({
  to,
  suffix = "",
}: {
  to: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-40px",
  });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? to : 0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const controls = animate(count, to, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [inView, to, reduceMotion, count]);

  return (
    <motion.span ref={ref} className="inline-block tabular-nums">
      {rounded}
    </motion.span>
  );
}

export default function StatsBand({
  stats,
}: {
  stats: Stat[];
}) {
  return (
    <section className="px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-border-default bg-surface-card px-4 py-5 sm:px-5 sm:py-6"
            >
              <dd className="text-2xl font-semibold leading-tight tracking-tight text-brand sm:text-3xl">
                {"text" in stat ? (
                  stat.text
                ) : (
                  <CountUp
                    to={stat.value}
                    suffix={stat.suffix}
                  />
                )}
              </dd>

              <dt className="mt-2 text-xs leading-5 text-text-muted sm:text-sm">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
