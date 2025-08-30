// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import JobDetailsClient from "./JobDetailsClient";
import type { Job } from "./JobDetailsClient";

async function getJobs(): Promise<Job[]> {
  try {
    // Use Vercel URL if available, otherwise localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // REMOVED cache: "no-store" to fix the conflict
    const res = await fetch(`${baseUrl}/api/jobs`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.statusText);
      return [];
    }

    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as Job[]) : [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  // AWAIT the params first - this is the key fix
  const { id } = await params;

  const jobs = await getJobs();

  console.log("Available Job IDs:", jobs.map(j => j.id));

  // Case-insensitive matching for better reliability
  const job = jobs.find(j => j.id.toUpperCase() === id.toUpperCase());

  if (!job) {
    console.log("Job not found:", id);
    notFound();
  }

  return <JobDetailsClient job={job} />;
}