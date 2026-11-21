"use client";

import { useEffect } from "react";
import Link from "next/link";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application crash:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#0d0e12",
          color: "#f3f4f6",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            width: "100%",
            textAlign: "left",
            backgroundColor: "#16181f",
            borderRadius: "0.75rem",
            padding: "2rem",
            border: "1px solid #272a38",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#38bdf8",
              marginBottom: "1rem",
            }}
          >
            <span>●</span> Zenoway System Alert
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              lineHeight: 1.25,
              color: "#ffffff",
              margin: "0 0 0.75rem 0",
            }}
          >
            Critical system exception
          </h1>

          <p
            style={{
              fontSize: "0.925rem",
              lineHeight: 1.6,
              color: "#9ca3af",
              margin: "0 0 1.5rem 0",
            }}
          >
            A core framework exception interrupted this page. You can reload the application or return to the main dashboard.
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                fontFamily: "monospace",
                color: "#6b7280",
                margin: "0 0 1.5rem 0",
              }}
            >
              Digest: {error.digest}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reload application
            </button>

            <Link
              href="/"
              style={{
                backgroundColor: "transparent",
                color: "#d1d5db",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
