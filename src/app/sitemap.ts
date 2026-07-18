import { MetadataRoute } from "next";
// Defined locally instead of imported, to avoid path issues —
// keep this in sync with the Job type in JobDetailsClient.tsx
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

// Same data source your live job pages use (see src/app/jobs/[id]/page.tsx).
// Move this to an environment variable when you get a chance —
// see the notes in chat about why hardcoding this domain is fragile.
const JOBS_API_URL = "https://uxion.vercel.app/api/jobs";

async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch(JOBS_API_URL, {
      // Sitemaps don't need to be perfectly real-time — cache briefly
      // so every crawl of /sitemap.xml doesn't hammer the API.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("sitemap: failed to fetch jobs:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("sitemap: error fetching jobs:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.zenoway.com";

  // Static pages — confirmed live under /home based on testing in this
  // conversation (e.g. /home/jobs/JOB1040).
  const staticRoutes = ["/home", "/home/post-job", "/home/join"];

  // If the API call fails, we still want the static pages in the sitemap
  // rather than failing the whole build — jobs.map() below on an empty
  // array just produces zero job entries, which is safe.
  const jobs = await getJobs();

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