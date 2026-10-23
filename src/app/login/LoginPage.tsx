"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { ArrowUpRight, Compass, X } from "lucide-react";

type LoginPageProps = {
  mode?: "signin" | "signup";
};

export default function LoginPage({ mode = "signin" }: LoginPageProps) {
  const isSignin = mode === "signin";
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-white text-[#17251E]">
      <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-[1fr_1fr]">
        <aside className="relative hidden min-h-0 overflow-hidden bg-[#F6F8F6] px-10 py-9 text-[#164E3B] lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
          <Link href="/" aria-label="Zenoway home" className="relative z-10 w-fit cursor-pointer">
            <Image
              src="/logo.png"
              alt="Zenoway"
              width={148}
              height={44}
              priority
              className="h-9 w-auto object-contain object-left"
            />
          </Link>

          <div className="relative z-10 max-w-[460px] pb-8">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#087F50]">
              A better way forward
            </p>
            <h2 className="text-4xl font-medium leading-[1.12] tracking-[-0.045em] text-[#1A2C22] xl:text-[52px]">
              Your next move
              <br />
              starts here.
            </h2>
            <p className="mt-5 max-w-[350px] text-[15px] leading-7 text-[#68766D]">
              Discover opportunities that move your career forward.
            </p>
            <div
              aria-hidden="true"
              className="pointer-events-none relative mt-12 h-32 max-w-[330px] overflow-hidden"
            >
              <div className="absolute left-0 top-5 h-20 w-20 rounded-full border border-[#DCE7DE]" />
              <div className="absolute left-8 top-0 h-24 w-24 rounded-full border border-[#DCE7DE]" />
              <div className="absolute left-20 top-9 h-16 w-16 rounded-full border border-[#DCE7DE]" />
              <div className="absolute left-[7.25rem] top-0 h-28 w-28 rounded-full bg-[#EAF2EB]/70" />
              <div className="absolute left-[8.25rem] top-4 h-20 w-20 rounded-full border border-[#D5E3D8]" />
            </div>
          </div>

          <p className="relative z-10 text-[11px] tracking-wide text-[#8A968E]">
            ZENOWAY <span className="mx-2 text-[#C0CBC2]">/</span> CAREER OPPORTUNITIES
          </p>

          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-32 h-[430px] w-[430px] rounded-full border border-[#E1E9E2]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 h-[290px] w-[290px] rounded-full border border-[#E1E9E2]" />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 lg:justify-center lg:px-12 lg:py-10 xl:px-20">
          <header className="mx-auto flex w-full max-w-[390px] items-center justify-between lg:absolute lg:right-10 lg:top-9 lg:mx-0 lg:w-auto xl:right-12 xl:top-10">
            <Link href="/" aria-label="Zenoway home" className="inline-flex w-fit cursor-pointer items-center lg:hidden">
              <Image
                src="/logo.png"
                alt="Zenoway"
                width={132}
                height={40}
                priority
                className="h-8 w-auto max-w-[145px] object-contain object-left"
              />
            </Link>
            <Link
              href="/jobs"
              className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#6F7C73] transition hover:text-[#164E3B]"
            >
              Browse jobs <ArrowUpRight size={14} />
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center py-8 sm:py-10 lg:flex-initial lg:py-12">
            <div className="mb-8 sm:mb-9">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#087F50]">
                Welcome to Zenoway
              </p>
              <h1 className="text-[32px] font-medium leading-[1.12] tracking-[-0.045em] text-[#17251E] sm:text-[38px]">
                {isSignin ? "Good to have you back." : "Start your next chapter."}
              </h1>
              <p className="mt-3 max-w-[340px] text-sm leading-6 text-[#778279]">
                {isSignin
                  ? "Sign in to continue your career journey."
                  : "Continue to explore opportunities made for you."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#DDE3DE] bg-white px-4 py-3 text-sm font-medium text-[#24352B] transition-colors hover:border-[#B9C9BD] hover:bg-[#FAFCFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50] focus-visible:ring-offset-2"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="mt-5 text-left text-sm text-[#778279]">
              {isSignin ? "Looking for opportunities?" : "Ready to explore opportunities?"}{" "}
              <Link
                href="/jobs"
                className="cursor-pointer font-semibold text-[#087F50] underline-offset-4 hover:underline"
              >
                Browse jobs
              </Link>
            </p>

            <p className="mt-8 max-w-[340px] text-left text-[11px] leading-5 text-[#9AA49D]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="cursor-pointer underline underline-offset-2 hover:text-[#5D6D62]">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="cursor-pointer underline underline-offset-2 hover:text-[#5D6D62]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <footer className="mx-auto w-full max-w-[390px] pb-1 text-center text-[10px] text-[#A0AAA3] lg:absolute lg:bottom-5 lg:left-1/2 lg:w-auto lg:-translate-x-1/2 lg:pb-0">
            © {new Date().getFullYear()} Zenoway
          </footer>
        </section>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#102218]/40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[3px] sm:items-center sm:px-5 sm:py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-modal-title"
            className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-[410px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#7A867D] transition hover:bg-[#F2F5F2] hover:text-[#26372C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50]"
            >
              <X size={18} />
            </button>

            <div className="mb-5 mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF5F0] text-[#087F50]">
              <Compass size={22} strokeWidth={1.7} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#087F50]">
              Explore first
            </p>
            <h2 id="explore-modal-title" className="mt-2 pr-5 text-2xl font-medium leading-tight tracking-[-0.035em] text-[#17251E]">
              Take a look around.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#778279]">
              Browse Zenoway and discover opportunities without creating an
              account. We’re continuing to build more ways to support your
              career journey.
            </p>
            <Link
              href="/"
              onClick={() => setIsModalOpen(false)}
              className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#087F50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066B43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F50] focus-visible:ring-offset-2"
            >
              Explore Zenoway <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
