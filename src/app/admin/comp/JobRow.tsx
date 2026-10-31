import Link from "next/link";
import { Job } from "../../types/job";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";

type Props = {
  job: Job;
  onDelete: (id: string) => void;
};

function formatDate(dateString: string) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function JobRow({ job, onDelete }: Props) {
  return (
    <tr className="group transition-colors hover:bg-surface-subtle">
      <td className="px-5 py-4">
        <div className="max-w-xs">
          <p className="font-medium text-text-primary">{job.title}</p>
          <p className="mt-1 text-xs text-text-muted">
            {job.experience || "Experience not specified"}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-text-primary">
          {job.company}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {formatDate(job.postedDate)}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
          {job.location || "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm tabular-nums text-text-secondary">
          {job.views ?? 0}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/jobs/${job.id}`}
            aria-label={`Edit ${job.title}`}
            title="Edit job"
            className="inline-flex h-9 items-center gap-1.5 rounded-control px-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <Pencil size={14} />
            <span>Edit</span>
            <ArrowUpRight size={13} />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(job.id)}
            aria-label={`Delete ${job.title}`}
            title="Delete job"
            className="inline-flex h-9 w-9 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}