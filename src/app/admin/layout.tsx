import type { Metadata } from "next";
import "../globals.css";
import AdminWrapper from "./AdminWrapper";

export const metadata: Metadata = {
  title: "Admin Panel - zenoway",
  description: "Manage jobs on zenoway",
};

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminWrapper>{children}</AdminWrapper>
      </body>
    </html>
  );
}