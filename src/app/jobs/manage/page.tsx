"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleHelp,
  Download,
  Filter,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import Modal from "@/app/components/Modal";

type CandidateStatus = "New" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected";
type Candidate = {
  id: number;
  name: string;
  role: string;
  email: string;
  location: string;
  applied: string;
  status: CandidateStatus;
  experience: string;
  source: string;
  initials: string;
};

const initialCandidates: Candidate[] = [
  { id: 1, name: "Aarav Menon", role: "Frontend Developer", email: "aarav.menon@example.com", location: "Kochi, Kerala", applied: "Today", status: "New", experience: "3 years", source: "Website", initials: "AM" },
  { id: 2, name: "Diya Nair", role: "Product Designer", email: "diya.nair@example.com", location: "Bengaluru, Karnataka", applied: "Today", status: "Screening", experience: "5 years", source: "Referral", initials: "DN" },
  { id: 3, name: "Ishaan Thomas", role: "Backend Developer", email: "ishaan.thomas@example.com", location: "Remote", applied: "Yesterday", status: "Interview", experience: "4 years", source: "LinkedIn", initials: "IT" },
  { id: 4, name: "Meera Krishnan", role: "HR Executive", email: "meera.krishnan@example.com", location: "Thiruvananthapuram, Kerala", applied: "Yesterday", status: "Offer", experience: "2 years", source: "Website", initials: "MK" },
  { id: 5, name: "Rohan Das", role: "Marketing Specialist", email: "rohan.das@example.com", location: "Chennai, Tamil Nadu", applied: "2 days ago", status: "Hired", experience: "6 years", source: "Referral", initials: "RD" },
  { id: 6, name: "Ananya Pillai", role: "Frontend Developer", email: "ananya.pillai@example.com", location: "Kozhikode, Kerala", applied: "3 days ago", status: "Rejected", experience: "1 year", source: "Website", initials: "AP" },
  { id: 7, name: "Kabir Shah", role: "Data Analyst", email: "kabir.shah@example.com", location: "Pune, Maharashtra", applied: "4 days ago", status: "New", experience: "2 years", source: "LinkedIn", initials: "KS" },
];

const statuses: CandidateStatus[] = ["New", "Screening", "Interview", "Offer", "Hired", "Rejected"];
const statusStyles: Record<CandidateStatus, string> = {
  New: "bg-sky-50 text-sky-700",
  Screening: "bg-amber-50 text-amber-700",
  Interview: "bg-violet-50 text-violet-700",
  Offer: "bg-indigo-50 text-indigo-700",
  Hired: "bg-brand-soft text-brand-dark",
  Rejected: "bg-rose-50 text-rose-700",
};

const panelClass = "rounded-panel border border-border-default bg-surface-card";
const controlClass = "h-10 rounded-control border border-border-default bg-surface-card px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring";

function StatusBadge({ status }: { status: CandidateStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
}

export default function HRManagementPage() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [selected, setSelected] = useState<number[]>([]);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Frontend Developer");
  const [newLocation, setNewLocation] = useState("");
  const [notice, setNotice] = useState("");

  const roles = useMemo(() => ["All roles", ...Array.from(new Set(candidates.map((candidate) => candidate.role)))], [candidates]);
  const filtered = useMemo(() => candidates.filter((candidate) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [candidate.name, candidate.role, candidate.email, candidate.location].some((value) => value.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "All statuses" || candidate.status === statusFilter;
    const matchesRole = roleFilter === "All roles" || candidate.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  }), [candidates, search, statusFilter, roleFilter]);

  const stats = [
    { label: "Total applicants", value: candidates.length, note: "Across all open roles", icon: Users },
    { label: "New applicants", value: candidates.filter((candidate) => candidate.status === "New").length, note: "Need initial review", icon: Plus },
    { label: "Interviews", value: candidates.filter((candidate) => candidate.status === "Interview").length, note: "In the interview stage", icon: CalendarDays },
    { label: "Offers & hires", value: candidates.filter((candidate) => candidate.status === "Offer" || candidate.status === "Hired").length, note: "Offers and completed hires", icon: BriefcaseBusiness },
  ];

  function updateStatus(id: number, status: CandidateStatus) {
    setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, status } : candidate));
    setNotice("Candidate status updated.");
    setTimeout(() => setNotice(""), 2600);
  }

  function addCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    const email = newEmail.trim();
    if (!name || !email) return;
    const candidate: Candidate = {
      id: Math.max(0, ...candidates.map((item) => item.id)) + 1,
      name,
      role: newRole,
      email,
      location: newLocation.trim() || "Not specified",
      applied: "Just now",
      status: "New",
      experience: "Not specified",
      source: "Manual entry",
      initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join(""),
    };
    setCandidates((current) => [candidate, ...current]);
    setShowAddForm(false);
    setNewName("");
    setNewEmail("");
    setNewLocation("");
    setSearch("");
    setStatusFilter("All statuses");
    setRoleFilter("All roles");
    setNotice("Candidate added to this demo list.");
    setTimeout(() => setNotice(""), 2600);
  }

  function exportCsv() {
    const header = ["Name", "Role", "Email", "Location", "Applied", "Status", "Experience", "Source"];
    const rows = filtered.map((candidate) => [candidate.name, candidate.role, candidate.email, candidate.location, candidate.applied, candidate.status, candidate.experience, candidate.source]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "zenoway-candidates.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-surface-subtle text-text-primary">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="cursor-pointer transition-colors hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-text-secondary">HR management</span>
        </nav>

        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">People & hiring</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">HR management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Manage applicants, track hiring stages, and keep your recruitment process moving.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className={`${controlClass} inline-flex cursor-pointer items-center gap-2 hover:border-brand hover:text-brand`}><Download className="h-4 w-4" /> Export CSV</button>
            <button type="button" onClick={() => setShowAddForm(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover"><Plus className="h-4 w-4" /> Add candidate</button>
          </div>
        </header>

        {notice && <div role="status" className="mt-5 flex items-center gap-2 rounded-control border border-border-default bg-brand-soft px-3 py-2.5 text-sm text-brand-dark"><Check className="h-4 w-4" />{notice}</div>}

        <section aria-label="Hiring overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon }) => (
            <article key={label} className={`${panelClass} p-5 shadow-subtle`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm text-text-secondary">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">{value}</p><p className="mt-1 text-xs text-text-muted">{note}</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-control bg-brand-soft text-brand"><Icon className="h-5 w-5" /></span>
              </div>
            </article>
          ))}
        </section>

        <section className={`${panelClass} mt-6 shadow-subtle`}>
          <div className="flex flex-col gap-4 border-b border-border-subtle p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-base font-semibold text-text-primary">Applicants</h2><p className="mt-1 text-xs text-text-muted">{filtered.length} candidates match your filters</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <label className="relative block sm:min-w-64">
                <span className="sr-only">Search candidates</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, role, email..." className={`${controlClass} w-full pl-9`} />
              </label>
              <label className="relative block">
                <span className="sr-only">Filter by status</span>
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${controlClass} w-full cursor-pointer pl-9 sm:w-40`}>
                  <option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="relative block">
                <span className="sr-only">Filter by role</span>
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className={`${controlClass} w-full cursor-pointer pl-9 sm:w-48`}>
                  {roles.map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-col gap-3 border-b border-brand-light bg-brand-soft/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-dark">{selected.length} candidate{selected.length === 1 ? "" : "s"} selected</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-brand">Change selected status:</span>
                <select aria-label="Set selected candidate status" defaultValue="" onChange={(event) => { if (event.target.value) { const status = event.target.value as CandidateStatus; setCandidates((current) => current.map((candidate) => selected.includes(candidate.id) ? { ...candidate, status } : candidate)); setSelected([]); event.target.value = ""; setNotice("Selected candidate statuses updated."); setTimeout(() => setNotice(""), 2600); } }} className={`${controlClass} cursor-pointer`}>
                  <option value="" disabled>Choose status</option>{statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => setSelected([])} className="cursor-pointer px-2 py-2 text-xs font-medium text-brand hover:text-brand-dark">Clear selection</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-surface-subtle">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                  <th className="w-10 px-4 py-3"><input aria-label="Select all visible candidates" type="checkbox" checked={filtered.length > 0 && filtered.every((candidate) => selected.includes(candidate.id))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...filtered.map((candidate) => candidate.id)])) : selected.filter((id) => !filtered.some((candidate) => candidate.id === id)))} className="cursor-pointer accent-brand" /></th>
                  <th className="px-3 py-3">Candidate</th>
                  <th className="px-3 py-3">Applied for</th>
                  <th className="px-3 py-3">Applied</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Experience</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((candidate) => (
                  <tr key={candidate.id} className="transition-colors hover:bg-surface-subtle/70">
                    <td className="px-4 py-4"><input aria-label={`Select ${candidate.name}`} type="checkbox" checked={selected.includes(candidate.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, candidate.id] : current.filter((id) => id !== candidate.id))} className="cursor-pointer accent-brand" /></td>
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setActiveCandidate(candidate)} className="group flex cursor-pointer items-center gap-3 text-left">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-dark">{candidate.initials}</span>
                        <span className="min-w-0"><span className="block text-sm font-semibold text-text-primary group-hover:text-brand">{candidate.name}</span><span className="mt-1 block text-xs text-text-muted">{candidate.email}</span></span>
                      </button>
                    </td>
                    <td className="px-3 py-4"><span className="text-sm text-text-secondary">{candidate.role}</span><span className="mt-1 block text-xs text-text-muted">{candidate.location}</span></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-text-muted">{candidate.applied}</td>
                    <td className="px-3 py-4"><label className="sr-only" htmlFor={`status-${candidate.id}`}>Status for {candidate.name}</label><select id={`status-${candidate.id}`} value={candidate.status} onChange={(event) => updateStatus(candidate.id, event.target.value as CandidateStatus)} className="cursor-pointer rounded-full border-0 bg-transparent py-1 pl-0 pr-6 text-xs font-medium outline-none focus:ring-2 focus:ring-focus-ring"><option value="New">New</option><option value="Screening">Screening</option><option value="Interview">Interview</option><option value="Offer">Offer</option><option value="Hired">Hired</option><option value="Rejected">Rejected</option></select></td>
                    <td className="px-3 py-4 text-sm text-text-secondary">{candidate.experience}</td>
                    <td className="px-3 py-4 text-sm text-text-muted">{candidate.source}</td>
                    <td className="px-4 py-4 text-right"><button type="button" onClick={() => setActiveCandidate(candidate)} aria-label={`View ${candidate.name}`} className="inline-flex cursor-pointer items-center gap-1 rounded-control px-2 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft">View <ArrowUpRight className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center"><Search className="mx-auto h-6 w-6 text-border-strong" /><p className="mt-3 text-sm font-medium text-text-primary">No candidates found</p><p className="mt-1 text-xs text-text-muted">Try another search or clear your filters.</p><button type="button" onClick={() => { setSearch(""); setStatusFilter("All statuses"); setRoleFilter("All roles"); }} className="mt-3 cursor-pointer text-xs font-semibold text-brand hover:text-brand-dark">Clear filters</button></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-border-subtle px-4 py-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length} of {candidates.length} candidates</span><span className="inline-flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5" /> Demo data — connect your recruitment API for live records.</span></div>
        </section>

        <Modal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          maxWidth="lg"
          showCloseButton={false}
          bodyClassName="p-5 sm:p-6"
          labelledBy="add-candidate-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Recruitment</p>
              <h2 id="add-candidate-title" className="mt-1 text-lg font-semibold text-text-primary">Add candidate</h2>
              <p className="mt-1 text-sm text-text-muted">Add a candidate to this local demo list.</p>
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setShowAddForm(false)}
              className="cursor-pointer rounded-control p-2 text-text-muted hover:bg-surface-subtle hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={addCandidate} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Full name *</span>
              <input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Candidate name" className={`${controlClass} w-full`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Email address *</span>
              <input required type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="name@example.com" className={`${controlClass} w-full`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Applied for</span>
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)} className={`${controlClass} w-full cursor-pointer`}>
                {Array.from(new Set(candidates.map((candidate) => candidate.role))).map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Location</span>
              <input value={newLocation} onChange={(event) => setNewLocation(event.target.value)} placeholder="City, state or remote" className={`${controlClass} w-full`} />
            </label>
            <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className={`${controlClass} cursor-pointer`}>Cancel</button>
              <button type="submit" className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover">
                <Plus className="h-4 w-4" /> Add candidate
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={Boolean(activeCandidate)}
          onClose={() => setActiveCandidate(null)}
          maxWidth="xl"
          showCloseButton={false}
          bodyClassName="p-5 sm:p-6"
          labelledBy="candidate-details-title"
        >
          {activeCandidate && (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark">{activeCandidate.initials}</span>
                  <div>
                    <h2 id="candidate-details-title" className="text-lg font-semibold text-text-primary">{activeCandidate.name}</h2>
                    <p className="mt-1 text-sm text-text-muted">{activeCandidate.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close details"
                  onClick={() => setActiveCandidate(null)}
                  className="cursor-pointer rounded-control p-2 text-text-muted hover:bg-surface-subtle hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge status={activeCandidate.status} />
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text-secondary">{activeCandidate.experience} experience</span>
              </div>
              <div className="mt-5 grid gap-4 rounded-card bg-surface-subtle p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <a href={`mailto:${activeCandidate.email}`} className="mt-1 inline-flex cursor-pointer items-center gap-2 break-all text-sm text-text-secondary hover:text-brand">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {activeCandidate.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="mt-1 text-sm text-text-secondary">{activeCandidate.location}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Applied</p>
                  <p className="mt-1 text-sm text-text-secondary">{activeCandidate.applied}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Source</p>
                  <p className="mt-1 text-sm text-text-secondary">{activeCandidate.source}</p>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="detail-status" className="mb-1.5 block text-xs font-medium text-text-secondary">Update hiring stage</label>
                <select
                  id="detail-status"
                  value={activeCandidate.status}
                  onChange={(event) => {
                    const status = event.target.value as CandidateStatus;
                    updateStatus(activeCandidate.id, status);
                    setActiveCandidate({ ...activeCandidate, status });
                  }}
                  className={`${controlClass} w-full cursor-pointer`}
                >
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border-subtle pt-4">
                <a href={`mailto:${activeCandidate.email}`} className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary">
                  <Mail className="h-4 w-4" /> Email candidate
                </a>
                <button
                  type="button"
                  onClick={() => setActiveCandidate(null)}
                  className="cursor-pointer rounded-control bg-brand px-4 py-2 text-sm font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
