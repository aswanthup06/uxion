import { MetadataRoute } from "next";
import { jobs } from "./data/jobs"; // adjust path if needed

export default function sitemap(): MetadataRoute.Sitemap {
  // Confirmed domain from DNS/Vercel/Search Console — not .in
  const baseUrl = "https://www.zenoway.com";

  // Static pages — confirm these actually live under /home on your site.
  // Based on what's been verified so far (e.g. /home/jobs/JOB1040), they
  // likely need the same prefix as the dynamic routes below.
  const staticRoutes = ["/home", "/home/post-job", "/home/join"];

  // Dynamic job detail pages — matches the live, working URL structure
  // (/home/jobs/[id]), not /jobs/[id]
  const dynamicRoutes = jobs.map((job) => `/home/jobs/${job.id}`);

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    })),
    ...jobs.map((job) => ({
      url: `${baseUrl}/home/jobs/${job.id}`,
      // Use each job's real posted/updated date instead of "now" for
      // everything — this is what actually signals freshness to Google.
      lastModified: job.postedDate ? new Date(job.postedDate) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}