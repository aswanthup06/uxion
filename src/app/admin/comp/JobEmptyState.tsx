import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/app/components/Button";

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

      <Button
        href="/admin/jobs/add"
        variant="primary"
        size="md"
        className="mt-6"
        rightIcon={<ArrowUpRight size={16} />}
      >
        Add a job
      </Button>
    </div>
  );
}
