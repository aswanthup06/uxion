"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import SiteFooter from "@/app/components/home/SiteFooter";

const sections = [
  {
    title: "Information We Collect",
    body: "We may collect information such as your name, email address, and portfolio links when you register or apply for jobs. Employers may also provide company details and job postings.",
  },
  {
    title: "How We Use Information",
    body: "We use the collected information to connect job seekers with employers, improve our platform, and send relevant job updates.",
  },
  {
    title: "Third-Party Services",
    body: "We may use third-party services such as Google Analytics and AdSense. These services may use cookies to provide personalized experiences.",
  },
  {
    title: "Your Rights",
    body: "You have the right to request deletion or correction of your data at any time. Please contact us for assistance.",
  },
];

export default function PrivacyPolicyPage() {
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
            className="text-text-muted transition-colors hover:text-brand"
          >
            Home
          </Link>
          <span className="text-border-strong">/</span>
          <span aria-current="page" className="font-medium text-brand">
            Privacy Policy
          </span>
        </nav>

        {/* Header */}
        <header className="mb-12 max-w-2xl border-b border-border-default pb-8 sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            <Lock size={14} strokeWidth={1.8} />
            Legal
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
            At Zenoway, we respect your privacy and are committed to protecting
            your personal information. This Privacy Policy explains how we
            collect, use, and safeguard your data.
          </p>
        </header>

        {/* Policy Sections */}
        <section aria-label="Privacy policy sections">
          <div className="divide-y divide-border-default">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className="flex gap-4 py-6 sm:gap-6 sm:py-7"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-sm font-semibold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-text-primary">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {section.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 border-t border-border-default pt-8 sm:mt-12 sm:pt-10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
              <Mail size={19} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Questions about this policy?
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Contact us if you have questions about your personal
                information or privacy.
              </p>
              <a
                href="mailto:support@zenoway.online"
                className="mt-2 inline-block text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                support@zenoway.online
              </a>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
