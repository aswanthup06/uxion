"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors for observability
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <main className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-surface-base text-text-primary">
      {/* Minimal header */}
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10 sm:py-7">
        <Link
          href="/"
          aria-label="Zenoway home"
          className="group inline-flex cursor-pointer items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand text-sm font-semibold text-text-inverse">
            z
          </span>
          <span className="text-base font-semibold tracking-tight text-text-primary">
            zenoway
          </span>
        </Link>

        <span className="text-2xs font-medium uppercase tracking-[0.16em] text-text-muted">
          System Alert
        </span>
      </header>

      {/* Main content */}
      <section className="relative flex min-h-0 flex-1 items-center px-6 sm:px-10">
        {/* Decorative typography background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-0.05em] top-1/2 -translate-y-1/2 select-none text-[clamp(12rem,36vw,34rem)] font-semibold leading-none tracking-[-0.12em] text-surface-subtle"
        >
          5<span className="text-brand-soft">0</span>0
        </div>

        {/* Text content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-brand" />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand">
              <AlertTriangle size={14} className="text-brand" />
              Temporary Glitch
            </span>
          </div>

          <h1 className="max-w-xl text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.065em] text-text-primary">
            Something went
            <br />
            <span className="text-brand-accent">unexpectedly wrong.</span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary sm:text-base">
            An unexpected error occurred while loading this page. Our team has been notified. You can try refreshing the action or explore active job listings.
          </p>

          {/* Error Digest (if available) */}
          {error?.digest && (
            <p className="mt-2 text-2xs font-mono text-text-muted">
              Reference code: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-5 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <RotateCcw size={15} strokeWidth={2} />
              Try again
            </button>

            <Link
              href="/jobs"
              className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-subtle px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Explore jobs
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </Link>

            <Link
              href="/"
              className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
                className="transition-transform duration-normal group-hover:-translate-x-1"
              />
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom edge */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border-subtle px-6 py-4 sm:px-10">
        <span className="text-3xs tracking-wide text-text-muted">
          Reliable career infrastructure.
        </span>
        <span className="text-3xs font-medium tracking-wide text-brand">
          ZENOWAY
        </span>
      </footer>
    </main>
  );
}
