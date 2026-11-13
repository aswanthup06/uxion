import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ZenowayToaster from "./components/ZenowayToaster";

import MainLayout from "./MainLayout";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

// Must be the host that serves the site and og-image.png directly (HTTP 200, no redirect).
const SITE_URL = "https://www.zenoway.online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "Zenoway | Find Your Next Opportunity",
  description:
    "Find genuine job opportunities for UI/UX designers, frontend developers, and creative professionals across India.",

  keywords: [
    "UI jobs",
    "UX jobs",
    "UI Developer",
    "Frontend Developer",
    "React Jobs",
    "Next.js Jobs",
    "Tailwind CSS Jobs",
    "UX Designer",
    "Product Designer",
    "Remote Jobs",
    "Startup Jobs",
    "Zenoway",
  ],

  authors: [{ name: "Zenoway" }],

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  other: {
    "google-adsense-account": "ca-pub-8853112000993716",
  },

  openGraph: {
    title: "Zenoway | Find Your Next Opportunity",
    description:
      "Discover genuine job opportunities and grow your career with Zenoway.",
    url: SITE_URL,
    siteName: "Zenoway",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        secureUrl: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Zenoway — Genuine Job Opportunities",
      },
      {
        url: `${SITE_URL}/og-image.png`,
        secureUrl: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Zenoway — Genuine Job Opportunities",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Zenoway | Find Your Next Opportunity",
    description: "Discover genuine job opportunities across India.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-8853112000993716"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8853112000993716"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TKZQD3T9PD"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              window.dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'G-TKZQD3T9PD');
          `}
        </Script>
      </head>

      <body className={`${manrope.className} ${manrope.variable} antialiased`}>
        <MainLayout>{children}</MainLayout>

        <ZenowayToaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}