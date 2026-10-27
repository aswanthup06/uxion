import type { Metadata } from "next";
import JobFormWizard from "@/app/admin/comp/JobFormWizard";
import SiteFooter from "@/app/components/home/SiteFooter";

export const metadata: Metadata = {
  title: "Post an IT Job | Zenoway",
  description:
    "Post tech, software engineering, and IT job openings on Zenoway. Reach top tech talent across India and worldwide.",
};

export default function PostJobPage() {
  return (
    <div className="flex min-h-full flex-col justify-between">
      <JobFormWizard mode="public" />
      <SiteFooter />
    </div>
  );
}
