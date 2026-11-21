"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Share2,
  Check,
  Twitter,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/app/components/Modal";
import type { CandidateProfile } from "@/context/AuthContext";

const LINK_ICONS: Record<string, React.ReactNode> = {
  Portfolio: <Globe size={13} strokeWidth={1.8} />,
  LinkedIn: <Linkedin size={13} strokeWidth={1.8} />,
  GitHub: <Github size={13} strokeWidth={1.8} />,
  "X / Twitter": <Twitter size={13} strokeWidth={1.8} />,
};

const OFFER_TYPES = [
  "Full-time Role",
  "Design Leadership / Staff Role",
  "High-Impact Contract",
  "Advisory / Freelance",
];

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </h2>
  );
}

const inputClass =
  "mt-1 w-full rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs text-text-primary outline-none focus:border-brand";

interface CandidatePublicClientProps {
  candidate: CandidateProfile;
}

export default function CandidatePublicClient({
  candidate,
}: CandidatePublicClientProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    company: "",
    offerType: OFFER_TYPES[0],
    message: `Hi ${candidate.full_name || "Candidate"}, we came across your profile on Uxion and would love to connect about an opportunity on our team!`,
  });

  const name = candidate.full_name || "Candidate";
  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const headline = candidate.headline || "";
  const location = candidate.location || "";
  const email = candidate.email;
  const phone = candidate.phone;
  const summary = candidate.summary;
  const resumeUrl = candidate.resume_url;
  const resumeName = candidate.resume_name || `${name.replace(/\s+/g, "_")}_Resume.pdf`;
  const skills = candidate.skills || [];

  const links = [
    candidate.portfolio_url ? { label: "Portfolio", href: candidate.portfolio_url } : null,
    candidate.linkedin_url ? { label: "LinkedIn", href: candidate.linkedin_url } : null,
    candidate.github_url ? { label: "GitHub", href: candidate.github_url } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleCopyLink = async () => {
    await copy(window.location.href, "Candidate profile link copied!");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.senderName || !form.senderEmail) {
      toast.error("Please fill in your name and email.");
      return;
    }
    // Open candidate's email client with prefilled subject and message
    const subject = encodeURIComponent(
      `Opportunity Inquiry: ${form.offerType} via Uxion`
    );
    const body = encodeURIComponent(
      `From: ${form.senderName} (${form.senderEmail})\nCompany: ${form.company || "Not specified"}\n\n${form.message}`
    );
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    toast.success(`Opening email to ${name}...`);
    setIsContactOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-base text-text-primary antialiased selection:bg-brand-soft selection:text-brand">
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

      {/* TOP STATUS BAR */}
      <div className="border-b border-border-subtle/60 bg-surface-base/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-8">
          <div className="inline-flex items-center gap-2 text-2xs font-medium text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Public Candidate Profile</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-brand"
          >
            {copiedLink ? (
              <Check size={13} className="text-status-success" />
            ) : (
              <Share2 size={13} />
            )}
            <span>{copiedLink ? "Link copied" : "Share profile"}</span>
          </button>
        </div>
      </div>

      {/* HERO: Concentric rings behind the avatar */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
          <header>
            <div
              className="hero-in relative h-24 w-24"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              {/* Concentric rings */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(56rem,90vw)] w-[min(56rem,90vw)] -translate-x-1/2 -translate-y-1/2 text-brand"
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

              {candidate.avatar_url && !avatarError ? (
                <Image
                  src={candidate.avatar_url}
                  alt={name}
                  width={96}
                  height={96}
                  priority
                  unoptimized
                  onError={() => setAvatarError(true)}
                  className="relative h-24 w-24 rounded-full object-cover ring-4 ring-surface-base shadow-subtle"
                />
              ) : (
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-surface-base shadow-subtle">
                  {initials}
                </div>
              )}
            </div>

            {/* Active Status Badge */}
            <div
              className="hero-in mt-4 inline-flex items-center gap-2 rounded-pill border border-border-subtle bg-surface-base px-3 py-1 text-xs font-medium text-text-secondary sm:mt-5"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new roles
            </div>

            {/* Candidate Title & Headline */}
            <h1
              className="hero-in mt-3.5 text-3xl font-bold tracking-tight sm:mt-4 sm:text-5xl lg:text-6xl break-words"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {name}
            </h1>
            {headline && (
              <p
                className="hero-in mt-2 text-base text-text-secondary sm:text-lg lg:text-xl leading-snug sm:leading-normal"
                style={{ "--d": "240ms" } as React.CSSProperties}
              >
                {headline}
              </p>
            )}

            {/* Location & Links Bar */}
            {Boolean(location || links.length > 0) && (
              <div
                className="hero-in mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:mt-5 sm:gap-x-5 sm:text-sm"
                style={{ "--d": "320ms" } as React.CSSProperties}
              >
                {location && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
                    <MapPin size={14} strokeWidth={1.8} className="text-brand" />
                    {location}
                  </span>
                )}

                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-text-secondary transition hover:text-brand"
                  >
                    {LINK_ICONS[l.label] || <ExternalLink size={13} />}
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            {/* Hero Action Buttons */}
            <div
              className="hero-in mt-6 flex flex-wrap items-center gap-3 sm:mt-7"
              style={{ "--d": "400ms" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-control bg-brand px-6 text-sm font-semibold text-text-inverse transition hover:bg-brand-hover active:scale-[0.98] sm:flex-initial"
              >
                Get in touch
              </button>

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  download={resumeName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-border-default bg-surface-base px-6 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand sm:flex-initial"
                >
                  Resume PDF
                </a>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* BODY: Sticky Facts Left + Story Right */}
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8 sm:pb-20">
        <div className="grid gap-6 pt-4 sm:gap-10 sm:pt-6 lg:grid-cols-[17rem_1fr] lg:gap-14">
          
          {/* ---------- LEFT: Recruiter Facts ---------- */}
          <aside className="space-y-4 sm:space-y-6 lg:sticky lg:top-8 lg:self-start lg:space-y-8">
            <section className="space-y-3 rounded-panel border border-border-subtle/80 bg-surface-card/40 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <Heading>At a glance</Heading>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs sm:text-sm lg:block lg:space-y-3.5">
                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Account</dt>
                  <dd className="mt-0.5 font-semibold text-text-primary truncate">
                    Verified Candidate
                  </dd>
                </div>

                {headline && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Role focus</dt>
                    <dd className="mt-0.5 text-text-secondary truncate sm:whitespace-normal">
                      {headline}
                    </dd>
                  </div>
                )}

                {location && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Location</dt>
                    <dd className="mt-0.5 text-text-secondary truncate">{location}</dd>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="min-w-0">
                    <dt className="text-2xs text-text-muted">Skills</dt>
                    <dd className="mt-0.5 text-text-secondary truncate">{skills.length} listed</dd>
                  </div>
                )}

                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Resume</dt>
                  <dd className="mt-0.5 text-brand font-medium truncate">
                    {resumeUrl ? "Verified & attached" : "Not attached"}
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="text-2xs text-text-muted">Direct contact</dt>
                  <dd className="mt-0.5 text-text-secondary truncate">
                    {phone ? "Email & Phone" : "Email available"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-3 rounded-panel border border-border-subtle/80 bg-surface-card/40 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <Heading>Contact</Heading>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <a
                  href={`mailto:${email}`}
                  className="block break-all text-text-secondary transition hover:text-brand"
                >
                  {email}
                </a>
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block text-text-secondary transition hover:text-brand"
                  >
                    {phone}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copy(email, "Email copied")}
                  className="cursor-pointer text-xs font-medium text-brand transition hover:underline"
                >
                  Copy email
                </button>
              </div>
            </section>
          </aside>

          {/* ---------- RIGHT: Story ---------- */}
          <main className="min-w-0 divide-y divide-border-subtle">
            
            {/* Stats */}
            <section className="grid grid-cols-2 gap-3 pb-6 sm:gap-6 sm:grid-cols-4 sm:pb-8">
              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {skills.length ? `${skills.length}+` : "Verified"}
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Skills listed</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {resumeUrl ? "1 File" : "None"}
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Resume status</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  Active
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Candidate status</p>
              </div>

              <div className="rounded-card border border-border-subtle/70 bg-surface-card/30 p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <p className="text-xl font-bold tracking-tight text-brand sm:text-2xl">
                  100%
                </p>
                <p className="text-2xs text-text-muted sm:text-xs">Verified profile</p>
              </div>
            </section>

            {/* About */}
            {summary && (
              <section className="space-y-3.5 py-6 sm:py-8">
                <Heading>About</Heading>
                <div className="space-y-3 text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {summary}
                </div>

                {skills.length > 0 && (
                  <ul className="grid gap-x-6 gap-y-1.5 pt-2 text-sm text-text-secondary sm:grid-cols-2">
                    {skills.slice(0, 4).map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="text-brand">—</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="space-y-4 py-6 sm:py-8">
                <Heading>Skills & Proficiencies</Heading>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-pill border border-border-default bg-surface-card px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Resume */}
            {resumeUrl && (
              <section className="space-y-4 py-6 sm:py-8">
                <Heading>Resume & Documents</Heading>
                <div className="flex flex-col gap-4 rounded-card border border-border-subtle bg-surface-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                      <FileText size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary truncate max-w-[220px] sm:max-w-xs">
                        {resumeName}
                      </h3>
                      <p className="text-xs text-text-muted">
                        ATS-optimized candidate resume
                      </p>
                    </div>
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
                      href={resumeUrl}
                      download={resumeName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      Download PDF ↓
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Online Links */}
            {links.length > 0 && (
              <section className="space-y-4 py-6 sm:py-8">
                <Heading>Connected Profiles</Heading>
                <div className="grid gap-3 sm:grid-cols-3">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-control border border-border-default bg-surface-card p-3 text-xs text-text-secondary transition hover:border-brand hover:text-brand"
                    >
                      <span className="flex items-center gap-2">
                        {LINK_ICONS[l.label] || <ExternalLink size={13} />}
                        <span className="font-semibold">{l.label}</span>
                      </span>
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {!summary && skills.length === 0 && !resumeUrl && links.length === 0 && (
              <section className="py-10 text-center">
                <p className="text-xs text-text-muted">
                  Candidate has not published portfolio details or public case studies yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
                >
                  <Mail size={13} />
                  <span>Reach out via email</span>
                </button>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* CONTACT MODAL */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        maxWidth="lg"
        variant="auto"
        bodyClassName="p-5 sm:p-6"
        title={`Contact ${name}`}
        description={`Send a direct message or role offer to ${name}.`}
      >
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-secondary">
              Your name <span className="text-status-error">*</span>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Varma"
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
              />
            </label>
            <label className="text-xs font-medium text-text-secondary">
              Opportunity type
              <div className="relative mt-1">
                <select
                  value={form.offerType}
                  onChange={(e) => setForm({ ...form, offerType: e.target.value })}
                  className={`${inputClass} cursor-pointer appearance-none pr-9`}
                >
                  {OFFER_TYPES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </label>
          </div>

          <label className="block text-xs font-medium text-text-secondary">
            Message
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-5 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
            >
              <Mail size={13} />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* RESUME PREVIEW MODAL */}
      <Modal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        maxWidth="2xl"
        variant="auto"
        bodyClassName="p-5 sm:p-6"
        title={resumeName}
        description="ATS-optimized resume preview."
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-card border border-border-default bg-white p-5 sm:p-6 text-xs text-text-primary">
          <div className="border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <p className="font-semibold text-brand">{headline || "Candidate"}</p>
            <p className="mt-1 text-2xs text-gray-500">
              {location} · {email} {phone ? `· ${phone}` : ""}
            </p>
          </div>
          {summary && (
            <div>
              <h3 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                Summary
              </h3>
              <p className="mt-1.5 leading-relaxed text-gray-600 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <h3 className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                Skills & Proficiencies
              </h3>
              <p className="mt-1.5 text-gray-600">
                {skills.join(" · ")}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setIsResumeOpen(false)}
            className="rounded-control border border-border-default px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle"
          >
            Close
          </button>
          {resumeUrl && (
            <a
              href={resumeUrl}
              download={resumeName}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse hover:bg-brand-hover"
            >
              Download PDF
            </a>
          )}
        </div>
      </Modal>
    </div>
  );
}
