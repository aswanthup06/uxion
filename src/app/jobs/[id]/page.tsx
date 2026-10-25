// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JobDetailsClient from "./JobDetailsClient";
import { getJobById } from "@/lib/supabase/jobs";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return {
      title: "Job Not Found | Zenoway",
      description: "The requested career opportunity could not be found.",
    };
  }

  const excerpt = job.description
    ? job.description.replace(/[#*`_]/g, "").slice(0, 155).trim() + "..."
    : `Apply for ${job.title} at ${job.company} in ${job.location} on Zenoway.`;

  return {
    title: `${job.title} at ${job.company} | Zenoway`,
    description: excerpt,
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description: excerpt,
      url: `https://www.zenoway.online/jobs/${job.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company}`,
      description: excerpt,
    },
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return <JobDetailsClient job={job} />;
}