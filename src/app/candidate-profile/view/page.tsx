import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Globe2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const candidate = {
  name: "Aarav Menon",
  headline: "Frontend Developer | React & Next.js",
  location: "Kochi, Kerala, India",
  email: "aarav.menon@example.com",
  phone: "+91 98765 43210",
  summary:
    "Frontend developer focused on building accessible, responsive web experiences with React, Next.js and TypeScript. I enjoy turning complex requirements into clear, reliable interfaces and working closely with design and product teams to ship thoughtful products.",
  experienceLevel: "3 years experience",
  desiredRole: "Frontend Developer",
  workMode: "Remote or Hybrid",
  employmentType: "Full-time",
  salary: "₹8–12 LPA",
  availability: "30 days notice",
  skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML & CSS", "REST APIs", "Git", "Accessibility", "Responsive UI"],
  languages: [
    { name: "Malayalam", level: "Native" },
    { name: "English", level: "Professional" },
    { name: "Hindi", level: "Conversational" },
  ],
  experience: [
    {
      role: "Frontend Developer",
      company: "Northstar Digital",
      location: "Kochi, Kerala · Hybrid",
      dates: "Jun 2023 — Present",
      description:
        "Build and maintain responsive product interfaces with React, Next.js and TypeScript. Collaborate with designers and backend engineers, improve page performance, and develop reusable UI components.",
      highlights: ["Improved key page load performance by 28%", "Built a shared component library used across 3 product areas"],
    },
    {
      role: "Junior Web Developer",
      company: "Pixelwave Studio",
      location: "Remote",
      dates: "Jan 2022 — May 2023",
      description:
        "Delivered landing pages and client dashboards, integrated REST APIs, and worked with the team to improve accessibility and cross-device consistency.",
      highlights: ["Shipped 8 client-facing web projects", "Introduced responsive QA checks before release"],
    },
  ],
  education: [
    {
      degree: "B.Tech, Computer Science and Engineering",
      institution: "Cochin University of Science and Technology",
      dates: "2018 — 2022",
      grade: "CGPA 8.2 / 10",
    },
  ],
  projects: [
    {
      name: "Taskflow — Team Planner",
      type: "Personal project",
      description: "A lightweight team planning app with task boards, filters and a responsive dashboard.",
      stack: "Next.js · TypeScript · Tailwind CSS",
      link: "https://example.com/taskflow",
    },
    {
      name: "LocalCart — Storefront UI",
      type: "Portfolio project",
      description: "An accessible storefront concept with product discovery, category navigation and mobile-first layouts.",
      stack: "React · TypeScript · REST API",
      link: "https://example.com/localcart",
    },
  ],
  certifications: [
    "Meta Front-End Developer Professional Certificate — 2023",
    "JavaScript Algorithms and Data Structures — 2022",
  ],
  resume: "Aarav_Menon_Frontend_Developer.pdf",
  linkedin: "https://www.linkedin.com/",
  github: "https://github.com/",
  portfolio: "https://example.com",
  updated: "Updated 2 days ago",
};

const sectionClass = "rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-subtle";
const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-text-muted";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className={labelClass}>{eyebrow}</p>
      <h2 className="mt-1.5 text-base font-semibold tracking-tight text-text-primary">{title}</h2>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-text-secondary">{value}</p>
    </div>
  );
}

export default function CandidatePublicProfilePage() {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <a href="/home" className="cursor-pointer transition-colors hover:text-brand">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/candidates" className="cursor-pointer transition-colors hover:text-brand">Candidates</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-text-secondary">Candidate profile</span>
        </nav>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
              <div className="h-24 bg-gradient-to-r from-brand-soft via-white to-surface-muted sm:h-32" />
              <div className="px-5 pb-6 sm:px-7">
                <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&h=320&q=85"
                      alt="Portrait of Aarav Menon"
                      className="h-24 w-24 rounded-card border-4 border-surface-card bg-surface-muted object-cover shadow-subtle sm:h-28 sm:w-28"
                    />
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">{candidate.name}</h1>
                        <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified profile
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{candidate.headline}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted sm:pb-2">{candidate.updated}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand" />{candidate.location}</span>
                  <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4 text-brand" />{candidate.experienceLevel}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={`mailto:${candidate.email}`} className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Mail className="h-4 w-4" /> Contact candidate
                  </a>
                  <a href={candidate.resume} download className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Download className="h-4 w-4" /> View resume
                  </a>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="01 / Overview" title="Professional summary" />
              <p className="max-w-3xl text-sm leading-7 text-text-secondary">{candidate.summary}</p>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="02 / Employment" title="Work experience" />
              <div className="space-y-6">
                {candidate.experience.map((item, index) => (
                  <article key={item.company} className={index ? "border-t border-border-subtle pt-6" : ""}>
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{item.role}</h3>
                        <p className="mt-1 text-sm font-medium text-brand">{item.company}</p>
                        <p className="mt-1 text-xs text-text-muted">{item.location}</p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-1.5 text-xs text-text-muted"><CalendarDays className="h-3.5 w-3.5" />{item.dates}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{item.description}</p>
                    <ul className="mt-3 space-y-2">
                      {item.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{highlight}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="03 / Qualifications" title="Education" />
              <div className="space-y-5">
                {candidate.education.map((item) => (
                  <article key={item.institution} className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand"><GraduationCap className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-primary">{item.degree}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{item.institution}</p>
                      <p className="mt-1 text-xs text-text-muted">{item.dates} <span className="mx-1.5">·</span>{item.grade}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="04 / Capabilities" title="Skills and languages" />
              <div>
                <p className="mb-3 text-xs font-medium text-text-muted">Core skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => <span key={skill} className="rounded-control bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-primary border border-border-default">{skill}</span>)}
                </div>
              </div>
              <div className="mt-6 border-t border-border-subtle pt-5">
                <p className="mb-3 text-xs font-medium text-text-muted">Languages</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {candidate.languages.map((language) => <div key={language.name} className="rounded-control bg-surface-subtle p-3 border border-border-subtle"><p className="text-sm font-medium text-text-primary">{language.name}</p><p className="mt-1 text-xs text-text-muted">{language.level}</p></div>)}
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="05 / Selected work" title="Projects and portfolio" />
              <div className="grid gap-4 sm:grid-cols-2">
                {candidate.projects.map((project) => (
                  <article key={project.name} className="flex min-w-0 flex-col rounded-card border border-border-default p-4 hover:border-border-focus transition-colors">
                    <p className="text-xs font-medium text-brand">{project.type}</p>
                    <h3 className="mt-2 text-sm font-semibold text-text-primary">{project.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{project.description}</p>
                    <p className="mt-3 text-xs leading-5 text-text-muted">{project.stack}</p>
                    <a href={project.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover">
                      View project <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="06 / Additional details" title="Certifications and achievements" />
              <ul className="space-y-3">
                {candidate.certifications.map((item) => <li key={item} className="flex gap-2.5 text-sm text-text-secondary"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{item}</li>)}
              </ul>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className={sectionClass}>
              <SectionHeading eyebrow="Career preferences" title="What they're looking for" />
              <div className="space-y-4">
                <Detail label="Target role" value={candidate.desiredRole} />
                <Detail label="Employment type" value={candidate.employmentType} />
                <Detail label="Work preference" value={candidate.workMode} />
                <Detail label="Expected salary" value={candidate.salary} />
                <Detail label="Availability" value={candidate.availability} />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeading eyebrow="Contact" title="Candidate details" />
              <div className="space-y-4">
                <div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><div className="min-w-0"><p className="text-xs text-text-muted">Email</p><a href={`mailto:${candidate.email}`} className="mt-1 block cursor-pointer break-all text-sm text-text-primary hover:text-brand">{candidate.email}</a></div></div>
                <div className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><div className="min-w-0"><p className="text-xs text-text-muted">Phone</p><a href={`tel:${candidate.phone.replaceAll(" ", "")}`} className="mt-1 block cursor-pointer text-sm text-text-primary hover:text-brand">{candidate.phone}</a></div></div>
                <div className="flex gap-3"><Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><div className="min-w-0"><p className="text-xs text-text-muted">Portfolio</p><a href={candidate.portfolio} target="_blank" rel="noreferrer" className="mt-1 inline-flex cursor-pointer items-center gap-1 break-all text-sm text-text-primary hover:text-brand">Personal website <ExternalLink className="h-3 w-3 shrink-0" /></a></div></div>
              </div>
            </section>

            <section className="rounded-panel border border-brand-soft bg-brand-soft/50 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-surface-card text-brand shadow-subtle"><ShieldCheck className="h-4 w-4" /></span>
                <div><h2 className="text-sm font-semibold text-text-primary">Profile visibility</h2><p className="mt-1 text-xs leading-5 text-text-secondary">This sample profile is visible to employers. Contact details should only be shown according to the candidate's privacy settings.</p></div>
              </div>
            </section>

            <Link href="/jobs" className="flex cursor-pointer items-center justify-between rounded-control border border-border-default bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary shadow-subtle transition-colors hover:border-brand hover:text-brand">
              Explore open jobs <ArrowUpRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-border-default pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Candidate profile <span className="mx-1.5">·</span> Zenoway</p>
          <p className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />A clear profile helps the right opportunities find you.</p>
        </footer>
      </div>
    </main>
  );
}
