"use client";

import Sidebar from "../components/Sidebar";

export default function NonAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh overflow-hidden bg-gray-100">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}