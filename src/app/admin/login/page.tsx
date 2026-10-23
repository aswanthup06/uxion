"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Sparkles,
  CircleCheck,
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
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#087F50] shadow-lg shadow-emerald-950/10">
            <span className="text-lg font-bold text-white">Z</span>
          </div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[#E4ECE6]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#087F50]" />
          </div>
          <p className="text-sm text-[#758279]">Verifying your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-50/70 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[480px] w-[480px] rounded-full bg-emerald-100/50 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(#A8CDB5 0.7px, transparent 0.7px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="group mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#087F50] shadow-xl shadow-emerald-950/10 transition-transform duration-300 hover:-translate-y-1">
            <span className="text-2xl font-bold tracking-tight text-white">
              Z
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#173D2E]">
              Zenoway
            </h1>
            <span className="rounded-md border border-[#E4ECE6] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#758279]">
              Admin
            </span>
          </div>

          <p className="mt-2 text-sm text-[#758279]">
            Your workspace, all in one place.
          </p>
        </div>

        {/* Login card */}
        <section className="overflow-hidden rounded-[14px] border border-[#E4ECE6] bg-white shadow-[0_20px_60px_-30px_rgba(8,127,80,0.18)]">
          {/* Card header */}
          <div className="border-b border-[#EDF2EE] px-7 pb-6 pt-8 sm:px-9 sm:pt-9">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E4ECE6] bg-[#F5F9F6]">
              <LockKeyhole className="h-5 w-5 text-[#34483B]" strokeWidth={1.8} />
            </div>

            <h2 className="text-[26px] font-bold tracking-tight text-[#173D2E]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#758279]">
              Sign in to access your admin dashboard and manage your Zenoway workspace.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-7 py-7 sm:px-9 sm:py-8"
          >
            <div className="mb-5">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[13px] font-semibold text-[#34483B]"
              >
                Admin password
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <LockKeyhole
                    className="h-[18px] w-[18px] text-[#98A39B] transition-colors group-focus-within:text-[#087F50]"
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
                  className="h-[50px] w-full rounded-[10px] border border-[#E4ECE6] bg-[#F8FBF8] pl-11 pr-12 text-sm text-[#173D2E] outline-none transition-all placeholder:text-[#98A39B] hover:border-[#C7D9CC] focus:border-[#087F50] focus:bg-white focus:ring-4 focus:ring-[#087F50]/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3.5 text-[#98A39B] transition-colors hover:text-[#34483B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 disabled:cursor-not-allowed"
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
                className="mb-5 flex gap-3 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-bold text-red-600">!</span>
                </div>

                <p className="text-[13px] leading-5 text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#087F50] px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition-all duration-200 hover:bg-[#066B43] hover:shadow-xl hover:shadow-slate-950/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087F50]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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

            <div className="mt-5 flex items-center justify-center gap-2 text-center">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-[#087F50]"
                strokeWidth={1.8}
              />
              <p className="text-xs text-[#758279]">
                Secure access to your admin workspace
              </p>
            </div>
          </form>

          {/* Card footer */}
          <div className="flex items-center justify-center gap-2 border-t border-[#EDF2EE] bg-[#F8FBF8] px-5 py-4">
            <CircleCheck className="h-3.5 w-3.5 text-[#98A39B]" />
            <p className="text-xs text-[#758279]">
              Authorized administrators only
            </p>
          </div>
        </section>

        {/* Bottom note */}
        <div className="mt-7 flex items-center justify-center gap-1.5 text-xs text-[#98A39B]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by Zenoway</span>
          <span className="mx-1 text-slate-300">·</span>
          <span>Admin Portal</span>
        </div>

        <p className="mt-3 text-center text-[11px] text-[#98A39B]">
          © {new Date().getFullYear()} Zenoway. All rights reserved.
        </p>
      </div>
    </main>
  );
}
