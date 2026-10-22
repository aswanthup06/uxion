"use client";

import { useState } from "react";
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
} from "lucide-react";

const JOBS = "/jobs";
const POST_JOB = "/new";
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

type DropdownName = "jobs" | "employers" | "admin" | null;

const menuVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    filter: "blur(3px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.99,
    filter: "blur(2px)",
    transition: {
      duration: 0.14,
      ease: "easeIn" as const,
    },
  },
};

const mobileVariants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1] as const,
      },
      opacity: {
        duration: 0.18,
      },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: {
        duration: 0.22,
        ease: "easeIn" as const,
      },
      opacity: {
        duration: 0.12,
      },
    },
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [dropdown, setDropdown] = useState<DropdownName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === ADMIN_LOGIN;

  const closeMenus = () => {
    setDropdown(null);
    setMobileOpen(false);
  };

  const linkClass = (href: string) =>
    `cursor-pointer text-sm font-medium transition-colors duration-200 ${
      pathname === href
        ? "text-[#0A8F5A]"
        : "text-[#34423B] hover:text-[#0A8F5A]"
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

  // Clean admin login screen: no Navbar.
  if (isAdminLogin) {
    return null;
  }

  return (
    <header
      className="relative z-50 shrink-0 border-b border-[#E8EDE9] bg-white"
      onMouseLeave={() => setDropdown(null)}
    >
      <div className="mx-auto flex h-[68px] items-center px-5 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          aria-label="Zenoway home"
          className="group flex shrink-0 cursor-pointer items-center gap-2.5"
        >
          <motion.span
            whileHover={
              reduceMotion ? undefined : { rotate: 8, scale: 1.06 }
            }
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 18,
            }}
            className="grid h-8 w-8 place-items-center rounded-lg"
          >
            <img src="./logo.png" alt="" />
          </motion.span>

          <span className="text-[21px] font-bold tracking-[-1px] text-[#092C20]">
            zenoway
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="ml-12 hidden h-full items-center gap-8 md:flex">
          {/* Home */}
          {!isAdminRoute && (
            <Link
              href="/"
              onMouseEnter={() => setDropdown(null)}
              onClick={closeMenus}
              className={linkClass("/")}
            >
              Home
            </Link>
          )}

          {/* Community */}
          {!isAdminRoute && (
            <Link
              href="/join"
              onMouseEnter={() => setDropdown(null)}
              onClick={closeMenus}
              className={linkClass("/join")}
            >
              Community
            </Link>
          )}

          {/* Job seekers dropdown */}
          {!isAdminRoute && (
            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-expanded={dropdown === "jobs"}
                aria-haspopup="true"
                onMouseEnter={() => setDropdown("jobs")}
                onClick={() =>
                  setDropdown(dropdown === "jobs" ? null : "jobs")
                }
                className={`flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  dropdown === "jobs"
                    ? "text-[#0A8F5A]"
                    : "text-[#34423B] hover:text-[#0A8F5A]"
                }`}
              >
                For Job Seekers
                <motion.span
                  animate={{ rotate: dropdown === "jobs" ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdown === "jobs" && (
                  <motion.div
                    key="jobs-dropdown"
                    {...motionProps}
                    className="absolute left-0 top-[calc(100%-1px)] w-[290px] origin-top-left rounded-xl border border-[#E6EBE7] bg-white p-2 shadow-[0_16px_40px_rgba(9,44,32,0.12)]"
                  >
                    <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#849188]">
                      Explore IT jobs
                    </p>

                    {categories.map(
                      ({ label, href, icon: Icon }, index) => (
                        <motion.div
                          key={label}
                          initial={
                            reduceMotion ? false : { opacity: 0, x: -5 }
                          }
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.16,
                            delay: reduceMotion ? 0 : index * 0.025,
                          }}
                        >
                          <Link
                            href={href}
                            onClick={closeMenus}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#34423B] transition-colors duration-150 hover:bg-[#F3F8F4] hover:text-[#08794D]"
                          >
                            <Icon
                              size={17}
                              strokeWidth={1.7}
                              className="text-[#738278] transition-colors group-hover:text-[#0A8F5A]"
                            />
                            <span className="flex-1">{label}</span>
                            <ArrowUpRight
                              size={14}
                              className="translate-x-[-3px] text-transparent transition-all duration-150 group-hover:translate-x-0 group-hover:text-[#0A8F5A]"
                            />
                          </Link>
                        </motion.div>
                      )
                    )}

                    <div className="mx-2 my-2 border-t border-[#E8EDE9]" />

                    <Link
                      href="/email"
                      onClick={closeMenus}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#34423B] transition-colors duration-150 hover:bg-[#F3F8F4] hover:text-[#08794D]"
                    >
                      <Mail
                        size={17}
                        strokeWidth={1.7}
                        className="text-[#0A8F5A]"
                      />
                      <span className="flex-1">
                        <span className="block">Email Guide</span>
                        <span className="mt-0.5 block text-xs font-normal text-[#849188]">
                          Write better professional emails
                        </span>
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="text-[#849188] transition-colors group-hover:text-[#0A8F5A]"
                      />
                    </Link>

                    <Link
                      href={JOBS}
                      onClick={closeMenus}
                      className="flex cursor-pointer items-center justify-between rounded-lg bg-[#F0F7F1] px-3 py-3 text-[13px] font-semibold text-[#08794D] transition-colors hover:bg-[#E5F2E7]"
                    >
                      View all IT jobs
                      <ArrowUpRight size={16} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Employers dropdown */}
          {!isAdminRoute && (
            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-expanded={dropdown === "employers"}
                aria-haspopup="true"
                onMouseEnter={() => setDropdown("employers")}
                onClick={() =>
                  setDropdown(
                    dropdown === "employers" ? null : "employers"
                  )
                }
                className={`flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  dropdown === "employers"
                    ? "text-[#0A8F5A]"
                    : "text-[#34423B] hover:text-[#0A8F5A]"
                }`}
              >
                For Employers
                <motion.span
                  animate={{
                    rotate: dropdown === "employers" ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdown === "employers" && (
                  <motion.div
                    key="employers-dropdown"
                    {...motionProps}
                    className="absolute left-0 top-[calc(100%-1px)] w-[240px] origin-top-left rounded-xl border border-[#E6EBE7] bg-white p-2 shadow-[0_16px_40px_rgba(9,44,32,0.12)]"
                  >
                    <Link
                      href={POST_JOB}
                      onClick={closeMenus}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#F3F8F4]"
                    >
                      <BriefcaseBusiness
                        size={18}
                        className="text-[#0A8F5A]"
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-[#24352B]">
                          Post a job
                        </span>
                        <span className="mt-0.5 block text-xs text-[#849188]">
                          Find IT talent
                        </span>
                      </span>
                    </Link>

                    <Link
                      href={MY_JOBS}
                      onClick={closeMenus}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#F3F8F4]"
                    >
                      <BriefcaseBusiness
                        size={18}
                        className="text-[#738278] transition-colors group-hover:text-[#0A8F5A]"
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-[#24352B]">
                          My jobs
                        </span>
                        <span className="mt-0.5 block text-xs text-[#849188]">
                          Manage listings
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Admin dropdown */}
          {isAdminRoute && (
            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-expanded={dropdown === "admin"}
                aria-haspopup="true"
                onMouseEnter={() => setDropdown("admin")}
                onClick={() =>
                  setDropdown(dropdown === "admin" ? null : "admin")
                }
                className={`flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  dropdown === "admin"
                    ? "text-[#0A8F5A]"
                    : "text-[#34423B] hover:text-[#0A8F5A]"
                }`}
              >
                Admin
                <motion.span
                  animate={{ rotate: dropdown === "admin" ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdown === "admin" && (
                  <motion.div
                    key="admin-dropdown"
                    {...motionProps}
                    className="absolute left-0 top-[calc(100%-1px)] w-[235px] origin-top-left rounded-xl border border-[#E6EBE7] bg-white p-2 shadow-[0_16px_40px_rgba(9,44,32,0.12)]"
                  >
                    <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#849188]">
                      Administration
                    </p>

                    <Link
                      href="/admin"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium text-[#34423B] transition-colors hover:bg-[#F3F8F4] hover:text-[#08794D]"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      href="/admin/jobs"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium text-[#34423B] transition-colors hover:bg-[#F3F8F4] hover:text-[#08794D]"
                    >
                      <BriefcaseBusiness size={17} />
                      Manage jobs
                    </Link>

                    <Link
                      href="/admin/jobs/add"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium text-[#34423B] transition-colors hover:bg-[#F3F8F4] hover:text-[#08794D]"
                    >
                      <Settings size={17} />
                      Add a job
                    </Link>

                    <div className="mx-2 my-2 border-t border-[#E8EDE9]" />

                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={handleAdminLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut size={17} />
                      {loggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        <div className="flex-1" />

        {/* Desktop actions */}
        {!isAdminRoute && (
          <div className="hidden items-center gap-5 md:flex">
            <Link
              href={LOGIN}
              className="cursor-pointer text-xs font-medium text-[#34423B] transition-colors hover:text-[#0A8F5A]"
            >
              Log in
            </Link>

            <motion.div
              whileHover={
                reduceMotion ? undefined : { y: -1 }
              }
              whileTap={
                reduceMotion ? undefined : { scale: 0.97 }
              }
            >
              <Link
                href={POST_JOB}
                className="inline-flex text-xs hover:bg-emerald-800 h-10 cursor-pointer items-center justify-center rounded-sm bg-emerald-700 px-4 py-3 font-semibold text-white transition-colors duration-200  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A8F5A] focus-visible:ring-offset-2"
              >
                Post a job
                <ArrowUpRight size={15} className="ml-2" />
              </Link>
            </motion.div>
          </div>
        )}

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen(!mobileOpen);
            setDropdown(null);
          }}
          className="ml-3 grid h-10 w-10 cursor-pointer place-items-center rounded-lg text-[#092C20] transition-colors hover:bg-[#F3F6F3] active:scale-95 md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mobileOpen ? "close" : "menu"}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, rotate: -45, scale: 0.8 }
              }
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.span>
          </AnimatePresence>
        </button>
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
            className="absolute inset-x-0 top-full overflow-hidden border-b border-black/5 bg-white shadow-lg md:hidden"
          >
            <div className="max-h-[calc(100dvh-68px)] overflow-y-auto px-5 pb-6">
              {!isAdminRoute ? (
                <>
                  <Link
                    href="/"
                    onClick={closeMenus}
                    className="block cursor-pointer py-4 text-sm font-medium text-[#24352B] transition-colors hover:text-[#0A8F5A]"
                  >
                    Home
                  </Link>

                  <Link
                    href="/join"
                    onClick={closeMenus}
                    className="block cursor-pointer py-4 text-sm font-medium text-[#24352B] transition-colors hover:text-[#0A8F5A]"
                  >
                    Community
                  </Link>

                  {/* Mobile job seekers */}
                  <button
                    type="button"
                    aria-expanded={dropdown === "jobs"}
                    onClick={() =>
                      setDropdown(dropdown === "jobs" ? null : "jobs")
                    }
                    className="flex w-full cursor-pointer items-center justify-between py-4 text-sm font-medium text-[#24352B]"
                  >
                    For Job Seekers
                    <motion.span
                      animate={{
                        rotate: dropdown === "jobs" ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
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
                        <div className="space-y-1 py-2 pl-3">
                          {categories.map(({ label, href }) => (
                            <Link
                              key={label}
                              href={href}
                              onClick={closeMenus}
                              className="block cursor-pointer rounded-md px-3 py-2.5 text-sm text-[#536158] transition-colors hover:bg-[#F3F8F4] hover:text-[#08794D]"
                            >
                              {label}
                            </Link>
                          ))}

                          <Link
                            href="/email"
                            onClick={closeMenus}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#536158] transition-colors hover:bg-[#F3F8F4] hover:text-[#08794D]"
                          >
                            <Mail
                              size={17}
                              className="text-[#0A8F5A]"
                            />
                            <span>
                              <span className="block font-medium">
                                Email Guide
                              </span>
                              <span className="mt-0.5 block text-xs text-[#849188]">
                                Write better professional emails
                              </span>
                            </span>
                          </Link>

                          <Link
                            href={JOBS}
                            onClick={closeMenus}
                            className="mt-1 block cursor-pointer rounded-md bg-[#F0F7F1] px-3 py-2.5 text-sm font-semibold text-[#08794D] transition-colors hover:bg-[#E5F2E7]"
                          >
                            All IT Jobs
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile employers */}
                  <button
                    type="button"
                    aria-expanded={dropdown === "employers"}
                    onClick={() =>
                      setDropdown(
                        dropdown === "employers" ? null : "employers"
                      )
                    }
                    className="flex w-full cursor-pointer items-center justify-between py-4 text-sm font-medium text-[#24352B]"
                  >
                    For Employers
                    <motion.span
                      animate={{
                        rotate: dropdown === "employers" ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
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
                        <div className="space-y-1 py-2 pl-3">
                          <Link
                            href={POST_JOB}
                            onClick={closeMenus}
                            className="block cursor-pointer rounded-md px-3 py-2.5 text-sm text-[#536158] transition-colors hover:bg-[#F3F8F4]"
                          >
                            Post a job
                          </Link>

                          <Link
                            href={MY_JOBS}
                            onClick={closeMenus}
                            className="block cursor-pointer rounded-md px-3 py-2.5 text-sm text-[#536158] transition-colors hover:bg-[#F3F8F4]"
                          >
                            My jobs
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile public actions */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={LOGIN}
                      onClick={closeMenus}
                      className="flex h-11 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-[#24352B] transition-colors hover:bg-[#F3F8F4] active:scale-[0.98]"
                    >
                      Log in
                    </Link>

                    <Link
                      href={POST_JOB}
                      onClick={closeMenus}
                      className="flex cursor-pointer items-center justify-center rounded-sm bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A8F5A]"
                    >
                      Post a job
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#849188]">
                    Administration
                  </p>

                  <Link
                    href="/admin"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#34423B] hover:bg-[#F3F8F4]"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <Link
                    href="/admin/jobs"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#34423B] hover:bg-[#F3F8F4]"
                  >
                    <BriefcaseBusiness size={18} />
                    Manage jobs
                  </Link>

                  <Link
                    href="/admin/jobs/add"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#34423B] hover:bg-[#F3F8F4]"
                  >
                    <Settings size={18} />
                    Add a job
                  </Link>

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleAdminLogout}
                    className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut size={18} />
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
