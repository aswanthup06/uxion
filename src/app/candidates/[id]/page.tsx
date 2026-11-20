import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { CandidateProfile } from "@/context/AuthContext";
import CandidatePublicClient from "./CandidatePublicClient";

/**
 * FEATURE FLAG: Set to `true` whenever you are ready to make public candidate
 * profiles active and accessible to visitors and recruiters.
 * When `false`, all direct visits automatically redirect to the homepage.
 */
const ENABLE_PUBLIC_CANDIDATE_PROFILES = false;

interface CandidatePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CandidatePageProps): Promise<Metadata> {
  if (!ENABLE_PUBLIC_CANDIDATE_PROFILES) {
    return {
      title: "Uxion | Design & Tech Jobs",
    };
  }

  const { id } = await params;
  const supabase = getServiceSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return {
      title: "Candidate Profile | Uxion",
    };
  }

  const name = profile.full_name || "Candidate";
  const title = profile.headline ? `${name} — ${profile.headline}` : `${name} — Candidate Profile`;

  return {
    title: `${title} | Uxion`,
    description: `View ${name}'s verified design and development credentials, portfolio, and resume on Uxion.`,
  };
}

export default async function CandidatePublicProfilePage({
  params,
}: CandidatePageProps) {
  // Candidate profiles are currently paused; redirect safely to home
  if (!ENABLE_PUBLIC_CANDIDATE_PROFILES) {
    redirect("/");
  }

  const { id } = await params;

  const supabase = getServiceSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  return <CandidatePublicClient candidate={profile as CandidateProfile} />;
}
