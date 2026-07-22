import type { Metadata } from "next";
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
  return <AdminWrapper>{children}</AdminWrapper>;
}