// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JobDetailsClient from "./JobDetailsClient";
import { getJobById } from "@/lib/supabase/jobs";
import { formatLocationLabel } from "@/lib/supabase/locations-data";
import { getRelatedJobs } from "@/lib/jobs/related";
import { matchCommunityGroup } from "@/lib/community/match-group";
import { createServerAuthClient } from "@/lib/supabase/server";
import { isJobEmailUnlocked, maskEmail } from "@/lib/payments/razorpay";

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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const locationText = formatLocationLabel(job);
  const excerpt = job.description
    ? job.description.replace(/[#*`_]/g, "").slice(0, 155).trim() + "..."
    : `Apply for ${job.title} at ${job.company} in ${locationText} on Zenoway.`;

  return {
    title: `${job.title} at ${job.company} | Zenoway`,
    description: excerpt,
    alternates: {
      canonical: `https://www.zenoway.online/jobs/${job.id}`,
    },
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description: excerpt,
      url: `https://www.zenoway.online/jobs/${job.id}`,
      type: "website",
      images: [
        {
          url: "https://www.zenoway.online/og-image.jpg",
          secureUrl: "https://www.zenoway.online/og-image.jpg",
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: `${job.title} at ${job.company} — Zenoway`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company}`,
      description: excerpt,
      images: ["https://www.zenoway.online/og-image.jpg"],
    },
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  // Check auth and email unlock status
  let isUnlocked = false;
  try {
    const authClient = await createServerAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (user) {
      isUnlocked = await isJobEmailUnlocked(user.id, job.id);
    }
  } catch (err) {
    // Graceful fallback if cookies or DB check fails
    console.warn("Unable to check email unlock status on server:", err);
  }

  // Securely mask email on server if not unlocked
  const clientJob = {
    ...job,
    mail: isUnlocked ? job.mail : maskEmail(job.mail),
  };

  const [relatedJobs, matchedGroup] = await Promise.all([
    getRelatedJobs(job, 3),
    Promise.resolve(matchCommunityGroup(job)),
  ]);

  return (
    <JobDetailsClient
      job={clientJob}
      relatedJobs={relatedJobs}
      matchedGroup={matchedGroup}
      isEmailUnlocked={isUnlocked}
    />
  );
}