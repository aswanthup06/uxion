"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ArrowUpRight,
  Code2,
  Database,
  Cloud,
  ShieldCheck,
  Bug,
  Mail,
  BriefcaseBusiness,
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  Menu,
  UserRound,
  Users,
  Inbox,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const JOBS = "/jobs";
const POST_JOB = "/post-job";
const MY_JOBS = "/jobs/manage";
const LOGIN = "/login";
const ADMIN_LOGIN = "/admin/login";

const categories = [
  {
    label: "Software Development",
    href: `${JOBS}?category=software`,
    icon: Code2,
  },
  {
    label: "Data & AI",
    href: `${JOBS}?category=data-ai`,
    icon: Database,
  },
  {
    label: "DevOps & Cloud",
    href: `${JOBS}?category=devops`,
    icon: Cloud,
  },
  {
    label: "Cybersecurity",
    href: `${JOBS}?category=security`,
    icon: ShieldCheck,
  },
  {
    label: "QA & Testing",
    href: `${JOBS}?category=qa`,
    icon: Bug,
  },
];

type DropdownName = "jobs" | "employers" | "user" | null;

const menuVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18 },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12 },
  },
};

const mobileVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.24 },
      opacity: { duration: 0.16 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18 },
  },
};

const iconClass = "block shrink-0";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [dropdown, setDropdown] = useState<DropdownName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, profile, signOut } = useAuth();

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === ADMIN_LOGIN;

  const closeMenus = () => {
    setDropdown(null);
    setMobileOpen(false);
  };

  const toggleDropdown = (name: Exclude<DropdownName, null>) => {
    setDropdown((current) => (current === name ? null : name));
  };

  const linkClass = (href: string) =>
    `cursor-pointer text-sm font-medium transition-colors duration-200 ${
      pathname === href ? "text-brand font-semibold" : "text-text-secondary hover:text-brand"
    }`;

  const isAdminActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/admin/jobs") {
      return (
        pathname === "/admin/jobs" ||
        (pathname.startsWith("/admin/jobs/") && !pathname.startsWith("/admin/jobs/add"))
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const adminLinkClass = (href: string) =>
    `cursor-pointer text-sm font-medium transition-colors duration-200 ${
      isAdminActive(href)
        ? "text-brand font-semibold"
        : "text-text-secondary hover:text-brand"
    }`;

  const motionProps = reduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        variants: menuVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
        exit: "exit" as const,
      };

  const handleAdminLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      closeMenus();
      router.replace(ADMIN_LOGIN);
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
      setLoggingOut(false);
    }
  };

  if (isAdminLogin) return null;

  return (
    <header
      className="relative z-50 shrink-0 border-b border-border-default bg-surface-card"
      onMouseLeave={() => setDropdown(null)}
    >
      <div className="mx-auto flex h-[68px] items-center px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href={isAdminRoute ? "/admin" : "/"}
          onClick={closeMenus}
          aria-label={isAdminRoute ? "Zenoway admin home" : "Zenoway home"}
          className="group flex shrink-0 cursor-pointer items-center gap-2.5"
        >
          <motion.span
            whileHover={reduceMotion ? undefined : { rotate: 5, scale: 1.04 }}
            className="relative grid shrink-0 place-items-center"
          >
            <Image
              src="/logo.png"
              alt="zenoway logo"
              width={300}
              height={100}
              priority
              className="block h-6 w-auto object-contain"
            />
          </motion.span>

          <span className="text-[20px] font-bold tracking-[-0.8px] text-text-primary sm:text-[21px]">
            zenoway
          </span>

          {isAdminRoute && (
            <span className="rounded-control bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop navigation */}
        <nav className="ml-6 hidden h-full items-center gap-5 md:flex lg:ml-10 lg:gap-7">
          {!isAdminRoute ? (
            <>
              <Link
                href="/"
                onMouseEnter={() => setDropdown(null)}
                onClick={closeMenus}
                className={linkClass("/")}
              >
                Home
              </Link>

              <Link
                href="/jobs"
                onMouseEnter={() => setDropdown(null)}
                onClick={closeMenus}
                className={linkClass("/jobs")}
              >
                Explore Jobs
              </Link>

              <Link
                href="/join"
                onMouseEnter={() => setDropdown(null)}
                onClick={closeMenus}
                className={linkClass("/join")}
              >
                Community
              </Link>

              {/* Job seekers */}
              <div className="relative flex h-full items-center">
                <button
                  type="button"
                  aria-expanded={dropdown === "jobs"}
                  aria-haspopup="true"
                  onMouseEnter={() => setDropdown("jobs")}
                  onClick={() => toggleDropdown("jobs")}
                  className={`flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
                    dropdown === "jobs"
                      ? "text-brand"
                      : "text-text-secondary hover:text-brand"
                  }`}
                >
                  For Job Seekers
                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={`${iconClass} transition-transform duration-200 ${
                      dropdown === "jobs" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {dropdown === "jobs" && (
                    <motion.div
                      key="jobs-dropdown"
                      {...motionProps}
                      className="absolute left-0 top-[calc(100%-1px)] w-[290px] origin-top-left rounded-card border border-border-default bg-surface-card p-2 shadow-dropdown"
                    >
                      <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[1.4px] text-text-muted">
                        Explore IT jobs
                      </p>

                      {categories.map(({ label, href, icon: Icon }) => (
                        <Link
                          key={label}
                          href={href}
                          onClick={closeMenus}
                          className="group flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-brand"
                        >
                          <Icon
                            size={17}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className={`${iconClass} text-text-muted group-hover:text-brand`}
                          />
                          <span className="flex-1">{label}</span>
                          <ArrowUpRight
                            size={14}
                            aria-hidden="true"
                            className={`${iconClass} text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand`}
                          />
                        </Link>
                      ))}

                      <div className="mx-2 my-2 border-t border-border-default" />

                      <Link
                        href="/email"
                        onClick={closeMenus}
                        className="group flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-[13px] text-text-secondary transition-colors hover:bg-surface-subtle"
                      >
                        <Mail
                          size={17}
                          strokeWidth={1.8}
                          className={`${iconClass} text-brand`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">Email Guide</span>
                          <span className="mt-0.5 block text-xs text-text-muted">
                            Write better professional emails
                          </span>
                        </span>
                        <ArrowUpRight
                          size={14}
                          className={`${iconClass} text-text-muted`}
                        />
                      </Link>

                      <Link
                        href={JOBS}
                        onClick={closeMenus}
                        className="mt-1 flex cursor-pointer items-center justify-between rounded-control bg-brand-soft px-3 py-2.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft-hover"
                      >
                        View all IT jobs
                        <ArrowUpRight size={16} className={iconClass} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Employers */}
              <div className="relative flex h-full items-center">
                <button
                  type="button"
                  aria-expanded={dropdown === "employers"}
                  aria-haspopup="true"
                  onMouseEnter={() => setDropdown("employers")}
                  onClick={() => toggleDropdown("employers")}
                  className={`flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
                    dropdown === "employers"
                      ? "text-brand"
                      : "text-text-secondary hover:text-brand"
                  }`}
                >
                  For Employers
                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={`${iconClass} transition-transform duration-200 ${
                      dropdown === "employers" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {dropdown === "employers" && (
                    <motion.div
                      key="employers-dropdown"
                      {...motionProps}
                      className="absolute left-0 top-[calc(100%-1px)] w-[235px] origin-top-left rounded-card border border-border-default bg-surface-card p-2 shadow-dropdown"
                    >
                      <Link
                        href={POST_JOB}
                        onClick={closeMenus}
                        className="group flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 transition-colors hover:bg-surface-subtle"
                      >
                        <BriefcaseBusiness
                          size={18}
                          className={`${iconClass} text-brand`}
                        />
                        <span>
                          <span className="block text-[13px] font-semibold text-text-primary">
                            Post a job
                          </span>
                          <span className="mt-0.5 block text-xs text-text-muted">
                            Find IT talent
                          </span>
                        </span>
                      </Link>

                      <Link
                        href={MY_JOBS}
                        onClick={closeMenus}
                        className="group flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 transition-colors hover:bg-surface-subtle"
                      >
                        <BriefcaseBusiness
                          size={18}
                          className={`${iconClass} text-text-muted group-hover:text-brand`}
                        />
                        <span>
                          <span className="block text-[13px] font-semibold text-text-primary">
                            My jobs
                          </span>
                          <span className="mt-0.5 block text-xs text-text-muted">
                            Manage listings
                          </span>
                        </span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Admin menu items rendered outside the dropdown */
            <>
              <Link
                href="/admin"
                onClick={closeMenus}
                className={adminLinkClass("/admin")}
              >
                Dashboard
              </Link>

              <Link
                href="/admin/jobs"
                onClick={closeMenus}
                className={adminLinkClass("/admin/jobs")}
              >
                Manage jobs
              </Link>

              <Link
                href="/admin/candidates"
                onClick={closeMenus}
                className={adminLinkClass("/admin/candidates")}
              >
                Candidates
              </Link>

              <Link
                href="/admin/submissions"
                onClick={closeMenus}
                className={adminLinkClass("/admin/submissions")}
              >
                Submissions
              </Link>
            </>
          )}
        </nav>

        <div className="flex-1" />

        {/* Desktop actions */}
        {!isAdminRoute ? (
          <div className="hidden shrink-0 items-center gap-3 md:flex lg:gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("user")}
                  aria-label="User account menu"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full overflow-hidden transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                    <img
                      src={profile?.avatar_url || user.user_metadata?.avatar_url}
                      alt={profile?.full_name || "Candidate"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                      {(profile?.full_name || user.email || "C").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {dropdown === "user" && (
                    <motion.div
                      key="user-dropdown"
                      {...motionProps}
                      className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-card border border-border-default bg-surface-card p-2 shadow-dropdown z-50"
                    >
                      <div className="border-b border-border-default px-3 py-2">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {profile?.full_name || user.user_metadata?.full_name || "Candidate"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-text-muted">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={closeMenus}
                          className="flex cursor-pointer items-center gap-2.5 rounded-control px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-brand"
                        >
                          <UserRound size={15} />
                          My Profile
                        </Link>
                      </div>

                      <div className="border-t border-border-default pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            closeMenus();
                            await signOut();
                          }}
                          className="flex w-full cursor-pointer items-center gap-2.5 rounded-control px-3 py-2 text-left text-xs font-medium text-status-error hover:bg-status-error-bg"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={LOGIN}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control bg-brand px-4 text-xs font-semibold text-text-inverse shadow-subtle transition-colors duration-200 hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <Link
              href="/admin/jobs/add"
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand px-3.5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors duration-200 hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Plus size={14} />
              Add job
            </Link>

            <button
              type="button"
              disabled={loggingOut}
              onClick={handleAdminLogout}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-status-error/30 bg-status-error-bg/20 px-3 text-xs font-semibold text-status-error transition-colors duration-200 hover:bg-status-error-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={14} className={iconClass} />
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        )}

        {/* Mobile menu toggle & quick action */}
        <div className="flex shrink-0 items-center gap-2.5 md:hidden">
          {!isAdminRoute && (
            <Link
              href={JOBS}
              onClick={closeMenus}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control bg-brand-soft px-3 text-xs font-semibold text-brand transition-colors duration-200 hover:bg-brand-soft-hover hover:text-brand-dark"
            >
              Explore Jobs
            </Link>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open);
              setDropdown(null);
            }}
            className="group grid h-10 w-10 shrink-0 cursor-pointer place-items-center bg-transparent text-brand transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            {mobileOpen ? (
              <X
                size={21}
                strokeWidth={1.9}
                className={`${iconClass} transition-transform duration-200 group-hover:rotate-90`}
                aria-hidden="true"
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={`${iconClass} overflow-visible`}
              >
                <path
                  d="M4 8.5H19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="transition-transform duration-200 group-hover:translate-x-[1px]"
                />
                <path
                  d="M9 15.5H19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="transition-transform duration-200 group-hover:-translate-x-[1px]"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-navigation"
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
            variants={mobileVariants}
            className="absolute inset-x-0 top-full overflow-hidden border-b border-border-default bg-surface-card shadow-dropdown md:hidden"
          >
            <div className="max-h-[calc(100dvh-68px)] overflow-y-auto px-5 pb-6">
              {!isAdminRoute ? (
                <>
                  <Link
                    href="/"
                    onClick={closeMenus}
                    className={`block cursor-pointer py-4 text-sm font-medium transition-colors hover:text-brand ${
                      pathname === "/" ? "text-brand" : "text-text-primary"
                    }`}
                  >
                    Home
                  </Link>

                  <Link
                    href="/jobs"
                    onClick={closeMenus}
                    className={`block cursor-pointer py-4 text-sm font-medium transition-colors hover:text-brand ${
                      pathname === "/jobs" ? "text-brand" : "text-text-primary"
                    }`}
                  >
                    Explore Jobs
                  </Link>

                  <Link
                    href="/join"
                    onClick={closeMenus}
                    className={`block cursor-pointer py-4 text-sm font-medium transition-colors hover:text-brand ${
                      pathname === "/join" ? "text-brand" : "text-text-primary"
                    }`}
                  >
                    Community
                  </Link>

                  {/* Mobile job seeker accordion */}
                  <button
                    type="button"
                    aria-expanded={dropdown === "jobs"}
                    onClick={() => toggleDropdown("jobs")}
                    className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-medium text-text-primary"
                  >
                    For Job Seekers
                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      className={`${iconClass} transition-transform duration-200 ${
                        dropdown === "jobs" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {dropdown === "jobs" && (
                      <motion.div
                        key="mobile-jobs"
                        variants={mobileVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 py-2 pl-2">
                          {categories.map(({ label, href, icon: Icon }) => (
                            <Link
                              key={label}
                              href={href}
                              onClick={closeMenus}
                              className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-brand"
                            >
                              <Icon
                                size={17}
                                strokeWidth={1.8}
                                className={`${iconClass} text-brand`}
                                aria-hidden="true"
                              />
                              {label}
                            </Link>
                          ))}

                          <Link
                            href="/email"
                            onClick={closeMenus}
                            className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle"
                          >
                            <Mail
                              size={17}
                              className={`${iconClass} text-brand`}
                            />
                            <span>
                              <span className="block font-medium">
                                Email Guide
                              </span>
                              <span className="mt-0.5 block text-xs text-text-muted">
                                Write better professional emails
                              </span>
                            </span>
                          </Link>

                          <Link
                            href={JOBS}
                            onClick={closeMenus}
                            className="mt-1 flex cursor-pointer items-center justify-between rounded-control bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft-hover"
                          >
                            All IT Jobs
                            <ArrowUpRight size={16} className={iconClass} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile employers accordion */}
                  <button
                    type="button"
                    aria-expanded={dropdown === "employers"}
                    onClick={() => toggleDropdown("employers")}
                    className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-medium text-text-primary"
                  >
                    For Employers
                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      className={`${iconClass} transition-transform duration-200 ${
                        dropdown === "employers" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {dropdown === "employers" && (
                      <motion.div
                        key="mobile-employers"
                        variants={mobileVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 py-2 pl-2">
                          <Link
                            href={POST_JOB}
                            onClick={closeMenus}
                            className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle"
                          >
                            <BriefcaseBusiness
                              size={17}
                              className={`${iconClass} text-brand`}
                            />
                            Post a job
                          </Link>

                          <Link
                            href={MY_JOBS}
                            onClick={closeMenus}
                            className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle"
                          >
                            <BriefcaseBusiness
                              size={17}
                              className={`${iconClass} text-text-muted`}
                            />
                            My jobs
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile actions */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-default pt-5">
                    {user ? (
                      <Link
                        href="/profile"
                        onClick={closeMenus}
                        className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-3 text-sm font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand-soft"
                      >
                        <UserRound size={16} />
                        My Profile
                      </Link>
                    ) : (
                      <Link
                        href={LOGIN}
                        onClick={closeMenus}
                        className="flex h-11 cursor-pointer items-center justify-center rounded-control bg-brand px-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
                      >
                        Sign in
                      </Link>
                    )}

                    <Link
                      href={POST_JOB}
                      onClick={closeMenus}
                      className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
                    >
                      Post a job
                      <ArrowUpRight size={15} className={iconClass} />
                    </Link>
                  </div>

                  {user && (
                    <button
                      type="button"
                      onClick={async () => {
                        closeMenus();
                        await signOut();
                      }}
                      className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-status-error/20 bg-status-error-bg/30 text-xs font-semibold text-status-error"
                    >
                      <LogOut size={14} />
                      Sign out ({user.email})
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[1.4px] text-text-muted">
                    Administration
                  </p>

                  <Link
                    href="/admin"
                    onClick={closeMenus}
                    className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
                  >
                    <LayoutDashboard size={18} className={iconClass} />
                    Dashboard
                  </Link>

                  <Link
                    href="/admin/jobs"
                    onClick={closeMenus}
                    className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
                  >
                    <BriefcaseBusiness size={18} className={iconClass} />
                    Manage jobs
                  </Link>

                  <Link
                    href="/admin/candidates"
                    onClick={closeMenus}
                    className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
                  >
                    <Users size={18} className={iconClass} />
                    Candidates
                  </Link>

                  <Link
                    href="/admin/submissions"
                    onClick={closeMenus}
                    className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
                  >
                    <Inbox size={18} className={iconClass} />
                    Submissions
                  </Link>

                  <div className="my-3 border-t border-border-default pt-2">
                    <Link
                      href="/admin/jobs/add"
                      onClick={closeMenus}
                      className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover shadow-subtle"
                    >
                      <Plus size={16} />
                      Add job
                    </Link>
                  </div>

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleAdminLogout}
                    className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-3 text-left text-sm font-medium text-status-error hover:bg-status-error-bg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={18} className={iconClass} />
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
