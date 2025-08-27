import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UXCurve - UX Job Portal",
  description:
    "UXCurve is a dedicated job portal for UX and UI professionals. Discover UX design jobs, connect with top companies, and design your career path with ease.",
  keywords: [
    "UX jobs",
    "UI jobs",
    "UX design careers",
    "UXCurve",
    "UX hiring platform",
    "UX job portal",
    "UI/UX opportunities",
    "User Experience careers"
  ],
  authors: [{ name: "UXCurve" }],
  openGraph: {
    title: "UXCurve - Your Gateway to UX Careers",
    description:
      "Find UX and UI jobs, connect with employers, and design your career path with UXCurve.",
    url: "https://uxcurve.in", 
    siteName: "UXCurve",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UXCurve Job Portal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
