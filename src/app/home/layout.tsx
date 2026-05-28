"use client";

import Sidebar from "../components/Sidebar";

export default function NonAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex max-h-dvh min-h-dvh">
      <Sidebar />

      <div className="bg-gray-100 flex-1 md:rounded-l-4xl">
        {children}
      </div>
    </div>
  );
}