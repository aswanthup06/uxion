"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/auth/verify", {
          cache: "no-store",
        });

        if (response.ok && active) {
          router.replace("/admin");
          return;
        }
      } catch {
        // Keep the login page available if verification fails.
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    checkAuthStatus();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError("Incorrect password. Please check your credentials and try again.");
      }
    } catch {
      setError("Unable to sign in right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="fixed inset-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Zenoway" className="h-12 w-auto object-contain" />
          <span className="h-1 w-20 overflow-hidden rounded-pill bg-brand-soft">
            <span className="block h-full w-1/2 animate-pulse rounded-pill bg-brand" />
          </span>
          <p className="text-sm text-text-muted">Verifying your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 flex h-dvh w-full overflow-y-auto bg-surface-base text-text-primary">
      {/* Left editorial panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-surface-subtle px-10 py-9 lg:flex xl:px-14 xl:py-11">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(#B9D9C2 0.8px, transparent 0.8px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom right, black, transparent 72%)",
          }}
        />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full border border-border-default" />
        <div className="pointer-events-none absolute -bottom-12 -right-4 h-[290px] w-[290px] rounded-full border border-border-default" />
        <div className="pointer-events-none absolute bottom-14 right-14 h-36 w-36 rounded-full bg-brand-soft" />

        <Link href="/" className="relative z-10 inline-flex w-fit items-center">
          <img src="/logo.png" alt="Zenoway" className="h-10 w-auto object-contain" />
        </Link>

        <div className="relative z-10 -mt-8 max-w-lg">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            <span className="h-px w-7 bg-brand" />
            Zenoway · Admin workspace
          </p>
          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.055em] text-text-primary xl:text-6xl">
            Make room for
            <br />
            <span className="text-brand-accent">better work.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-text-secondary">
            Manage opportunities, keep things moving, and help people find
            work that moves them forward.
          </p>

          <div className="mt-10 flex items-center gap-3 border-t border-border-default pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface-card text-brand shadow-subtle">
              <ShieldCheck size={17} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Private admin access</p>
              <p className="mt-0.5 text-xs text-text-muted">Only authorized administrators can sign in.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-text-muted">
          © {new Date().getFullYear()} Zenoway. Find your next opportunity.
        </p>
      </aside>

      {/* Login area */}
      <section className="relative flex min-h-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-surface-subtle blur-3xl lg:hidden" />

        <div className="relative w-full max-w-[390px]">
          <div className="mb-9 lg:hidden">
            <Link href="/" aria-label="Zenoway home" className="inline-flex cursor-pointer items-center">
              <img src="/logo.png" alt="Zenoway" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Admin sign in
            </span>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.045em] text-text-primary sm:text-[36px]">
              Welcome back.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
              Sign in to access your Zenoway dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[13px] font-semibold text-text-secondary"
              >
                Admin password
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockKeyhole
                    className="h-[17px] w-[17px] text-text-muted transition-colors group-focus-within:text-brand"
                    strokeWidth={1.8}
                  />
                </div>

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="h-[52px] w-full rounded-control border border-border-default bg-surface-card pl-11 pr-12 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center px-4 text-text-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex gap-3 rounded-control border border-status-error-border bg-status-error-bg px-3.5 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-status-error">
                  !
                </span>
                <p className="text-[13px] leading-5 text-status-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group flex h-[50px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-control bg-brand px-4 text-sm font-semibold text-text-inverse transition duration-normal hover:bg-brand-hover shadow-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-normal group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-text-muted">
              <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={1.8} />
              Secure access · Authorized administrators only
            </div>
          </form>

          <div className="mt-9 border-t border-border-subtle pt-5 text-center">
            <p className="text-[11px] text-text-muted">
              Powered by Zenoway · © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
