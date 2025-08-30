// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import JobDetailsClient from "./JobDetailsClient";
import type { Job } from "./JobDetailsClient";

async function getJobs(): Promise<Job[]> {
  try {
    // Use your live site URL since the API is working there
    const apiUrl = 'https://www.uxcurve.in/api/jobs';
    
    const res = await fetch(apiUrl, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  console.log('Looking for job ID:', id);

  const jobs = await getJobs();
  console.log('Total jobs found:', jobs.length);

  // Find the job with matching ID
  const job = jobs.find(j => j.id === id);

  if (!job) {
    console.log('Job not found. Available IDs:', jobs.map(j => j.id));
    notFound();
  }

  return <JobDetailsClient job={job} />;
}