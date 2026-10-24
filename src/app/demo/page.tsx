"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type WorkMode = "On-site" | "Hybrid" | "Remote";
type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  mode: WorkMode;
  type: JobType;
  category: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: "year" | "month";
  experience: string;
  posted: string;
  description: string;
  skills: string[];
  featured?: boolean;
};

// Replace these illustrative listings with data from your jobs API when ready.
const demoJobs: Job[] = [
  { id: 1, title: "Frontend Developer", company: "Northstar Digital", location: "Kochi, Kerala", mode: "Hybrid", type: "Full-time", category: "Engineering", salaryMin: 600000, salaryMax: 1000000, salaryPeriod: "year", experience: "2–4 years", posted: "Today", description: "Build accessible, responsive product interfaces with React, Next.js and TypeScript alongside a collaborative product team.", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"], featured: true },
  { id: 2, title: "Product Designer", company: "Paperplane Labs", location: "Bengaluru, Karnataka", mode: "Hybrid", type: "Full-time", category: "Design", salaryMin: 900000, salaryMax: 1500000, salaryPeriod: "year", experience: "3–5 years", posted: "Today", description: "Shape end-to-end user experiences, prototype ideas and partner with engineering to ship polished digital products.", skills: ["Figma", "UX Research", "Prototyping"], featured: true },
  { id: 3, title: "Backend Developer", company: "CloudHarbor", location: "Remote, India", mode: "Remote", type: "Full-time", category: "Engineering", salaryMin: 1000000, salaryMax: 1800000, salaryPeriod: "year", experience: "3–6 years", posted: "1 day ago", description: "Design reliable APIs and backend services, improve observability, and help scale cloud-based applications.", skills: ["Node.js", "PostgreSQL", "AWS"] },
  { id: 4, title: "HR Executive", company: "Greenfield Group", location: "Thiruvananthapuram, Kerala", mode: "On-site", type: "Full-time", category: "Human Resources", salaryMin: 25000, salaryMax: 40000, salaryPeriod: "month", experience: "1–3 years", posted: "1 day ago", description: "Coordinate recruitment, interview schedules, onboarding and employee documentation across teams.", skills: ["Recruitment", "Communication", "HR Operations"] },
  { id: 5, title: "Digital Marketing Specialist", company: "BrightMint", location: "Remote, India", mode: "Remote", type: "Full-time", category: "Marketing", salaryMin: 500000, salaryMax: 800000, salaryPeriod: "year", experience: "2–4 years", posted: "2 days ago", description: "Plan and execute digital campaigns, measure performance, and improve acquisition across channels.", skills: ["SEO", "Google Ads", "Analytics"], featured: true },
  { id: 6, title: "Data Analyst Intern", company: "MetricWorks", location: "Chennai, Tamil Nadu", mode: "On-site", type: "Internship", category: "Data", salaryMin: 15000, salaryMax: 25000, salaryPeriod: "month", experience: "Entry level", posted: "2 days ago", description: "Help clean datasets, build reports and turn business questions into useful insights with the analytics team.", skills: ["Excel", "SQL", "Power BI"] },
  { id: 7, title: "Customer Support Associate", company: "Careloop", location: "Kozhikode, Kerala", mode: "Hybrid", type: "Full-time", category: "Customer Support", salaryMin: 22000, salaryMax: 32000, salaryPeriod: "month", experience: "0–2 years", posted: "3 days ago", description: "Support customers over email and chat, investigate issues and share recurring feedback with product teams.", skills: ["Customer Service", "Email Support", "CRM"] },
  { id: 8, title: "Mobile App Developer", company: "Orbit Apps", location: "Remote, India", mode: "Remote", type: "Contract", category: "Engineering", salaryMin: 800000, salaryMax: 1400000, salaryPeriod: "year", experience: "3–5 years", posted: "3 days ago", description: "Develop and maintain mobile app features, integrate APIs and collaborate on app quality and release workflows.", skills: ["React Native", "TypeScript", "REST APIs"] },
  { id: 9, title: "Accounts Assistant", company: "LedgerLane", location: "Thrissur, Kerala", mode: "On-site", type: "Part-time", category: "Finance", salaryMin: 15000, salaryMax: 22000, salaryPeriod: "month", experience: "1–2 years", posted: "4 days ago", description: "Assist with invoices, reconciliations, expense records and routine finance administration.", skills: ["Excel", "Tally", "Bookkeeping"] },
  { id: 10, title: "Content Writer", company: "Wordsmith Studio", location: "Remote, India", mode: "Remote", type: "Contract", category: "Content", salaryMin: 400000, salaryMax: 700000, salaryPeriod: "year", experience: "2–4 years", posted: "5 days ago", description: "Create clear, useful web content and collaborate with SEO and design teams on editorial projects.", skills: ["Writing", "SEO", "Editing"] },
  { id: 11, title: "Sales Development Representative", company: "ScaleSpring", location: "Bengaluru, Karnataka", mode: "On-site", type: "Full-time", category: "Sales", salaryMin: 350000, salaryMax: 600000, salaryPeriod: "year", experience: "0–2 years", posted: "5 days ago", description: "Research prospective customers, qualify leads and support the sales team in building a healthy pipeline.", skills: ["Communication", "CRM", "Lead Generation"] },
  { id: 12, title: "UI Developer Intern", company: "MintPixel", location: "Kochi, Kerala", mode: "Hybrid", type: "Internship", category: "Engineering", salaryMin: 12000, salaryMax: 20000, salaryPeriod: "month", experience: "Entry level", posted: "1 week ago", description: "Work with the design and engineering team to build reusable interface components and learn modern frontend workflows.", skills: ["HTML", "CSS", "JavaScript"] },
];

const categories = ["Engineering", "Design", "Human Resources", "Marketing", "Data", "Customer Support", "Finance", "Content", "Sales"];
const types: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
const modes: WorkMode[] = ["On-site", "Hybrid", "Remote"];
const experiences = ["Any experience", "Entry level", "0–2 years", "1–3 years", "2–4 years", "3–5 years", "3–6 years"];

function salary(job: Job) {
  const fmt = (n: number) => job.salaryPeriod === "year" ? `₹${(n / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} LPA` : `₹${n.toLocaleString("en-IN")}`;
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}${job.salaryPeriod === "month" ? " / month" : ""}`;
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${active ? "border-emerald-900 bg-emerald-900 text-white hover:bg-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"}`}
    >
      {children}
    </button>
  );
}

const navCls = (active: boolean) =>
  `flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${active ? "bg-emerald-50 text-emerald-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`;

const selectCls = "mt-2 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-emerald-700";

export default function AllJobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All job types");
  const [mode, setMode] = useState("All work modes");
  const [category, setCategory] = useState("All categories");
  const [experience, setExperience] = useState("Any experience");
  const [salaryFloor, setSalaryFloor] = useState("0");
  const [sortBy, setSortBy] = useState("recent");
  const [saved, setSaved] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const floor = Number(salaryFloor);
    const result = demoJobs.filter((job) => {
      const searchable = [job.title, job.company, job.category, job.location, job.description, ...job.skills].join(" ").toLowerCase();
      const monthlyMin = job.salaryPeriod === "year" ? job.salaryMin / 12 : job.salaryMin;
      const expMatch = experience === "Any experience" || job.experience === experience || (experience === "Entry level" && job.experience === "0–2 years");
      return (!q || searchable.includes(q)) && (!loc || job.location.toLowerCase().includes(loc)) && (type === "All job types" || job.type === type) && (mode === "All work modes" || job.mode === mode) && (category === "All categories" || job.category === category) && expMatch && monthlyMin >= floor && (!savedOnly || saved.includes(job.id));
    });
    const monthly = (j: Job, v: number) => (j.salaryPeriod === "year" ? v / 12 : v);
    if (sortBy === "salary-high") result.sort((a, b) => monthly(b, b.salaryMax) - monthly(a, a.salaryMax));
    else if (sortBy === "salary-low") result.sort((a, b) => monthly(a, a.salaryMin) - monthly(b, b.salaryMin));
    else if (sortBy === "company") result.sort((a, b) => a.company.localeCompare(b.company));
    else result.sort((a, b) => a.id - b.id);
    return result;
  }, [search, location, type, mode, category, experience, salaryFloor, sortBy, savedOnly, saved]);

  const activeFilters = [type !== "All job types", mode !== "All work modes", category !== "All categories", experience !== "Any experience", salaryFloor !== "0", Boolean(location.trim())].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setType("All job types");
    setMode("All work modes");
    setCategory("All categories");
    setExperience("Any experience");
    setSalaryFloor("0");
    setSortBy("recent");
    setSavedOnly(false);
    setFiltersOpen(false);
  };
  const hasActiveCriteria = Boolean(search.trim() || location.trim() || activeFilters > 0 || savedOnly || sortBy !== "recent");
  const toggleSaved = (id: number) => setSaved((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  const noSavedYet = savedOnly && saved.length === 0;

  return (
    // Set --header-h on a parent (or in globals.css) if your navbar isn't 4rem tall.
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:h-[calc(100dvh-var(--header-h,4rem))] lg:min-h-0 lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Sidebar */}
      <aside className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-7 border-b border-slate-200 bg-white p-5 lg:sticky lg:top-0 lg:flex lg:h-full lg:min-h-0 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:p-6 lg:pb-8 [&>*]:shrink-0`}>
        <nav className="space-y-1" aria-label="Job views">
          <button type="button" onClick={() => setSavedOnly(false)} className={navCls(!savedOnly)}>
            <BriefcaseBusiness className="h-4 w-4" /> All jobs <span className="ml-auto text-xs opacity-60">{demoJobs.length}</span>
          </button>
          <button type="button" onClick={() => setSavedOnly(true)} className={navCls(savedOnly)}>
            <Bookmark className="h-4 w-4" fill={savedOnly ? "currentColor" : "none"} /> Saved <span className="ml-auto text-xs opacity-60">{saved.length}</span>
          </button>
        </nav>

        <div className="space-y-6 border-t border-slate-100 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Job type</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {types.map((t) => <Chip key={t} active={type === t} onClick={() => setType(type === t ? "All job types" : t)}>{t}</Chip>)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Work mode</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modes.map((m) => <Chip key={m} active={mode === m} onClick={() => setMode(mode === m ? "All work modes" : m)}>{m}</Chip>)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Department</p>
            <ul className="mt-2 space-y-0.5">
              {categories.map((c) => {
                const active = category === c;
                return (
                  <li key={c}>
                    <button type="button" onClick={() => setCategory(active ? "All categories" : c)} className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors duration-200 ${active ? "bg-emerald-50 font-semibold text-emerald-900 hover:bg-emerald-100/70" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                      {c}
                      <span className={`text-xs ${active ? "text-emerald-800" : "text-slate-400"}`}>{demoJobs.filter((j) => j.category === c).length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Experience
            <select value={experience} onChange={(e) => setExperience(e.target.value)} className={`${selectCls} font-normal normal-case tracking-normal`}>{experiences.map((x) => <option key={x}>{x}</option>)}</select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Min. monthly salary
            <select value={salaryFloor} onChange={(e) => setSalaryFloor(e.target.value)} className={`${selectCls} font-normal normal-case tracking-normal`}>
              <option value="0">Any salary</option>
              <option value="15000">₹15,000+</option>
              <option value="25000">₹25,000+</option>
              <option value="40000">₹40,000+</option>
              <option value="60000">₹60,000+</option>
              <option value="100000">₹1,00,000+</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveCriteria}
          className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          <span>Reset filters</span>
          {activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold tabular-nums text-slate-600">{activeFilters}</span>}
        </button>
      </aside>

      {/* Main */}
      <main className="min-w-0 px-5 py-5 sm:px-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-10 lg:py-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-baseline gap-2.5 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.75rem]">
              Explore open roles
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums tracking-normal text-emerald-900" aria-live="polite">
                {filteredJobs.length}
                <span className="sr-only"> matching roles</span>
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Roles that match your skills, your goals, and the way you want to work.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setFiltersOpen((v) => !v)} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-200 lg:hidden ${filtersOpen ? "border-emerald-900 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"}`}>
              <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilters > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-900 px-1 text-[11px] text-white">{activeFilters}</span>}
            </button>
            <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-500">
              <ArrowDownUp className="h-4 w-4" />
              <select aria-label="Sort jobs" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none">
                <option value="recent">Most recent</option>
                <option value="salary-high">Salary: high to low</option>
                <option value="salary-low">Salary: low to high</option>
                <option value="company">Company A–Z</option>
              </select>
            </label>
          </div>
        </header>

        {/* Search */}
        <div className="mt-5 grid grid-cols-1 rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-emerald-700 sm:grid-cols-2">
          <label className="flex items-center gap-3 px-4 py-3.5">
            <Search className="h-[18px] w-[18px] shrink-0 text-emerald-800" />
            <span className="sr-only">Search job title, skill or company</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Job title, skill or company" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button>}
          </label>
          <label className="flex items-center gap-3 border-t border-slate-200 px-4 py-3.5 sm:border-l sm:border-t-0">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-emerald-800" />
            <span className="sr-only">Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or remote" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            {location && <button type="button" onClick={() => setLocation("")} aria-label="Clear location" className="cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button>}
          </label>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => {
            const isSaved = saved.includes(job.id);
            return (
              <article
                key={job.id}
                onClick={() => setActiveJob(job)}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setActiveJob(job); } }}
                tabIndex={0}
                role="button"
                aria-label={`View ${job.title} at ${job.company}`}
                // Slow, eased fade (500ms) instead of an instant snap.
                className="group flex min-h-[190px] cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-4 text-left transition-[border-color,box-shadow] duration-500 ease-out hover:border-emerald-700/70 hover:shadow-[0_8px_24px_-12px_rgba(6,78,59,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:p-5 motion-reduce:transition-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800"><BriefcaseBusiness className="h-3.5 w-3.5" />{job.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{job.posted}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSaved(job.id); }} aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`} aria-pressed={isSaved} className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors duration-200 ${isSaved ? "bg-emerald-100 text-emerald-900" : "text-slate-400 hover:bg-slate-100 hover:text-emerald-800"}`}>
                      <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.025em] text-slate-950">{job.title}</h3>
                <p className="mt-1.5 text-sm font-medium text-slate-500">{job.company}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[job.type, job.mode, job.experience].map((tag) => <span key={tag} className="rounded-md bg-[#f3f6f4] px-2.5 py-1.5 text-[11px] font-medium text-slate-600">{tag}</span>)}
                  {job.featured && <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">Featured</span>}
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-slate-900">{salary(job)}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{job.location}</span></p>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-900 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
                </div>
              </article>
            );
          })}
          {filteredJobs.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">{noSavedYet ? <Bookmark className="h-5 w-5" /> : <Search className="h-5 w-5" />}</div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{noSavedYet ? "No saved roles yet" : "No matching jobs found"}</h3>
              <p className="mt-1 text-sm text-slate-500">{noSavedYet ? "Tap the bookmark on any role to keep it here." : "Try a different keyword or clear a few filters."}</p>
              <button type="button" onClick={noSavedYet ? () => setSavedOnly(false) : clearFilters} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                <RotateCcw className="h-3.5 w-3.5" />{noSavedYet ? "Browse all jobs" : "Reset search and filters"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
          <span>Find your next opportunity with Zenoway.</span>
          <span>Demo listings · Connect your jobs API for live roles</span>
        </div>
      </main>

      {/* Modal */}
      {activeJob && (
        <div role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveJob(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="job-modal-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-[#064e3b] px-6 pb-6 pt-7 text-white sm:px-8">
              <div aria-hidden="true" className="absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/10" />
              <button type="button" aria-label="Close job details" onClick={() => setActiveJob(null)} className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/15 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"><X className="h-4 w-4" /></button>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">{activeJob.category}</p>
              <h2 id="job-modal-title" className="mt-3 pr-8 text-2xl font-semibold tracking-tight sm:text-3xl">{activeJob.title}</h2>
              <p className="mt-2 text-sm text-emerald-50/80">{activeJob.company}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-50/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><MapPin className="h-3.5 w-3.5" />{activeJob.location}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">{activeJob.mode}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">{activeJob.type}</span>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-medium text-emerald-800">Salary range</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{salary(activeJob)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{activeJob.experience} · Posted {activeJob.posted}</p>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">About the role</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{activeJob.description}</p>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">Skills and expertise</h3>
                <div className="mt-3 flex flex-wrap gap-2">{activeJob.skills.map((skill) => <span key={skill} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">{skill}</span>)}</div>
              </div>
              <div className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => toggleSaved(activeJob.id)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  <Bookmark className="h-4 w-4" fill={saved.includes(activeJob.id) ? "currentColor" : "none"} />{saved.includes(activeJob.id) ? "Saved job" : "Save job"}
                </button>
                <a href={`/login?next=${encodeURIComponent(`/jobs/${activeJob.id}`)}`} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-950">
                  Apply now <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-4 text-center text-xs text-slate-400">Demo listing · Application requires your live jobs API and authentication.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}