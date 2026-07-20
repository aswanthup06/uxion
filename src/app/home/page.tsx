import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Building2, Users, Star } from "lucide-react";
import { FiCheckCircle } from "react-icons/fi";
import { Eyebrow } from "../components/Eyebrow";
import { Button } from "../components/Button";
import { CursorTag } from "../components/CursorTag";
import { JobCard } from "../components/JobCard_main";
import { FlowStep } from "../components/FlowStep";

const images = ["/happy/1.jpg", "/happy/6.jpg", "/happy/5.jpg", "/happy/3.jpg", "/happy/7.jpg"];

// TODO: pull from your DB/API — small real numbers beat inflated fake ones.
const stats = [
  { value: "45+", label: "Active Jobs", icon: BriefcaseBusiness },
  { value: "20+", label: "Companies", icon: Building2 },
  { value: "500+", label: "Job Seekers", icon: Users },
  { value: "New", label: "Platform, Real Jobs", icon: Star },
];

// Wire to a live feed (last N logins/views) once available.
const cursorTags = [
  { name: "Priya", action: "viewing UI/UX Designer", color: "#5B57F2" },
  { name: "Arjun", action: "viewing Frontend Developer", color: "#B6FF3C", dark: true },
  { name: "Fathima", action: "joined the community", color: "#FF6B57" },
];

const flowSteps = [
  { step: "01", title: "Browse jobs", copy: "Explore live roles filtered by stack, location, and experience — no signup needed." },
  { step: "02", title: "Open a listing", copy: "Get the full picture — role details, company, and what they're looking for." },
  { step: "03", title: "Contact them directly", copy: "Every listing gives you the HR email or career site link — reach out straight away." },
];

// TODO: fetch your latest 4 real listings instead of hardcoding.
const featuredJobs = [
  { id: "JOB1023", role: "UI/UX Designer", company: "Daiviksoft Technologies", location: "Kochi", exp: "1–3 years" },
  { id: "JOB1021", role: "Senior UI/UX Designer", company: "Open startup role", location: "Remote", exp: "3–5 years" },
  { id: "JOB1042", role: "Frontend Developer", company: "Open startup role", location: "Bengaluru", exp: "2–4 years" },
  { id: "JOB1055", role: "Product Designer", company: "Open startup role", location: "Remote", exp: "1–3 years" },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zenoway",
  url: "https://www.zenoway.com",
  logo: "https://zenoway.com/og-image.png",
  description:
    "Zenoway is a dedicated job portal for UI/UX designers, UI developers, frontend developers, and creative professionals.",
  sameAs: [],
};

export default function Home() {
  return (
    <main className="h-full overflow-scroll bg-canvas text-ink font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="fixed inset-0 pointer-events-none opacity-[0.35] bg-dot-grid text-line" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Hero */}
        <section className="mb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-accent">
                  Zenoway · Job Portal
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-display font-semibold tracking-tight leading-[1.05]">
                Find your
                <span className="block text-accent mt-1">perfect career</span>
              </h1>

              <p className="mt-6 text-base text-subtle leading-relaxed max-w-md">
                A dedicated job board for UI/UX designers, frontend
                developers, and creative technologists — built by people who
                do the work.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Button href="/home/jobs">Browse open roles</Button>
                <Button href="/home/join" variant="secondary">
                  Join the community
                </Button>
              </div>

              <ul className="mt-10 space-y-3">
                {[
                  "Connecting talented people with modern companies",
                  "Remote, hybrid, and on-site opportunities in one place",
                  "Simple and clean experience for job seekers",
                  "Helping people build better careers and better lives",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-subtle text-sm">
                    <FiCheckCircle className="text-accent text-base shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column — layered composition with real depth */}
            <div className="relative h-[480px]">
              {/* Soft gradient backdrop — gives the composition depth without competing with content */}
              <div
                className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25 bg-accent"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-20 bg-signal"
                aria-hidden="true"
              />

              {/* Back frame — smallest, furthest, most rotated */}
              <div className="absolute top-2 right-4 bg-white border border-line rounded-card p-3 shadow-card w-36 rotate-6 z-0">
                <p className="text-[9px] font-mono uppercase tracking-wider text-muted">Now hiring</p>
                <p className="font-display font-semibold mt-1 text-xs">Product Designer</p>
                <p className="text-[10px] text-muted mt-0.5">Bengaluru</p>
              </div>

              {/* Centerpiece: search/results panel with browser-style chrome */}
              <div className="absolute top-14 left-4 right-8 bg-white border border-line rounded-card shadow-panel z-10 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-line-soft">
                  <span className="w-2 h-2 rounded-full bg-line" />
                  <span className="w-2 h-2 rounded-full bg-line" />
                  <span className="w-2 h-2 rounded-full bg-signal" />
                  <span className="ml-2 text-[10px] font-mono text-muted">zenoway.com/home/jobs</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 border border-line rounded-lg px-3 py-2 mb-3">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-muted shrink-0" />
                    <span className="text-sm text-muted">Frontend Developer, Kochi</span>
                  </div>

                  <div className="flex gap-1.5 mb-4">
                    {["React", "Remote", "1–3 yrs"].map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-accent bg-accent/10 rounded-pill px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {[
                    { role: "UI/UX Designer", company: "Daiviksoft Technologies", tag: "Kochi · 1–3 yrs" },
                    { role: "Frontend Developer", company: "Open startup role", tag: "Remote · 2–4 yrs" },
                    { role: "Senior UI/UX Designer", company: "Open startup role", tag: "Remote · 3–5 yrs" },
                  ].map((row) => (
                    <div
                      key={row.role}
                      className="flex items-center justify-between py-2.5 border-b last:border-b-0 border-line-soft"
                    >
                      <div>
                        <p className="text-sm font-medium">{row.role}</p>
                        <p className="text-xs text-muted">{row.company}</p>
                      </div>
                      <span className="text-[10px] font-mono text-accent whitespace-nowrap ml-3">
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Front frame — largest, closest, opposite rotation */}
              <div className="absolute bottom-[6px] -left-[14px] bg-white border border-line rounded-card p-4 shadow-panel w-48 -rotate-3 z-20">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted">Now hiring</p>
                <p className="font-display font-semibold mt-1 text-sm">UI/UX Designer</p>
                <p className="text-xs text-muted mt-0.5">Kochi · Daiviksoft</p>
              </div>

              {/* Floating tech-stack chips — the audience's own tools, not decoration */}
              <div className="absolute bottom-16 right-0 flex flex-col gap-2 z-20">
                {["Figma", "Next.js", "TypeScript"].map((tech, i) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono bg-ink text-canvas rounded-pill px-2.5 py-1 shadow-card self-end"
                    style={{ marginRight: `${i * 14}px` }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Cursor tags — the signature element, placed in clear gaps, not on top of the frames */}
              <CursorTag {...cursorTags[0]} className="absolute top-2 left-2 z-30" />
              <CursorTag {...cursorTags[1]} className="absolute bottom-9 left-30 z-30" />
            </div>

         
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 pt-10 border-t border-line">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-accent" />
                  <h3 className="text-2xl font-display font-semibold">{stat.value}</h3>
                </div>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-28">
          <div className="mb-14 max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-3xl font-display font-semibold mb-3">Three steps. No middleman.</h2>
            <p className="text-subtle leading-relaxed">
              No applications sitting in a queue. You get the HR email or
              career page directly and reach out yourself.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-line" aria-hidden="true" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
              {flowSteps.map((s) => (
                <FlowStep key={s.step} {...s} />
              ))}
            </div>
          </div>

        </section>

        {/* Browse by stack — functional, mirrors real filter/search intent */}
        <section className="mb-28">
          <div className="mb-10 max-w-2xl">
            <Eyebrow>Browse by stack</Eyebrow>
            <h2 className="text-3xl font-display font-semibold mb-3">Search by what you actually build with</h2>
            <p className="text-subtle leading-relaxed">
              Jump straight to roles filtered by your stack or tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              "React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS",
              "Figma", "Adobe XD", "UI/UX Design", "Product Design", "Remote",
            ].map((tech) => (
              <Link
                key={tech}
                href={`/home/jobs?stack=${encodeURIComponent(tech)}`}
                className="text-sm font-mono border border-line rounded-pill px-4 py-2 hover:border-accent hover:text-accent transition-colors"
              >
                {tech}
              </Link>
            ))}
          </div>
        </section>

        {/* Featured roles */}
        <section className="mb-28">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div className="max-w-xl">
              <Eyebrow>Featured roles</Eyebrow>
              <h2 className="text-3xl font-display font-semibold">Open right now</h2>
            </div>
            <Link href="/home/jobs" className="text-sm font-medium text-accent hover:underline">
              View all jobs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>
        </section>

        {/* Community */}
        <section className="mb-28">
          <div className="mb-8 max-w-2xl">
            <Eyebrow>Why Zenoway</Eyebrow>
            <h2 className="text-3xl font-display font-semibold mb-3">Building happy work experiences</h2>
            <p className="text-subtle leading-relaxed">
              We believe a good job creates a happier life. When people enjoy
              their work, they can enjoy better weekends, peaceful vacations,
              and more meaningful moments with family and friends. Every
              opportunity we create is focused on helping people build a
              satisfying and balanced life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((img, index) => (
              <Image
                key={img}
                src={img}
                alt={`Zenoway community member at work ${index + 1}`}
                width={500}
                height={500}
                className="aspect-square object-cover rounded-xl w-full h-full"
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-line pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 mb-12">
            {/* Brand column */}
            <div>
              <p className="font-display font-semibold text-lg mb-3">ZENOWAY</p>
              <p className="text-sm text-subtle leading-relaxed max-w-xs mb-4">
                A dedicated job board for UI/UX designers, frontend
                developers, and creative technologists across India.
              </p>
        
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted mb-4">Product</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/home/jobs" className="text-subtle hover:text-accent transition-colors">Browse jobs</Link></li>
                <li><Link href="/home/jobs" className="text-subtle hover:text-accent transition-colors">Browse by stack</Link></li>
                <li><Link href="/home/join" className="text-subtle hover:text-accent transition-colors">Join community</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted mb-4">Company</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/about" className="text-subtle hover:text-accent transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-subtle hover:text-accent transition-colors">Contact</Link></li>
                <li><Link href="/home/email" className="text-subtle hover:text-accent transition-colors">Email guide</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/privacy-policy" className="text-subtle hover:text-accent transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-subtle hover:text-accent transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-line-soft text-[11px] text-muted">
            <p>&copy; {new Date().getFullYear()} Zenoway. All rights reserved.</p>
            <p className="font-mono">Made for designers &amp; developers, in India.</p>
          </div>
        </footer>

        <div className="h-10" />
      </div>
    </main>
  );
}