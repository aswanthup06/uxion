// src/app/jobs/[id]/page.js (Server Component)
import { notFound } from 'next/navigation';
import JobDetailsClient from './JobDetailsClient';

async function getJobs() {
  try {
    // Use absolute URL for server component
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/jobs`, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function JobDetailsPage({ params }) {
  const { id } = await params;
  const jobs = await getJobs();
  const job = jobs.find(j => j.id.toString() === id);

  if (!job) {
    notFound();
  }

  return <JobDetailsClient job={job} />;
}