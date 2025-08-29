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

// ✅ Use async destructuring
export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params; // Next.js requires await here
  const jobs = await getJobs();
  const job = jobs.find((j) => j.id === id);

  if (!job) notFound();

  return <JobDetailsClient job={job} />;
}
