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
      <body className="flex flex-col items-center justify-center h-screen bg-[#0F172A] text-white px-4">
        <div className="text-center">
          <Bug className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-2">500</h1>
          <p className="text-lg text-gray-400 mb-6">
            Something went wrong. Please try again.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] px-6 py-3 rounded-lg transition"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 border border-gray-500 hover:border-white px-6 py-3 rounded-lg transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
