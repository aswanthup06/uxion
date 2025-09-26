import { MetadataRoute } from "next";
import { jobs } from "./data/jobs"; // adjust path if needed

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.zenoway.in";

  // Static pages
  const staticRoutes = ["", "/post-job","/join"];

  // Dynamic job detail pages
  const dynamicRoutes = jobs.map((job) => `/jobs/${job.id}`);

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/jobs") ? "daily" : "weekly",
    priority: route.startsWith("/jobs") ? 0.9 : 1.0,
  }));
}
