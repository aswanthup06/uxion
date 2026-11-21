"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineSquares2X2,
  HiSquares2X2,
  HiOutlineBriefcase,
  HiBriefcase,
  HiPlus,
  HiOutlineUserGroup,
  HiUserGroup,
  HiOutlineUser,
  HiUser,
} from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isHome = pathname === "/";
  const isJobs = pathname.startsWith("/jobs");
  const isPostJob = pathname === "/post-job";
  const isCommunity = pathname === "/join";
  const isProfile = pathname.startsWith("/profile") || pathname === "/login";

  return (
    <div
      aria-label="Mobile Navigation"
      className="fixed inset-x-3 bottom-[max(0.6rem,env(safe-area-inset-bottom,0px))] z-40 mx-auto max-w-md transition-all duration-200 md:hidden"
    >
      <nav className="relative flex h-[62px] items-center justify-around rounded-xl border border-border-default/80 bg-surface-card/90 px-1.5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-surface-card/92 dark:shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
        {/* 1. Home Tab */}
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
            isHome
              ? "text-brand"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {isHome ? (
            <HiSquares2X2 size={22} className="text-brand transition-transform scale-105" />
          ) : (
            <HiOutlineSquares2X2 size={22} className="transition-transform group-hover:scale-105" />
          )}
          <span
            className={`mt-1 text-[10px] tracking-tight leading-none ${
              isHome ? "font-bold text-brand" : "font-medium text-text-muted"
            }`}
          >
            Home
          </span>
        </Link>

        {/* 2. Jobs Tab */}
        <Link
          href="/jobs"
          prefetch={true}
          aria-current={isJobs ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
            isJobs
              ? "text-brand"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {isJobs ? (
            <HiBriefcase size={22} className="text-brand transition-transform scale-105" />
          ) : (
            <HiOutlineBriefcase size={22} className="transition-transform group-hover:scale-105" />
          )}
          <span
            className={`mt-1 text-[10px] tracking-tight leading-none ${
              isJobs ? "font-bold text-brand" : "font-medium text-text-muted"
            }`}
          >
            Jobs
          </span>
        </Link>

        {/* 3. Center Action Button (Post Job) */}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/post-job"
            aria-label="Post a Job"
            aria-current={isPostJob ? "page" : undefined}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-brand text-text-inverse shadow-subtle transition-all duration-200 active:scale-95 hover:bg-brand-hover"
          >
            <HiPlus
              size={20}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </Link>
        </div>

        {/* 4. Community Tab */}
        <Link
          href="/join"
          aria-current={isCommunity ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
            isCommunity
              ? "text-brand"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {isCommunity ? (
            <HiUserGroup size={22} className="text-brand transition-transform scale-105" />
          ) : (
            <HiOutlineUserGroup size={22} className="transition-transform group-hover:scale-105" />
          )}
          <span
            className={`mt-1 text-[10px] tracking-tight leading-none ${
              isCommunity ? "font-bold text-brand" : "font-medium text-text-muted"
            }`}
          >
            Community
          </span>
        </Link>

        {/* 5. Profile Tab */}
        <Link
          href={user ? "/profile" : "/login"}
          aria-current={isProfile ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
            isProfile
              ? "text-brand"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {isProfile ? (
            <HiUser size={22} className="text-brand transition-transform scale-105" />
          ) : (
            <HiOutlineUser size={22} className="transition-transform group-hover:scale-105" />
          )}
          <span
            className={`mt-1 text-[10px] tracking-tight leading-none ${
              isProfile ? "font-bold text-brand" : "font-medium text-text-muted"
            }`}
          >
            {user ? "Profile" : "Sign In"}
          </span>
        </Link>
      </nav>
    </div>
  );
}
