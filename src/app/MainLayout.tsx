
"use client";

import type { ReactNode, CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: Readonly<MainLayoutProps>) {
  const pathname = usePathname();

 const isAuthPage =
  pathname === "/login" ||
  pathname === "/admin/login";

  // Admin login page: hide the public navbar.
  if (isAuthPage) {
    return (
      <main className="h-dvh overflow-y-auto bg-gray-50">
        {children}
      </main>
    );
  }

  const isSplitPanePage = pathname === "/jobs";

  // All other pages: show the navbar and allow content to scroll.
  return (
    <div
      className="flex h-dvh min-h-0 flex-col overflow-hidden"
      style={{ "--nav-h": "68px" } as CSSProperties}
    >
      <Navbar />

      <main
        className={`min-h-0 min-w-0 flex-1 ${
          isSplitPanePage ? "overflow-y-auto lg:overflow-hidden" : "overflow-y-auto"
        } overscroll-y-contain`}
      >
        {children}
      </main>
    </div>
  );
}
