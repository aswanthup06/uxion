import HeroSection from "../components/home/HeroSection";
import StatsBand, { type Stat } from "../components/home/StatsBand";
import FeaturedJobs from "../components/home/FeaturedJobs";
import HowItWorks from "../components/home/HowItWorks";
import HappyWork from "../components/home/HappyWork";
import Faq from "../components/home/Faq";

import SiteFooter from "../components/home/SiteFooter";



const stats: Stat[] = [
  { value: 45, suffix: "+", label: "Active jobs" },
  { value: 20, suffix: "+", label: "Companies hiring" },
  { value: 500, suffix: "+", label: "Job seekers" },
  { text: "Direct", label: "HR email on every listing" },
];




// const featuredJobs: FeaturedJob[] = [
//   { id: "JOB1023", role: "UI/UX Designer", company: "Daiviksoft Technologies", location: "Kochi", exp: "1–3 years" },
//   { id: "JOB1021", role: "Senior UI/UX Designer", company: "Open startup role", location: "Remote", exp: "3–5 years" },
//   { id: "JOB1042", role: "Frontend Developer", company: "Open startup role", location: "Bengaluru", exp: "2–4 years" },
//   { id: "JOB1055", role: "Product Designer", company: "Open startup role", location: "Remote", exp: "1–3 years" },
// ];

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

      <HeroSection/>

      <StatsBand stats={stats} />
      {/* <FeaturedJobs jobs={featuredJobs} /> */}
      <HowItWorks />
     
      <HappyWork/>
      <Faq />
      
      <SiteFooter />
    </main>
  );
}