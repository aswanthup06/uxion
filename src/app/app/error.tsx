"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Bug } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center h-screen bg-surface-dark text-text-inverse px-4">
        <div className="text-center">
          <Bug className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-2">500</h1>
          <p className="text-lg text-text-muted mb-6">
            Something went wrong. Please try again.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-inverse px-6 py-3 rounded-control transition font-medium"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-border-default hover:border-border-strong text-text-inverse px-6 py-3 rounded-control transition font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
