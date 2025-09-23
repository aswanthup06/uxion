"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, House, LogOut, Rss } from "lucide-react";

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname(); // ✅ get current path

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    if (password === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      localStorage.setItem("admin_token", password);
      setAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  if (checking) {
    return <div className="p-6">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow-md space-y-4 w-80"
        >
          <h1 className="text-lg font-bold">Admin Login</h1>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="h-[100dvh] hidden md:block bg-gray-800 text-white p-0 md:p-4 space-y-4">
        <nav className="space-y-2">
          <Link
            href="/admin"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname === "/admin" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <House size={20} strokeWidth={1.25} />
          </Link>

          <Link
            href="/admin/jobs"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname === "/admin/jobs" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <BriefcaseBusiness size={20} strokeWidth={1.25} />
          </Link>

          <Link
            href="/admin/jobs/add"
            className={`p-2 rounded h-10 w-10 flex items-center justify-center ${
              pathname === "/admin/jobs/add" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <Rss size={20} strokeWidth={1.25} />
          </Link>
        </nav>

        {/* Logout stays same */}
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            setAuthenticated(false);
          }}
          className="mt-6 w-full bg-red-600 py-2 rounded flex items-center justify-center"
        >
          <LogOut size={20} strokeWidth={1.25} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-0 md:p-6">{children}</main>
    </div>
  );
}
