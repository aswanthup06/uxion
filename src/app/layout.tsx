// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenoway.com"),
  title: "zenoway",
  description: "UXCurve is a dedicated job portal for UX and UI professionals. Discover UX design jobs, connect with top companies, and design your career path with ease.",
  icons: {
    icon: "/favicon.png",
  },
  keywords: [
    "UX jobs",
    "UI jobs",
    "UX design careers",
    "UXCurve",
    "UX hiring platform",
    "UX job portal",
    "UI/UX opportunities",
    "User Experience careers",
  ],
  authors: [{ name: "zenoway" }],
  openGraph: {
    title: "UXCurve - Your Gateway to UX Careers",
    description: "Find UX and UI jobs, connect with employers, and design your career path with UXCurve.",
    url: "https://zenoway.com",
    siteName: "UXCurve",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "zenoway Job Portal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}