"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BriefcaseBusiness, House, LogOut, Rss } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if current path is login page
    setIsLoginPage(pathname === '/admin/login');
  }, [pathname]);

  // Wait for component to mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If it's the login page, render a simple layout without sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Only shown on non-login pages */}
      <aside className="h-[100dvh] hidden md:block bg-gray-800 text-white p-0 md:p-4 space-y-4">
        <nav className="space-y-2">
          <Link
            href="/admin"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname === "/admin" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            title="Dashboard"
          >
            <House size={20} strokeWidth={1.25} />
          </Link>

          <Link
            href="/admin/jobs"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname.startsWith("/admin/jobs") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            title="Jobs"
          >
            <BriefcaseBusiness size={20} strokeWidth={1.25} />
          </Link>

          <Link
            href="/admin/jobs/add"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname === "/admin/jobs/add" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            title="Add Job"
          >
            <Rss size={20} strokeWidth={1.25} />
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 py-2 rounded flex items-center justify-center hover:bg-red-700 transition-colors"
          title="Logout"
        >
          <LogOut size={20} strokeWidth={1.25} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-0 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}