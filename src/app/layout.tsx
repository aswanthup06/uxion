import type { Metadata } from "next";
import { Questrial } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";

import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

import "./globals.css";

const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenoway.com"),
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

  authors: [
    {
      name: "Zenoway",
    },
  ],

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "Zenoway",
    description:
      "Find UI/UX and Frontend jobs across India. Connect with employers and grow your design & development career.",
    url: "https://zenoway.com",
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
    description:
      "Find UI/UX and Frontend jobs across India.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${questrial.className} antialiased`}>
        {children}

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}