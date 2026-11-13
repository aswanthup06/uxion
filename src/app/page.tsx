import type { Metadata } from "next";
import HeroSection from "./components/home/HeroSection";
import StatsBand, { type Stat } from "./components/home/StatsBand";
import HowItWorks from "./components/home/HowItWorks";
import HappyWork from "./components/home/HappyWork";
import Faq from "./components/home/Faq";

import SiteFooter from "./components/home/SiteFooter";

export const metadata: Metadata = {
  title: "Zenoway | Find Your Next Opportunity",
  description:
    "Find genuine job opportunities for UI/UX designers, frontend developers, and creative professionals across India.",
  alternates: {
    canonical: "https://www.zenoway.online",
  },
};

const stats: Stat[] = [
  { value: 45, suffix: "+", label: "Active jobs" },
  { value: 20, suffix: "+", label: "Companies hiring" },
  { value: 500, suffix: "+", label: "Job seekers" },
  { text: "Direct", label: "HR email on every listing" },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zenoway",
  url: "https://www.zenoway.online",
  logo: "https://www.zenoway.online/og-image.jpg",
  areaServed: "IN",
  description:
    "Zenoway is a dedicated job portal for UI/UX designers, UI developers, frontend developers, and creative professionals.",
  sameAs: [],
};

export default function Home() {
  return (
    <div className="text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <HeroSection />

      <StatsBand stats={stats} />

      <HowItWorks />

      <HappyWork />
      <Faq />

      <SiteFooter />
    </div>
  );
}
