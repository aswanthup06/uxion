import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

export default function JobEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-control bg-brand-soft text-brand">
        <BriefcaseBusiness size={22} strokeWidth={1.5} />
      </div>

      <h3 className="mt-5 text-base font-semibold tracking-tight text-text-primary">
        No jobs posted yet
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">
        Your job listings will appear here once you publish your first opening.
      </p>

      <Link
        href="/admin/jobs/add"
        className="mt-6 inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Add a job
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}