import { MetadataRoute } from "next";
import { getAllJobs } from "@/lib/supabase/jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.zenoway.online";

  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/jobs", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/post-job", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/join", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const jobs = await getAllJobs();

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...jobs.map((job) => {
      const parsed = job.postedDate ? new Date(job.postedDate) : null;
      const isValid = parsed !== null && !isNaN(parsed.getTime());

      return {
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: isValid ? parsed : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      };
    }),
  ];
}