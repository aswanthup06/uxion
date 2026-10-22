
"use client";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import BrandPanel from "./BrandPanel";

type LoginPageProps = {
  mode?: "signin" | "signup";
};

export default function LoginPage({
  mode = "signin",
}: LoginPageProps) {
  const isSignin = mode === "signin";

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
              <h1 className="text-3xl text-center font-semibold tracking-tight text-gray-950 sm:text-4xl">
                Find your next opportunity
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 text-center">
                Discover opportunities that match your skills
                and goals. Sign in or create an account to get
                started with Zenoway.
              </p>
            </div>

            <button
              type="button"
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
    </main>
  );
}
