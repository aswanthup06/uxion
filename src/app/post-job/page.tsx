import type { Metadata } from "next";
import JobFormWizard from "@/app/admin/comp/JobFormWizard";
import SiteFooter from "@/app/components/home/SiteFooter";

export const metadata: Metadata = {
  title: "Post a Tech Opening | Hire Top Talent on Zenoway",
  description:
    "Post tech, design, and software engineering job openings on Zenoway. Reach top verified talent across India with direct candidate applications.",
  alternates: {
    canonical: "https://www.zenoway.online/post-job",
  },
};

export default function PostJobPage() {
  return (
    <div className="flex min-h-full flex-col justify-between">
      <JobFormWizard mode="public" />
      <SiteFooter />
    </div>
  );
}
