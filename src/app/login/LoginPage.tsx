
"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { X, Compass, Sparkles } from "lucide-react";
import BrandPanel from "./BrandPanel";

type LoginPageProps = {
  mode?: "signin" | "signup";
};

export default function LoginPage({
  mode = "signin",
}: LoginPageProps) {
  const isSignin = mode === "signin";
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden bg-white p-0 sm:p-3 lg:p-5">
      <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden sm:rounded-2xl sm:border sm:border-gray-100 lg:grid-cols-2">
        <BrandPanel />

        <section className="flex h-full min-h-0 min-w-0 items-center justify-center overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10 xl:px-16">
          <div className="my-auto w-full max-w-sm py-2">
            <Link
              href="/"
              className="mb-8 inline-block text-xl font-semibold tracking-tight text-[#164E3B] lg:hidden"
            >
              zenoway
            </Link>

            <div className="mb-8">
              <h1 className="text-center text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                Find your next opportunity
              </h1>

              <p className="mt-3 text-center text-sm leading-6 text-gray-500">
                Discover opportunities that match your skills
                and goals. Explore Zenoway and see what's
                possible for your future.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
            >
              <FcGoogle size={21} />
              Continue with Google
            </button>

            <p className="mt-7 text-center text-sm text-gray-500">
              {isSignin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <Link
                href={isSignin ? "/register" : "/login"}
                className="font-medium text-[#164E3B] underline-offset-4 transition hover:underline"
              >
                {isSignin ? "Create account" : "Sign in"}
              </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-gray-600"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-gray-600"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>

      {/* Explore Portal Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F3ED] text-[#164E3B]">
              <Compass size={32} strokeWidth={1.8} />
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#E8F3ED] px-3 py-1.5 text-xs font-medium text-[#164E3B]">
              <Sparkles size={14} />
              Early access
            </div>

            <h2
              id="explore-modal-title"
              className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl"
            >
              Explore Zenoway, no account needed!
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Great news! You don't need to create an account
              just yet. You can explore our portal and discover
              what Zenoway has to offer.
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              We're working on bringing you more exciting
              features. Stay tuned — there's more to come!
            </p>

            <Link
              href="/"
              onClick={() => setIsModalOpen(false)}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#164E3B] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103C2D] active:scale-[0.99]"
            >
              Explore Zenoway
              <Compass size={17} />
            </Link>

        
          </div>
        </div>
      )}
    </main>
  );
}
