"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Plus, MessageCircle, ArrowRight } from "lucide-react";

const ITEMS = [
  {
    q: "Do I need an account to browse jobs?",
    a: "No. You can browse every listing without signing up.",
  },
  {
    q: "How do I apply?",
    a: "Open a listing and use the HR email or career page link on it. You contact the company directly, with no portal in between.",
    link: { href: "/email", label: "Read the email guide" },
  },
  {
    q: "Which roles are listed?",
    a: "UI/UX design, product design, UI and frontend development, and related creative-tech roles.",
  },
  {
    q: "Can I find remote jobs?",
    a: "Yes. Type “Remote” into the location filter on the jobs page to see remote-friendly roles.",
    link: { href: "/jobs", label: "Browse jobs" },
  },
  {
    q: "How do I hear about new jobs?",
    a: "Join the WhatsApp community: pick your field, then your state. There is also an updates channel that covers every category.",
    link: { href: "/join", label: "Join the community" },
  },
  {
    q: "Is Zenoway only for India?",
    a: "Zenoway is built for designers and developers across India.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-12 sm:px-8 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        {/* Introduction */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#0FA968]">
            FAQ
          </p>

          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-[#16251F] sm:text-[28px]">
            Questions,
            <br />
            answered.
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
            Everything you need to know about finding your next creative
            role with Zenoway.
          </p>

          <Link
            href="/contact"
            className="group mt-6 inline-flex cursor-pointer items-center gap-3 rounded-card border border-[#E5EAE6] bg-white p-3 transition-colors hover:border-[#0FA968]/40"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-[#EAF6EF] text-[#087F50]">
              <MessageCircle size={17} strokeWidth={1.8} />
            </span>

            <span className="flex-1">
              <span className="block text-sm font-medium text-[#16251F]">
                Still have questions?
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                We’re happy to help.
              </span>
            </span>

            <ArrowRight
              size={15}
              className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0FA968]"
            />
          </Link>
        </div>

        {/* FAQ accordion */}
        <div className="min-w-0">
          <div className="divide-y divide-[#E8EDE9] border-y border-[#E8EDE9]">
            {ITEMS.map((item, index) => {
              const isOpen = open === index;

              return (
                <div key={item.q}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpen(isOpen ? null : index)
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0FA968]"
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span
                          className="mt-0.5 hidden w-5 shrink-0 text-xs tabular-nums sm:block"
                          style={{
                            color: isOpen ? "#0FA968" : "#A0A8A3",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`text-sm leading-6 ${
                            isOpen
                              ? "font-semibold text-[#16251F]"
                              : "font-medium text-neutral-700"
                          }`}
                        >
                          {item.q}
                        </span>
                      </span>

                      <motion.span
                        aria-hidden="true"
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.2,
                        }}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-control"
                        style={{
                          color: isOpen ? "#087F50" : "#737D76",
                          background: isOpen ? "#EAF6EF" : "#F5F7F5",
                        }}
                      >
                        <Plus size={15} strokeWidth={1.8} />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        initial={
                          reduceMotion
                            ? false
                            : { height: 0, opacity: 0 }
                        }
                        animate={{ height: "auto", opacity: 1 }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { height: 0, opacity: 0 }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.2,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-0 sm:pl-8">
                          <p className="max-w-xl text-sm leading-6 text-neutral-500">
                            {item.a}

                            {item.link && (
                              <>
                                {" "}
                                <Link
                                  href={item.link.href}
                                  className="inline-flex cursor-pointer items-center gap-1 font-medium text-[#087F50] underline decoration-[#0FA968]/40 underline-offset-4 transition-colors hover:text-[#0FA968]"
                                >
                                  {item.link.label}
                                  <span aria-hidden="true">↗</span>
                                </Link>
                              </>
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
