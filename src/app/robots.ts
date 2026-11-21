import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.zenoway.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/candidate-profile",
          "/candidate-profile/*",
          "/profile",
          "/profile/*",
          "/referral-dashboard",
          "/referral-dashboard/*",
          "/dummy-profile",
          "/dummy-profile/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
