// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import JobDetailsClient from "./JobDetailsClient";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  apply: string;
  description: string;
};

async function getJobs(): Promise<Job[]> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/jobs`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as Job[]) : [];
}

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  // ✅ await params is required in Next.js App Router
  const { id } = await params;

  const jobs = await getJobs();

  // ✅ Debug: log all job IDs to ensure your job exists
  console.log("Available Job IDs:", jobs.map(j => j.id));

  const job = jobs.find(j => j.id === id);

  if (!job) {
    console.log("Job not found:", id);
    notFound();
  }

  return <JobDetailsClient job={job} />;
}
