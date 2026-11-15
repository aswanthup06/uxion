// src/lib/jobs/related.ts
import { getCachedPublishedJobs } from "@/lib/supabase/jobs";
import type { Job } from "@/app/types/job";
import { matchJobCategory } from "@/data/categories";

const STOP_WORDS = new Set([
  "and",
  "or",
  "in",
  "at",
  "for",
  "the",
  "a",
  "an",
  "to",
  "of",
  "with",
  "senior",
  "junior",
  "lead",
  "staff",
  "principal",
  "associate",
  "intern",
  "trainee",
  "hiring",
  "immediate",
  "urgent",
  "joiners",
  "wanted",
  "needed",
  "full-time",
  "part-time",
]);

function extractKeywords(title: string): Set<string> {
  const words = (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

export async function getRelatedJobs(
  currentJob: Job,
  limit = 3
): Promise<Job[]> {
  try {
    const allJobs = await getCachedPublishedJobs();
    if (!allJobs || allJobs.length === 0) return [];

    const otherJobs = allJobs.filter((j) => j.id !== currentJob.id);
    if (otherJobs.length === 0) return [];

    const currentCat = (
      currentJob.category || matchJobCategory(currentJob.title)
    ).toLowerCase();
    const currentTitleWords = extractKeywords(currentJob.title);
    const currentLoc = [
      currentJob.primaryCity,
      currentJob.primaryState,
      currentJob.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const isCurrentRemote =
      currentJob.workMode?.toLowerCase() === "remote" ||
      currentJob.location?.toLowerCase().includes("remote");

    const scored = otherJobs.map((candidate) => {
      let score = 0;
      const candidateCat = (
        candidate.category || matchJobCategory(candidate.title)
      ).toLowerCase();

      // Category match
      if (candidateCat === currentCat) {
        score += 30;
      }

      // Title keyword overlap
      const candidateTitleWords = extractKeywords(candidate.title);
      let overlapCount = 0;
      for (const word of currentTitleWords) {
        if (candidateTitleWords.has(word)) overlapCount++;
      }
      score += overlapCount * 12;

      // Work mode match
      const isCandidateRemote =
        candidate.workMode?.toLowerCase() === "remote" ||
        candidate.location?.toLowerCase().includes("remote");

      if (isCurrentRemote && isCandidateRemote) {
        score += 8;
      } else if (!isCurrentRemote && !isCandidateRemote) {
        const candidateLoc = [
          candidate.primaryCity,
          candidate.primaryState,
          candidate.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (
          currentLoc &&
          candidateLoc &&
          (currentLoc.includes(candidateLoc) || candidateLoc.includes(currentLoc))
        ) {
          score += 15;
        }
      }

      // Experience level similarity
      if (
        currentJob.experience &&
        candidate.experience &&
        currentJob.experience.trim().toLowerCase() ===
          candidate.experience.trim().toLowerCase()
      ) {
        score += 4;
      }

      // Recency bonus
      if (candidate.postedDate) {
        const ageInDays =
          (Date.now() - new Date(candidate.postedDate).getTime()) /
          (1000 * 60 * 60 * 24);
        if (ageInDays <= 7) score += 4;
        else if (ageInDays <= 30) score += 2;
      }

      return { job: candidate, score };
    });

    // Sort by relevance score descending, then by postedDate descending
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = a.job.postedDate ? new Date(a.job.postedDate).getTime() : 0;
      const dateB = b.job.postedDate ? new Date(b.job.postedDate).getTime() : 0;
      return dateB - dateA;
    });

    return scored.slice(0, limit).map((s) => s.job);
  } catch (err) {
    console.error("Failed to load related jobs:", err);
    return [];
  }
}
