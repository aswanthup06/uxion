"use client";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function NonAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 ">
        <Navbar />

        <main className="">{children}</main>
      </div>
    </div>
  );
}
