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
      <main className="fixed inset-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-white">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Zenoway" className="h-12 w-auto object-contain" />
          <span className="h-1 w-20 overflow-hidden rounded-full bg-[#E7F0E9]">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-[#087F50]" />
          </span>
          <p className="text-sm text-[#758279]">Verifying your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 flex h-dvh w-full overflow-y-auto bg-white text-[#173D2E]">
      {/* Left editorial panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#F4F8F4] px-10 py-9 lg:flex xl:px-14 xl:py-11">
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
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full border border-[#DCEBDD]" />
        <div className="pointer-events-none absolute -bottom-12 -right-4 h-[290px] w-[290px] rounded-full border border-[#DCEBDD]" />
        <div className="pointer-events-none absolute bottom-14 right-14 h-36 w-36 rounded-full bg-[#E6F3E9]" />

        <Link href="/" className="relative z-10 inline-flex w-fit items-center">
          <img src="/logo.png" alt="Zenoway" className="h-10 w-auto object-contain" />
        </Link>

        <div className="relative z-10 -mt-8 max-w-lg">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#087F50]">
            <span className="h-px w-7 bg-[#087F50]" />
            Zenoway · Admin workspace
          </p>
          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.055em] text-[#173D2E] xl:text-6xl">
            Make room for
            <br />
            <span className="text-[#0FA968]">better work.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-[#68786D]">
            Manage opportunities, keep things moving, and help people find
            work that moves them forward.
          </p>

          <div className="mt-10 flex items-center gap-3 border-t border-[#DCE8DE] pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#087F50] shadow-sm">
              <ShieldCheck size={17} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#284B38]">Private admin access</p>
              <p className="mt-0.5 text-xs text-[#839087]">Only authorized administrators can sign in.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#87968B]">
          © {new Date().getFullYear()} Zenoway. Find your next opportunity.
        </p>
      </aside>

      {/* Login area */}
      <section className="relative flex min-h-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#F4F9F5] blur-3xl lg:hidden" />

        <div className="relative w-full max-w-[390px]">
          <div className="mb-9 lg:hidden">
            <Link href="/" aria-label="Zenoway home" className="inline-flex cursor-pointer items-center">
              <img src="/logo.png" alt="Zenoway" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0FA968]" />
              Admin sign in
            </span>
            <h2 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.045em] text-[#173D2E] sm:text-[36px]">
              Welcome back.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#758279]">
              Sign in to access your Zenoway dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[13px] font-semibold text-[#34483B]"
              >
                Admin password
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockKeyhole
                    className="h-[17px] w-[17px] text-[#9AA89D] transition-colors group-focus-within:text-[#087F50]"
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
                  className="h-[54px] w-full rounded-[9px] border border-[#DDE8DF] bg-white pl-11 pr-12 text-sm text-[#173D2E] outline-none transition placeholder:text-[#A1ADA4] hover:border-[#B7D1BE] focus:border-[#087F50] focus:ring-4 focus:ring-[#087F50]/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center px-4 text-[#9AA89D] transition-colors hover:text-[#087F50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087F50] disabled:cursor-not-allowed"
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
                className="flex gap-3 rounded-[9px] border border-red-200 bg-red-50 px-3.5 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </span>
                <p className="text-[13px] leading-5 text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[9px] bg-[#087F50] px-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#066B43] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087F50]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#87968B]">
              <ShieldCheck className="h-4 w-4 text-[#087F50]" strokeWidth={1.8} />
              Secure access · Authorized administrators only
            </div>
          </form>

          <div className="mt-9 border-t border-[#EDF2EE] pt-5 text-center">
            <p className="text-[11px] text-[#98A39B]">
              Powered by Zenoway · © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
