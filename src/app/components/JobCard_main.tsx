import Link from "next/link";

type JobCardProps = {
  id: string;
  role: string;
  company: string;
  location: string;
  exp: string;
};

export function JobCard({ id, role, company, location, exp }: JobCardProps) {
  return (
    <Link
      href={`/home/jobs/${id}`}
      className="group bg-white border border-line rounded-card p-5 flex items-center justify-between hover:border-accent transition-colors"
    >
      <div>
        <p className="text-[10px] font-mono text-muted mb-1">{id}</p>
        <p className="font-display font-semibold">{role}</p>
        <p className="text-sm text-muted mt-0.5">
          {company} · {location}
        </p>
      </div>
      <span className="text-xs font-mono text-accent border border-line rounded-pill px-3 py-1.5 group-hover:border-accent whitespace-nowrap">
        {exp}
      </span>
    </Link>
  );
}