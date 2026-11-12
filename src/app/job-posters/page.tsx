import type { Metadata } from "next";
import { getAllJobs, getJobById } from "@/lib/supabase/jobs";
import type { Job } from "@/app/types/job";
import { JobPosterCreator } from "@/components/job-posters/JobPosterCreator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Job Poster | Zenoway",
  description:
    "Create and download share-ready job posters from active Zenoway job listings for LinkedIn, Instagram, and WhatsApp.",
};

interface JobPostersPageProps {
  searchParams: Promise<{ jobId?: string | string[] }>;
}

export default async function JobPostersPage({
  searchParams,
}: JobPostersPageProps) {
  const resolvedParams = await searchParams;
  const rawJobId = Array.isArray(resolvedParams.jobId)
    ? resolvedParams.jobId[0]
    : resolvedParams.jobId;
  const requestedJobId = rawJobId?.trim() || "";

  let jobs: Job[] = [];
  let loadError = false;

  try {
    jobs = await getAllJobs({ status: "published" });
  } catch (error) {
    console.error("Failed to load jobs for poster studio:", error);
    loadError = true;
  }

  let initialSelectedJob: Job | null = null;
  let missingRequestedJobId: string | null = null;

  if (requestedJobId) {
    const lowerRequested = requestedJobId.toLowerCase();
    const matchedInList =
      jobs.find((job) => job.id === requestedJobId) ||
      jobs.find((job) => job.id.toLowerCase() === lowerRequested) ||
      null;

    if (matchedInList) {
      initialSelectedJob = matchedInList;
    } else {
      try {
        const directJob = await getJobById(requestedJobId);
        if (directJob) {
          initialSelectedJob = directJob;
          if (!jobs.some((j) => j.id === directJob.id)) {
            jobs = [directJob, ...jobs];
          }
        } else {
          missingRequestedJobId = requestedJobId;
        }
      } catch (error) {
        console.error(`Failed to fetch job ${requestedJobId}:`, error);
        missingRequestedJobId = requestedJobId;
      }
    }
  } else {
    initialSelectedJob = jobs[0] ?? null;
  }

  return (
    <JobPosterCreator
      initialJobs={jobs}
      initialSelectedJob={initialSelectedJob}
      missingRequestedJobId={missingRequestedJobId}
      initialLoadError={loadError}
    />
  );
}

