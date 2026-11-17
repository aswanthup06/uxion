"use client";

import type { ReactNode, CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

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

  const isStudioWorkspace =
    pathname === "/resume-builder" ||
    pathname === "/job-posters";

  const isJobsCatalog = pathname === "/jobs";

  return (
    <AuthProvider>
      {isAuthPage ? (
        <div className="h-dvh overflow-hidden bg-surface-subtle">
          {children}
        </div>
      ) : isStudioWorkspace ? (
        <div
          className="flex h-dvh min-h-0 flex-col overflow-hidden bg-surface-base"
          style={{ "--nav-h": "var(--spacing-nav-height)" } as CSSProperties}
        >
          <Navbar />
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      ) : isJobsCatalog ? (
        <div
          className="flex min-h-screen flex-col bg-surface-base lg:h-dvh lg:overflow-hidden"
          style={{ "--nav-h": "var(--spacing-nav-height)" } as CSSProperties}
        >
          <Navbar />
          <main className="min-w-0 flex-1 lg:min-h-0 lg:overflow-hidden">
            {children}
          </main>
        </div>
      ) : (
        <div
          className="flex min-h-screen flex-col bg-surface-base"
          style={{ "--nav-h": "var(--spacing-nav-height)" } as CSSProperties}
        >
          <Navbar />
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      )}
    </AuthProvider>
  );
}
