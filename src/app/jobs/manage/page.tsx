"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  Ellipsis,
  Filter,
  Mail,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

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
  Hired: "bg-emerald-50 text-emerald-800",
  Rejected: "bg-rose-50 text-rose-700",
};

const panelClass = "rounded-lg border border-slate-200/80 bg-white";
const controlClass = "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

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
    <main className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <a href="/home" className="cursor-pointer transition-colors hover:text-emerald-800">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/dashboard" className="cursor-pointer transition-colors hover:text-emerald-800">Dashboard</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-slate-700">HR management</span>
        </nav>

        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">People & hiring</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">HR management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage applicants, track hiring stages, and keep your recruitment process moving.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className={`${controlClass} inline-flex cursor-pointer items-center gap-2 hover:border-emerald-300 hover:text-emerald-800`}><Download className="h-4 w-4" /> Export CSV</button>
            <button type="button" onClick={() => setShowAddForm(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover"><Plus className="h-4 w-4" /> Add candidate</button>
          </div>
        </header>

        {notice && <div role="status" className="mt-5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"><Check className="h-4 w-4" />{notice}</div>}

        <section aria-label="Hiring overview" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon }) => (
            <article key={label} className={`${panelClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
              </div>
            </article>
          ))}
        </section>

        <section className={`${panelClass} mt-6`}>
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-base font-semibold text-slate-900">Applicants</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} candidates match your filters</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <label className="relative block sm:min-w-64">
                <span className="sr-only">Search candidates</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, role, email..." className={`${controlClass} w-full pl-9`} />
              </label>
              <label className="relative block">
                <span className="sr-only">Filter by status</span>
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${controlClass} w-full cursor-pointer pl-9 sm:w-40`}>
                  <option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="relative block">
                <span className="sr-only">Filter by role</span>
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className={`${controlClass} w-full cursor-pointer pl-9 sm:w-48`}>
                  {roles.map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-col gap-3 border-b border-emerald-100 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-emerald-900">{selected.length} candidate{selected.length === 1 ? "" : "s"} selected</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-emerald-800">Change selected status:</span>
                <select aria-label="Set selected candidate status" defaultValue="" onChange={(event) => { if (event.target.value) { const status = event.target.value as CandidateStatus; setCandidates((current) => current.map((candidate) => selected.includes(candidate.id) ? { ...candidate, status } : candidate)); setSelected([]); event.target.value = ""; setNotice("Selected candidate statuses updated."); setTimeout(() => setNotice(""), 2600); } }} className={`${controlClass} cursor-pointer`}>
                  <option value="" disabled>Choose status</option>{statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => setSelected([])} className="cursor-pointer px-2 py-2 text-xs font-medium text-emerald-800 hover:text-emerald-950">Clear selection</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50/80">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="w-10 px-4 py-3"><input aria-label="Select all visible candidates" type="checkbox" checked={filtered.length > 0 && filtered.every((candidate) => selected.includes(candidate.id))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...filtered.map((candidate) => candidate.id)])) : selected.filter((id) => !filtered.some((candidate) => candidate.id === id)))} className="cursor-pointer accent-emerald-700" /></th>
                  <th className="px-3 py-3">Candidate</th>
                  <th className="px-3 py-3">Applied for</th>
                  <th className="px-3 py-3">Applied</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Experience</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((candidate) => (
                  <tr key={candidate.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-4"><input aria-label={`Select ${candidate.name}`} type="checkbox" checked={selected.includes(candidate.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, candidate.id] : current.filter((id) => id !== candidate.id))} className="cursor-pointer accent-emerald-700" /></td>
                    <td className="px-3 py-4">
                      <button type="button" onClick={() => setActiveCandidate(candidate)} className="group flex cursor-pointer items-center gap-3 text-left">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800">{candidate.initials}</span>
                        <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800 group-hover:text-emerald-800">{candidate.name}</span><span className="mt-1 block text-xs text-slate-500">{candidate.email}</span></span>
                      </button>
                    </td>
                    <td className="px-3 py-4"><span className="text-sm text-slate-700">{candidate.role}</span><span className="mt-1 block text-xs text-slate-400">{candidate.location}</span></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{candidate.applied}</td>
                    <td className="px-3 py-4"><label className="sr-only" htmlFor={`status-${candidate.id}`}>Status for {candidate.name}</label><select id={`status-${candidate.id}`} value={candidate.status} onChange={(event) => updateStatus(candidate.id, event.target.value as CandidateStatus)} className="cursor-pointer rounded-full border-0 bg-transparent py-1 pl-0 pr-6 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-200"><option value="New">New</option><option value="Screening">Screening</option><option value="Interview">Interview</option><option value="Offer">Offer</option><option value="Hired">Hired</option><option value="Rejected">Rejected</option></select></td>
                    <td className="px-3 py-4 text-sm text-slate-600">{candidate.experience}</td>
                    <td className="px-3 py-4 text-sm text-slate-500">{candidate.source}</td>
                    <td className="px-4 py-4 text-right"><button type="button" onClick={() => setActiveCandidate(candidate)} aria-label={`View ${candidate.name}`} className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50">View <ArrowUpRight className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center"><Search className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No candidates found</p><p className="mt-1 text-xs text-slate-500">Try another search or clear your filters.</p><button type="button" onClick={() => { setSearch(""); setStatusFilter("All statuses"); setRoleFilter("All roles"); }} className="mt-3 cursor-pointer text-xs font-semibold text-emerald-800 hover:text-emerald-950">Clear filters</button></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length} of {candidates.length} candidates</span><span className="inline-flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5" /> Demo data — connect your recruitment API for live records.</span></div>
        </section>

        {showAddForm && (
          <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddForm(false); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
            <section role="dialog" aria-modal="true" aria-labelledby="add-candidate-title" className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Recruitment</p><h2 id="add-candidate-title" className="mt-1 text-lg font-semibold text-slate-950">Add candidate</h2><p className="mt-1 text-sm text-slate-500">Add a candidate to this local demo list.</p></div><button type="button" aria-label="Close dialog" onClick={() => setShowAddForm(false)} className="cursor-pointer rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
              <form onSubmit={addCandidate} className="mt-5 space-y-4">
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Full name *</span><input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Candidate name" className={`${controlClass} w-full`} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Email address *</span><input required type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="name@example.com" className={`${controlClass} w-full`} /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Applied for</span><select value={newRole} onChange={(event) => setNewRole(event.target.value)} className={`${controlClass} w-full cursor-pointer`}>{Array.from(new Set(candidates.map((candidate) => candidate.role))).map((role) => <option key={role}>{role}</option>)}</select></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Location</span><input value={newLocation} onChange={(event) => setNewLocation(event.target.value)} placeholder="City, state or remote" className={`${controlClass} w-full`} /></label>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowAddForm(false)} className={`${controlClass} cursor-pointer`}>Cancel</button><button type="submit" className="inline-flex cursor-pointer items-center gap-2 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover"><Plus className="h-4 w-4" /> Add candidate</button></div>
              </form>
            </section>
          </div>
        )}

        {activeCandidate && (
          <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveCandidate(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
            <section role="dialog" aria-modal="true" aria-labelledby="candidate-details-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">{activeCandidate.initials}</span><div><h2 id="candidate-details-title" className="text-lg font-semibold text-slate-950">{activeCandidate.name}</h2><p className="mt-1 text-sm text-slate-500">{activeCandidate.role}</p></div></div><button type="button" aria-label="Close details" onClick={() => setActiveCandidate(null)} className="cursor-pointer rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
              <div className="mt-5 flex flex-wrap items-center gap-2"><StatusBadge status={activeCandidate.status} /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{activeCandidate.experience} experience</span></div>
              <div className="mt-5 grid gap-4 rounded-md bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Email</p><a href={`mailto:${activeCandidate.email}`} className="mt-1 inline-flex cursor-pointer items-center gap-2 break-all text-sm text-slate-700 hover:text-emerald-800"><Mail className="h-3.5 w-3.5 shrink-0" />{activeCandidate.email}</a></div><div><p className="text-xs text-slate-400">Location</p><p className="mt-1 text-sm text-slate-700">{activeCandidate.location}</p></div><div><p className="text-xs text-slate-400">Applied</p><p className="mt-1 text-sm text-slate-700">{activeCandidate.applied}</p></div><div><p className="text-xs text-slate-400">Source</p><p className="mt-1 text-sm text-slate-700">{activeCandidate.source}</p></div></div>
              <div className="mt-5"><label htmlFor="detail-status" className="mb-1.5 block text-xs font-medium text-slate-600">Update hiring stage</label><select id="detail-status" value={activeCandidate.status} onChange={(event) => { const status = event.target.value as CandidateStatus; updateStatus(activeCandidate.id, status); setActiveCandidate({ ...activeCandidate, status }); }} className={`${controlClass} w-full cursor-pointer`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><a href={`mailto:${activeCandidate.email}`} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Mail className="h-4 w-4" /> Email candidate</a><button type="button" onClick={() => setActiveCandidate(null)} className="cursor-pointer rounded-control bg-brand px-4 py-2 text-sm font-semibold text-text-inverse shadow-subtle hover:bg-brand-hover">Done</button></div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
