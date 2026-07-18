import { MetadataRoute } from "next";
import { jobs } from "./data/jobs"; // adjust path if needed

export default function sitemap(): MetadataRoute.Sitemap {
  // Confirmed domain from DNS/Vercel/Search Console — not .in
  const baseUrl = "https://www.zenoway.com";

  // Static pages — confirm these actually live under /home on your site.
  // Based on what's been verified so far (e.g. /home/jobs/JOB1040), they
  // likely need the same prefix as the dynamic routes below.
  const staticRoutes = ["/home", "/home/post-job", "/home/join"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    })),
    ...jobs.map((job) => {
      // Validate the parsed date before using it — an unparseable
      // postedDate produces an "Invalid Date", and calling
      // .toISOString() on that throws RangeError during the build.
      const parsed = job.postedDate ? new Date(job.postedDate) : null;
      const isValid = parsed !== null && !isNaN(parsed.getTime());

      return {
        url: `${baseUrl}/home/jobs/${job.id}`,
        lastModified: isValid ? parsed : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      };
    }),
  ];
}