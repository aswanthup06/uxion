import HeroSection from "./components/home/HeroSection";
import StatsBand, { type Stat } from "./components/home/StatsBand";
import HowItWorks from "./components/home/HowItWorks";
import HappyWork from "./components/home/HappyWork";
import Faq from "./components/home/Faq";

import SiteFooter from "./components/home/SiteFooter";

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
  logo: "https://zenoway.online/og-image.png",
  areaServed: "IN",
  description:
    "Zenoway is a dedicated job portal for UI/UX designers, UI developers, frontend developers, and creative professionals.",
  sameAs: [],
};

export default function Home() {
  return (
    <main className={` h-full overflow-y-auto text-ink`}>
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
    </main>
  );
}
