"use client";

import { Job } from "@/app/types/job";

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <div>
      {jobs.map((job) => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
