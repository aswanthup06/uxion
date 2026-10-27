import type { Metadata } from "next";
import JobFormWizard from "@/app/admin/comp/JobFormWizard";
import SiteFooter from "@/app/components/home/SiteFooter";

export const metadata: Metadata = {
  title: "Post a UX/Design Job | Zenoway",
  description:
    "Post a UI/UX, Product Design, or Creative role on Zenoway. Reach over 10,000+ verified designers across India and worldwide.",
};

export default function PostJobPage() {
  return (
    <div className="flex min-h-full flex-col justify-between">
      <JobFormWizard mode="public" />
      <SiteFooter />
    </div>
  );
}
