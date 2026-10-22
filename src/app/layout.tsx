import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";

import MainLayout from "./MainLayout";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenoway.online"),
  title: "Zenoway",
  description:
    "Zenoway is a dedicated job portal for UI/UX designers, UI developers, frontend developers, and creative professionals. Discover jobs from startups and top companies across India.",
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
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Zenoway",
    description:
      "Find UI/UX and Frontend jobs across India. Connect with employers and grow your design & development career.",
    url: "https://zenoway.online",
    siteName: "Zenoway",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zenoway Job Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenoway",
    description: "Find UI/UX and Frontend jobs across India.",
    images: ["/og-image.png"],
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

      <body className={`${manrope.className} antialiased`}>
        <MainLayout>{children}</MainLayout>

        <Toaster position="top-right" reverseOrder={false} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
