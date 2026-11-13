import type { Metadata } from "next";
import { getAllJobs } from "@/lib/supabase/jobs";
import JobsClient from "./JobsClient";

export const metadata: Metadata = {
  title: "Explore UI/UX & Tech Jobs in India | Zenoway",
  description:
    "Browse verified job openings for UI/UX designers, frontend developers, and creative professionals across India. Filter by role, location, and experience.",
  alternates: {
    canonical: "https://www.zenoway.online/jobs",
  },
};

interface JobsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawCat = resolvedSearchParams.category;
  const initialCategory = typeof rawCat === "string" ? rawCat : undefined;
  const initialJobs = await getAllJobs();

  return (
    <JobsClient
      initialJobs={initialJobs}
      initialCategory={initialCategory}
    />
  );
}
