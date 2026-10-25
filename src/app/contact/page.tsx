"use client";

import {
  ArrowUpRight,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/app/components/home/SiteFooter";

const contactOptions = [
  {
    title: "Email",
    description: "Questions, support, or partnership enquiries.",
    detail: "support@zenoway.online",
    href: "mailto:support@zenoway.online",
    icon: Mail,
    external: false,
  },
  {
    title: "Website",
    description: "Explore career opportunities on Zenoway.",
    detail: "www.zenoway.online",
    href: "https://www.zenoway.online",
    icon: Globe,
    external: true,
  },
  {
    title: "Instagram",
    description: "Follow us for career updates and opportunities.",
    detail: "@zenoway_career",
    href: "https://www.instagram.com/zenoway_career/",
    icon: Instagram,
    external: true,
  },
];

export default function ContactPage() {
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

          <span aria-hidden="true" className="text-slate-300">
            /
          </span>

          <span
            aria-current="page"
            className="font-medium text-[#087F50]"
          >
            Contact
          </span>
        </nav>

        {/* Header */}
        <header className="mb-12 max-w-2xl sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#087F50]" />
            Contact Zenoway
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Let&apos;s start a conversation.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Have a question about a job, want to collaborate, or have an idea
            to share? Choose the best way to reach us. We&apos;d love to hear
            from you.
          </p>
        </header>

        {/* Contact Options */}
        <section aria-labelledby="contact-options-heading">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <h2
              id="contact-options-heading"
              className="text-sm font-semibold text-slate-900"
            >
              Get in touch
            </h2>

            <span className="text-xs text-slate-400">
              Contact options
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {contactOptions.map((option) => {
              const Icon = option.icon;

              return (
                <a
                  key={option.title}
                  href={option.href}
                  target={option.external ? "_blank" : undefined}
                  rel={
                    option.external ? "noopener noreferrer" : undefined
                  }
                  className="group flex items-center gap-4 py-6 transition-colors sm:gap-6 sm:py-7"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-text-inverse">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand sm:text-base">
                      {option.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {option.description}
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-brand">
                      {option.detail}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </a>
              );
            })}
          </div>
        </section>

        {/* Community */}
        <section className="mt-12 border-t border-slate-200 pt-8 sm:mt-16 sm:pt-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
                <MessageCircle size={19} strokeWidth={1.7} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Be part of our community
                </h2>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Connect with our community and stay close to new job
                  opportunities and updates.
                </p>
              </div>
            </div>

            <Link
              href="/join"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-control bg-[#087F50] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#066640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50] focus-visible:ring-offset-2"
            >
              Join the community
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </div>

      {/* Shared Site Footer */}
      <SiteFooter />
    </main>
  );
}