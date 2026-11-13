"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Globe,
  Linkedin,
  MapPin,
  Twitter,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/app/components/Modal";

// --- CANDIDATE DATA ---
const CANDIDATE = {
  name: "Aarav Sharma",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  initials: "AS",
  headline: "Lead Product Designer & Design Engineer",
  tagline:
    "Blending high-craft UI/UX design with scalable React & Next.js frontend architecture. 6+ years shipping category-defining SaaS products across India and global markets.",
  location: "Bengaluru, India",
  email: "aarav.sharma.design@gmail.com",
  phone: "+91 98765 43210",
  links: [
    { label: "Portfolio", href: "https://aaravsharma.design" },
    { label: "LinkedIn", href: "https://linkedin.com/in/aarav-sharma-ux" },
    { label: "GitHub", href: "https://github.com/aaravsharma-dev" },
    { label: "Dribbble", href: "https://dribbble.com/aaravdesign" },
    { label: "X / Twitter", href: "https://x.com/aarav_craft" },
  ],
  resumeName: "Aarav_Sharma_Lead_Product_Designer_2026.pdf",
  resumeUrl: "/resume.pdf",
  resumeMeta: "2.4 MB · ATS-optimized, 2 pages · Updated 2 days ago",
  snapshot: [
    ["Status", "Available for new roles"],
    ["Target role", "Staff / Lead Product Designer or Design Technologist"],
    ["Current role", "Lead Product Designer & Design Engineer @ KiteScale"],
    ["Experience", "6.5+ years"],
    ["Work mode", "Remote / Hybrid (Bengaluru)"],
    ["Notice period", "15 days (immediate)"],
    ["Expected CTC", "₹34,00,000 – ₹42,00,000 / yr"],
    ["Relocation", "Yes (Pune, Mumbai, Singapore)"],
    ["Preferred cities", "Bengaluru, Pune, Mumbai, Remote"],
    ["Languages", "English (native), Hindi (fluent), Kannada (conversational)"],
  ] as [string, string][],
  stats: [
    { label: "Experience", value: "6.5+ yrs" },
    { label: "Products shipped", value: "24+" },
    { label: "Avg. UX impact", value: "+38%" },
    { label: "Zenoway score", value: "99.4%" },
  ],
  bio: [
    "I'm a hybrid Product Designer and Design Engineer based in Bengaluru with 6+ years of experience turning complex, data-heavy workflows into intuitive, beautiful software.",
    "My focus is at the intersection of UX research, high-fidelity visual craft, and production-ready frontend code. Previously, I established and scaled the 'Chroma' design system across 60+ engineers at KiteScale and redesigned merchant checkout flows at ZetaFlow, lifting conversion by 34%.",
    "I care deeply about micro-interactions, responsive typography, WCAG AAA accessibility, and bridging design tokens cleanly between Figma variables and Tailwind CSS.",
  ],
  superpowers: [
    "Design Systems Architecture in Figma & React",
    "Complex B2B & Fintech Workflow Simplification",
    "Pixel-perfect Next.js & Tailwind Implementation",
    "Data-Driven UX & Conversion Funnel Optimization",
  ],
  projects: [
    {
      title: "Chroma Design System 2.0",
      category: "Multi-brand UI & token system",
      description:
        "A scalable design system spanning 85+ accessible React components, automatic Figma-to-code token synchronization via GitHub Actions, and multi-brand dark/light themes.",
      impact: "Used by 60+ engineers · 42% faster sprint delivery · 0 regression bugs",
      tags: ["Figma Tokens", "Tailwind CSS v4", "Next.js", "Storybook", "Radix UI"],
      demoUrl: "https://chroma.design-system.preview",
    },
    {
      title: "PulseAnalytics Enterprise Suite",
      category: "Real-time B2B financial dashboard",
      description:
        "Redesigned real-time financial transaction monitoring and anomaly detection interface, reducing cognitive visual load for fintech compliance analysts.",
      impact: "38% faster anomaly resolution · $1.8M ARR expansion · 4.8/5 CSAT",
      tags: ["Data Visualization", "Complex UX", "TypeScript", "D3.js", "Fintech"],
      demoUrl: "https://pulse.analytics.preview",
    },
    {
      title: "SwiftPay Merchant POS & QR Flow",
      category: "Frictionless mobile payment UX",
      description:
        "Reimagined mobile settlement, instant soundbox notifications, and QR payment reconciliation for 120,000+ small retail shop owners across India.",
      impact: "65% faster payment reconciliation · 4.9 App Store rating",
      tags: ["Mobile UX", "iOS / Android", "Micro-interactions", "User Research"],
      demoUrl: "https://swiftpay.preview",
    },
  ],
  experience: [
    {
      role: "Lead Product Designer & Design Engineer",
      company: "KiteScale Technologies",
      type: "Full-time · Hybrid (Bengaluru)",
      period: "2023 – Present · 2 yrs 2 mos",
      description:
        "Leading the core design system and UX architecture for KiteScale's enterprise B2B analytics suite, used daily by 45,000+ businesses worldwide.",
      highlights: [
        "Architected and maintained 'Chroma', an open-standard tokenized design system spanning 85+ components in Figma and Next.js / Tailwind.",
        "Decreased UI delivery cycle times by 42% across 5 multi-disciplinary engineering pods.",
        "Redesigned the multi-tenant onboarding flow, resulting in a +34% lift in Day-7 activation and an estimated $1.2M ARR increase.",
        "Introduced weekly design crits, usability testing cadence, and mentored 4 junior designers.",
      ],
      tags: ["Figma Tokens", "Next.js", "TypeScript", "Tailwind CSS", "Storybook", "User Research"],
    },
    {
      role: "Senior UI/UX Designer",
      company: "ZetaFlow Commerce",
      type: "Full-time · Remote",
      period: "2021 – 2023 · 2 yrs 2 mos",
      description:
        "Spearheaded product design for ZetaFlow's multi-vendor checkout, inventory forecasting dashboard, and mobile merchant app across Indian Tier 1 & 2 cities.",
      highlights: [
        "Conducted 50+ in-depth merchant interviews and translated friction points into a simplified 2-tap payment & order fulfillment flow.",
        "Collaborated with mobile engineers to build 60fps micro-interactions using Framer Motion and React Native.",
        "Boosted mobile merchant daily engagement by 27% and maintained a 4.8/5 CSAT rating.",
      ],
      tags: ["Mobile UX", "Figma", "User Testing", "Prototyping", "Design Strategy"],
    },
    {
      role: "Frontend Developer & UI Designer",
      company: "PixelCraft Studio",
      type: "Full-time · Onsite (Bengaluru)",
      period: "2019 – 2020 · 1 yr 6 mos",
      description:
        "Designed and implemented high-performance digital products, web platforms, and interactive brand sites for high-growth tech startups.",
      highlights: [
        "Delivered 14 bespoke responsive web apps from scratch with 98+ Google Lighthouse scores across performance and accessibility.",
        "Bridged client brand identity guidelines into living component libraries and design tokens.",
      ],
      tags: ["React", "JavaScript", "HTML5/CSS3", "Responsive Web", "Web Performance"],
    },
  ],
  skills: [
    {
      category: "Product & UI/UX Design",
      items:
        "Design Systems Architecture · Design Tokens (Figma Variables) · User Journey Mapping · Interactive Prototyping · Usability Testing (RITE) · Information Architecture · WCAG 2.2 Accessibility (AAA) · Micro-copy & Content Design",
    },
    {
      category: "Frontend & Design Engineering",
      items:
        "React 19 & Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI · Web Vitals (LCP / INP / CLS) · Component-Driven Architecture",
    },
    {
      category: "Tools & Ecosystem",
      items:
        "Figma (Variables & Auto-layout) · FigJam & Miro · Linear & Jira · Git & GitHub Workflows · VS Code · Vercel & Supabase",
    },
  ],
  education: [
    {
      degree: "Bachelor of Design (B.Des), Interaction Design",
      institution: "National Institute of Design (NID)",
      period: "2015 – 2019 · Ahmedabad, India",
    },
  ],
  certifications: [
    {
      name: "NN/g UX Master Certified (UXMC)",
      issuer: "Nielsen Norman Group",
      year: "2023 · ID: #UXM-88219",
    },
    {
      name: "Meta Front-End Developer Professional",
      issuer: "Meta / Coursera",
      year: "2022",
    },
  ],
};

const OFFER_TYPES = [
  "Full-time Role",
  "Design Leadership / Staff Role",
  "High-Impact Contract",
  "Advisory / Freelance",
];

const LINK_ICONS: Record<string, React.ReactNode> = {
  Portfolio: <Globe size={13} strokeWidth={1.8} />,
  LinkedIn: <Linkedin size={13} strokeWidth={1.8} />,
  GitHub: <Github size={13} strokeWidth={1.8} />,
  Dribbble: <ArrowUpRight size={13} strokeWidth={1.8} />,
  "X / Twitter": <Twitter size={13} strokeWidth={1.8} />,
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </h2>
  );
}

export default function ProfileDesignPage() {
  const [avatarError, setAvatarError] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    company: "",
    offerType: OFFER_TYPES[0],
    message:
      "Hi Aarav, we were impressed by your work on Chroma and enterprise SaaS design. We'd love to chat about a Lead Product Designer role on our team!",
  });

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.senderName || !form.senderEmail) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success(`Message sent to ${CANDIDATE.name}!`);
    setIsContactOpen(false);
  };

  const input =
    "mt-1 w-full rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs text-text-primary outline-none focus:border-brand";

  return (
    <div className="min-h-screen bg-surface-base text-text-primary antialiased selection:bg-brand-soft selection:text-brand">
      <style>{`
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-in {
          opacity: 0;
          animation: hero-in 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          animation-delay: var(--d, 0ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-in { opacity: 1; animation: none; }
        }
      `}</style>

      {/* HERO: light, static concentric rings behind the avatar */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-5 pb-14 pt-8 sm:px-8 sm:pb-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="relative z-10 mb-12 flex items-center gap-2 text-xs text-text-muted"
          >
            <Link href="/" className="transition hover:text-brand">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/jobs" className="transition hover:text-brand">Candidates</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-text-primary">
              {CANDIDATE.name}
            </span>
          </nav>

          {/* Profile */}
          <header>
            <div
              className="hero-in relative h-24 w-24"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              {/* rings, centred on the avatar, fading out toward the edges */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 text-brand"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle closest-side, black 20%, transparent 100%)",
                  maskImage:
                    "radial-gradient(circle closest-side, black 20%, transparent 100%)",
                }}
              >
                {[
                  { size: "20%", o: 0.22 },
                  { size: "34%", o: 0.17 },
                  { size: "50%", o: 0.13 },
                  { size: "70%", o: 0.09 },
                  { size: "100%", o: 0.06 },
                ].map((r) => (
                  <span
                    key={r.size}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current"
                    style={{ width: r.size, height: r.size, opacity: r.o }}
                  />
                ))}
              </div>

              {avatarError ? (
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-surface-base">
                  {CANDIDATE.initials}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={CANDIDATE.avatarUrl}
                  alt={CANDIDATE.name}
                  onError={() => setAvatarError(true)}
                  className="relative h-24 w-24 rounded-full object-cover ring-4 ring-surface-base"
                />
              )}
            </div>

            <div
              className="hero-in mt-6 inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-surface-base px-3 py-1 text-xs font-medium text-text-secondary"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new roles
            </div>

            <h1
              className="hero-in mt-5 text-4xl font-semibold tracking-tight sm:text-6xl"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {CANDIDATE.name}
            </h1>
            <p
              className="hero-in mt-2 text-lg text-text-secondary sm:text-xl"
              style={{ "--d": "240ms" } as React.CSSProperties}
            >
              {CANDIDATE.headline}
            </p>

            <div
              className="hero-in mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
                <MapPin size={14} strokeWidth={1.8} className="text-brand" />
                {CANDIDATE.location}
              </span>
              {CANDIDATE.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-text-secondary transition hover:text-brand"
                >
                  {LINK_ICONS[l.label]}
                  {l.label}
                </a>
              ))}
            </div>

            <div
              className="hero-in mt-8 flex flex-wrap items-center gap-3"
              style={{ "--d": "400ms" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="h-10 cursor-pointer rounded-control bg-brand px-5 text-sm font-semibold text-text-inverse transition hover:bg-brand-hover active:scale-[0.98]"
              >
                Get in touch
              </button>
              <a
                href={CANDIDATE.resumeUrl}
                download={CANDIDATE.resumeName}
                className="inline-flex h-10 items-center rounded-control border border-border-default bg-surface-base px-5 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand"
              >
                Resume PDF
              </a>
            </div>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">

        {/* BODY: sticky facts (left) + story (right) */}
        <div className="grid gap-12 pt-10 lg:grid-cols-[17rem_1fr] lg:gap-16">
          {/* ---------- LEFT: recruiter facts ---------- */}
          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <section className="space-y-3">
              <Heading>At a glance</Heading>
              <dl className="space-y-3 text-sm">
                {CANDIDATE.snapshot.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] text-text-muted">{k}</dt>
                    <dd
                      className={
                        k === "Expected CTC" || k === "Notice period"
                          ? "font-semibold text-text-primary"
                          : "text-text-secondary"
                      }
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="space-y-3">
              <Heading>Contact</Heading>
              <div className="space-y-1.5 text-sm">
                <a
                  href={`mailto:${CANDIDATE.email}`}
                  className="block break-all text-text-secondary transition hover:text-brand"
                >
                  {CANDIDATE.email}
                </a>
                <a
                  href={`tel:${CANDIDATE.phone.replace(/\s/g, "")}`}
                  className="block text-text-secondary transition hover:text-brand"
                >
                  {CANDIDATE.phone}
                </a>
                <button
                  type="button"
                  onClick={() => copy(CANDIDATE.email, "Email copied")}
                  className="cursor-pointer text-xs text-text-muted transition hover:text-brand"
                >
                  Copy email
                </button>
              </div>
            </section>

          </aside>

          {/* ---------- RIGHT: story ---------- */}
          <main className="min-w-0 divide-y divide-border-subtle">
            {/* Stats */}
            <section className="grid grid-cols-2 gap-6 pb-10 sm:grid-cols-4">
              {CANDIDATE.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              ))}
            </section>

            {/* About */}
            <section className="space-y-4 py-10">
              <Heading>About</Heading>
              <p className="font-medium leading-relaxed text-text-primary">
                {CANDIDATE.tagline}
              </p>
              <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                {CANDIDATE.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <ul className="grid gap-x-6 gap-y-1.5 pt-2 text-sm text-text-secondary sm:grid-cols-2">
                {CANDIDATE.superpowers.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-brand">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            {/* Experience */}
            <section className="space-y-7 py-10">
              <Heading>Experience</Heading>
              {CANDIDATE.experience.map((e) => (
                <article key={e.role + e.company} className="space-y-2">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-semibold">{e.role}</h3>
                    <span className="text-xs text-text-muted">{e.period}</span>
                  </div>
                  <p className="text-sm text-brand">
                    {e.company}
                    <span className="text-text-muted"> · {e.type}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {e.description}
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-text-secondary marker:text-border-strong">
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-text-muted">{e.tags.join(" · ")}</p>
                </article>
              ))}
            </section>

            {/* Projects */}
            <section className="space-y-7 py-10">
              <Heading>Selected work</Heading>
              {CANDIDATE.projects.map((p) => (
                <article key={p.title} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold">{p.title}</h3>
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-0.5 text-xs text-text-secondary transition hover:text-brand"
                    >
                      Prototype <ArrowUpRight size={12} strokeWidth={1.8} />
                    </a>
                  </div>
                  <p className="text-xs text-text-muted">{p.category}</p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {p.description}
                  </p>
                  <p className="text-xs font-semibold text-brand">{p.impact}</p>
                  <p className="text-xs text-text-muted">{p.tags.join(" · ")}</p>
                </article>
              ))}
            </section>

            {/* Skills */}
            <section className="space-y-5 py-10">
              <Heading>Skills</Heading>
              {CANDIDATE.skills.map((g) => (
                <div key={g.category} className="space-y-1">
                  <p className="text-sm font-semibold">{g.category}</p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {g.items}
                  </p>
                </div>
              ))}
            </section>

            {/* Education + Certifications */}
            <section className="grid gap-10 py-10 sm:grid-cols-2">
              <div className="space-y-3">
                <Heading>Education</Heading>
                {CANDIDATE.education.map((e) => (
                  <div key={e.degree} className="text-sm">
                    <p className="font-semibold">{e.degree}</p>
                    <p className="text-brand">{e.institution}</p>
                    <p className="text-xs text-text-muted">{e.period}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <Heading>Certifications</Heading>
                {CANDIDATE.certifications.map((c) => (
                  <div key={c.name} className="text-sm">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-text-muted">
                      {c.issuer} · {c.year}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Resume */}
            <section className="flex flex-col gap-4 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">{CANDIDATE.resumeName}</h3>
                <p className="text-xs text-text-muted">{CANDIDATE.resumeMeta}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setIsResumeOpen(true)}
                  className="cursor-pointer text-text-secondary transition hover:text-brand"
                >
                  Preview
                </button>
                <a
                  href={CANDIDATE.resumeUrl}
                  download={CANDIDATE.resumeName}
                  className="font-semibold text-brand underline-offset-4 hover:underline"
                >
                  Download PDF ↓
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* CONTACT MODAL */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        maxWidth="lg"
        title={`Contact ${CANDIDATE.name}`}
        description={`Send a direct message or role offer to ${CANDIDATE.name}.`}
      >
        <form onSubmit={handleSend} className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-secondary">
              Your name <span className="text-status-error">*</span>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Varma"
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                className={input}
              />
            </label>
            <label className="text-xs font-medium text-text-secondary">
              Work email <span className="text-status-error">*</span>
              <input
                type="email"
                required
                placeholder="rahul@company.com"
                value={form.senderEmail}
                onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                className={input}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-secondary">
              Company
              <input
                type="text"
                placeholder="e.g. Acme Tech"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={input}
              />
            </label>
            <label className="text-xs font-medium text-text-secondary">
              Opportunity type
              <select
                value={form.offerType}
                onChange={(e) => setForm({ ...form, offerType: e.target.value })}
                className={input}
              >
                {OFFER_TYPES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-medium text-text-secondary">
            Message
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${input} resize-none`}
            />
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsContactOpen(false)}
              className="rounded-control border border-border-default px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
            >
              Send message
            </button>
          </div>
        </form>
      </Modal>

      {/* RESUME PREVIEW MODAL */}
      <Modal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        maxWidth="2xl"
        title={CANDIDATE.resumeName}
        description="ATS-optimized resume preview."
      >
        <div className="my-3 max-h-[60vh] space-y-4 overflow-y-auto rounded-card border border-border-default bg-white p-6 text-xs text-text-primary">
          <div className="border-b border-border-default pb-4">
            <h2 className="text-lg font-bold">{CANDIDATE.name}</h2>
            <p className="font-semibold text-brand">{CANDIDATE.headline}</p>
            <p className="mt-1 text-[11px] text-text-muted">
              Bengaluru · {CANDIDATE.email} · {CANDIDATE.phone}
            </p>
          </div>
          <div>
            <h3 className="border-b border-border-subtle pb-1 text-xs font-bold uppercase tracking-wider">
              Summary
            </h3>
            <p className="mt-1.5 leading-relaxed text-text-secondary">
              {CANDIDATE.bio.join(" ")}
            </p>
          </div>
          <div>
            <h3 className="border-b border-border-subtle pb-1 text-xs font-bold uppercase tracking-wider">
              Experience
            </h3>
            <div className="mt-2 space-y-3">
              {CANDIDATE.experience.map((e) => (
                <div key={e.role + e.company}>
                  <div className="flex justify-between font-bold">
                    <span>
                      {e.role} — <span className="text-brand">{e.company}</span>
                    </span>
                    <span className="text-text-muted">{e.period}</span>
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-text-secondary">
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsResumeOpen(false)}
            className="rounded-control border border-border-default px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle"
          >
            Close
          </button>
          <a
            href={CANDIDATE.resumeUrl}
            download={CANDIDATE.resumeName}
            className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
          >
            Download PDF
          </a>
        </div>
      </Modal>
    </div>
  );
}