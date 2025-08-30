// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import JobDetailsClient from "./JobDetailsClient";
import type { Job } from "./JobDetailsClient";

// Helper function to get the base URL
function getBaseUrl() {
  // In production, use the actual domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://www.uxcurve.in';
  }
  // In development, use localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

async function getJobs(): Promise<Job[]> {
  try {
    const baseUrl = getBaseUrl();
    const apiUrl = `${baseUrl}/api/jobs`;
    
    console.log('Fetching from:', apiUrl);

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
  console.log('Received ID from URL:', id);

  const jobs = await getJobs();
  console.log('Available job IDs:', jobs.map(j => j.id));

  // Case-insensitive exact match
  const job = jobs.find(j => j.id.toUpperCase() === id.toUpperCase());

  if (!job) {
    console.log('Job not found. Available IDs:', jobs.map(j => j.id));
    notFound();
  }

  return <JobDetailsClient job={job} />;
}