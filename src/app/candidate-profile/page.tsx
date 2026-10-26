"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, FileText, Plus, Save, UserRound, X } from "lucide-react";

const inputClass = "mt-1.5 w-full rounded-control border border-border-default bg-surface-card px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring";
const labelClass = "text-xs font-medium text-text-secondary";
const sectionClass = "rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-subtle";

type Experience = { role: string; company: string; location: string; start: string; end: string; current: boolean; description: string };
type Education = { degree: string; institution: string; field: string; start: string; end: string; grade: string };
type Project = { name: string; link: string; description: string };

const blankExperience: Experience = { role: "", company: "", location: "", start: "", end: "", current: false, description: "" };
const blankEducation: Education = { degree: "", institution: "", field: "", start: "", end: "", grade: "" };
const blankProject: Project = { name: "", link: "", description: "" };

function Field({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}{required && <span className="ml-1 text-status-error">*</span>}</span><input className={inputClass} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} /></label>;
}
function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span><span className="relative block"><select className={`${inputClass} cursor-pointer appearance-none pr-9`} value={value} onChange={e => onChange(e.target.value)}>{placeholder && <option value="">{placeholder}</option>}{options.map(x => <option key={x}>{x}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /></span></label>;
}
function TextArea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}</span><textarea className={`${inputClass} resize-y`} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
function Heading({ n, title, description }: { n: string; title: string; description: string }) {
  return <div className="mb-5 flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-brand-soft text-xs font-semibold text-brand">{n}</span><div><h2 className="text-base font-semibold text-text-primary">{title}</h2><p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p></div></div>;
}

export default function CandidateProfilePage() {
  const [notice, setNotice] = useState(false);
  const [personal, setPersonal] = useState({ firstName: "", lastName: "", email: "", phone: "", location: "", dob: "", headline: "", summary: "", linkedin: "", github: "", portfolio: "" });
  const [career, setCareer] = useState({ title: "", level: "", type: "Full-time", mode: "Hybrid", salary: "", salaryPeriod: "Per month", notice: "", availability: "", locations: "", relocate: "No" });
  const [experiences, setExperiences] = useState<Experience[]>([{ ...blankExperience }]);
  const [education, setEducation] = useState<Education[]>([{ ...blankEducation }]);
  const [projects, setProjects] = useState<Project[]>([{ ...blankProject }]);
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [certifications, setCertifications] = useState("");
  const [resume, setResume] = useState("");
  const [visible, setVisible] = useState(true);

  const setP = (key: keyof typeof personal, value: string) => { setPersonal(p => ({ ...p, [key]: value })); setNotice(false); };
  const setC = (key: keyof typeof career, value: string) => { setCareer(p => ({ ...p, [key]: value })); setNotice(false); };
  const reset = () => {
    setPersonal({ firstName: "", lastName: "", email: "", phone: "", location: "", dob: "", headline: "", summary: "", linkedin: "", github: "", portfolio: "" });
    setCareer({ title: "", level: "", type: "Full-time", mode: "Hybrid", salary: "", salaryPeriod: "Per month", notice: "", availability: "", locations: "", relocate: "No" });
    setExperiences([{ ...blankExperience }]); setEducation([{ ...blankEducation }]); setProjects([{ ...blankProject }]);
    setSkills(""); setLanguages(""); setCertifications(""); setResume(""); setVisible(true); setNotice(false);
  };

  return <div className="min-h-screen bg-surface-page text-text-primary">
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/jobs" className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand"><ArrowLeft className="h-4 w-4" />Back to jobs</Link>
        <span className="inline-flex items-center gap-2 text-xs text-text-muted"><span className="h-2 w-2 rounded-full bg-brand" />Candidate profile</span>
      </div>
      <header className="mb-6 flex flex-col justify-between gap-5 border-b border-border-default pb-6 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Your career, clearly presented</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Candidate profile</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">Add your details, experience, skills and preferences so employers can understand what you bring to the role.</p></div>
        <div className="grid h-12 w-12 place-items-center self-start rounded-full border border-border-default bg-brand-soft text-brand sm:self-auto"><UserRound className="h-5 w-5" /></div>
      </header>

      {notice && <div role="status" className="mb-5 flex gap-3 rounded-control border border-brand-light bg-brand-soft px-4 py-3 text-sm text-brand-dark"><Check className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">Profile form completed</p><p className="mt-1 text-brand-dark">This demo currently holds data in page state only. Connect it to your API to save the profile permanently.</p></div><button type="button" aria-label="Dismiss" onClick={() => setNotice(false)} className="ml-auto cursor-pointer"><X className="h-4 w-4" /></button></div>}

      <form className="space-y-5" onSubmit={e => { e.preventDefault(); setNotice(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <section className={sectionClass}><Heading n="01" title="Personal information" description="Your basic details and a short professional introduction." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="First name" value={personal.firstName} onChange={v => setP("firstName", v)} placeholder="First name" required />
            <Field label="Last name" value={personal.lastName} onChange={v => setP("lastName", v)} placeholder="Last name" required />
            <Field label="Professional headline" value={personal.headline} onChange={v => setP("headline", v)} placeholder="e.g. Frontend Developer" required />
            <Field label="Email address" value={personal.email} onChange={v => setP("email", v)} type="email" placeholder="you@example.com" required />
            <Field label="Phone number" value={personal.phone} onChange={v => setP("phone", v)} type="tel" placeholder="+91 ..." />
            <Field label="Current location" value={personal.location} onChange={v => setP("location", v)} placeholder="City, state, country" />
            <Field label="Date of birth (optional)" value={personal.dob} onChange={v => setP("dob", v)} type="date" />
          </div>
          <div className="mt-4"><TextArea label="Professional summary" value={personal.summary} onChange={v => setP("summary", v)} placeholder="Introduce yourself, your strengths, experience and the kind of work you do best." rows={5} /></div>
        </section>

        <section className={sectionClass}><Heading n="02" title="Career preferences" description="Tell employers what roles and working arrangements suit you." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Desired job title" value={career.title} onChange={v => setC("title", v)} placeholder="e.g. UI/UX Designer" />
            <SelectField label="Experience level" value={career.level} onChange={v => setC("level", v)} placeholder="Select level" options={["Student", "Fresher", "Entry level", "1–3 years", "3–5 years", "5–8 years", "8+ years"]} />
            <SelectField label="Employment type" value={career.type} onChange={v => setC("type", v)} options={["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary"]} />
            <SelectField label="Work preference" value={career.mode} onChange={v => setC("mode", v)} options={["On-site", "Hybrid", "Remote", "Flexible"]} />
            <Field label="Expected salary" value={career.salary} onChange={v => setC("salary", v)} placeholder="e.g. 45000" />
            <SelectField label="Salary period" value={career.salaryPeriod} onChange={v => setC("salaryPeriod", v)} options={["Per month", "Per year", "Per hour", "Negotiable"]} />
            <SelectField label="Notice period" value={career.notice} onChange={v => setC("notice", v)} placeholder="Select notice period" options={["Immediate", "15 days", "30 days", "45 days", "60 days", "90 days", "Negotiable"]} />
            <SelectField label="Availability" value={career.availability} onChange={v => setC("availability", v)} placeholder="Select availability" options={["Immediately", "Within 2 weeks", "Within a month", "Not currently looking"]} />
            <SelectField label="Open to relocation?" value={career.relocate} onChange={v => setC("relocate", v)} options={["Yes", "No", "Depends on the opportunity"]} />
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Preferred locations" value={career.locations} onChange={v => setC("locations", v)} placeholder="e.g. Kochi, Bengaluru, Remote" /></div>
          </div>
        </section>

        <section className={sectionClass}><Heading n="03" title="Work experience" description="Add current and previous roles, starting with the most recent." />
          <div className="space-y-4">{experiences.map((item, i) => <div key={i} className="rounded-card border border-border-default p-4">
            <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">Experience {i + 1}</p>{experiences.length > 1 && <button type="button" onClick={() => setExperiences(a => a.filter((_, j) => i !== j))} className="inline-flex cursor-pointer items-center gap-1 text-xs text-text-muted hover:text-status-error"><X className="h-3.5 w-3.5" />Remove</button>}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Job title" value={item.role} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,role:v}:x))} placeholder="Job title" />
              <Field label="Company" value={item.company} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,company:v}:x))} placeholder="Company name" />
              <Field label="Location" value={item.location} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,location:v}:x))} placeholder="City or remote" />
              <Field label="Start date" value={item.start} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,start:v}:x))} type="month" />
              {!item.current && <Field label="End date" value={item.end} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,end:v}:x))} type="month" />}
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-text-secondary"><input type="checkbox" className="h-4 w-4 cursor-pointer accent-brand" checked={item.current} onChange={e => setExperiences(a => a.map((x,j) => i===j?{...x,current:e.target.checked,end:e.target.checked?"":x.end}:x))} />I currently work here</label>
            <div className="mt-4"><TextArea label="Responsibilities and achievements" value={item.description} onChange={v => setExperiences(a => a.map((x,j) => i===j?{...x,description:v}:x))} placeholder="Describe responsibilities, results, tools and achievements." rows={3} /></div>
          </div>)}</div>
          <button type="button" onClick={() => setExperiences(a => [...a,{...blankExperience}])} className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"><Plus className="h-4 w-4" />Add experience</button>
        </section>

        <section className={sectionClass}><Heading n="04" title="Education" description="Include degrees, courses and other relevant qualifications." />
          <div className="space-y-4">{education.map((item,i) => <div key={i} className="rounded-card border border-border-default p-4">
            <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">Education {i+1}</p>{education.length>1 && <button type="button" onClick={() => setEducation(a=>a.filter((_,j)=>i!==j))} className="inline-flex cursor-pointer items-center gap-1 text-xs text-text-muted hover:text-status-error"><X className="h-3.5 w-3.5"/>Remove</button>}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Qualification / degree" value={item.degree} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,degree:v}:x))} placeholder="e.g. B.Tech"/>
              <Field label="Institution" value={item.institution} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,institution:v}:x))} placeholder="College or university"/>
              <Field label="Field of study" value={item.field} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,field:v}:x))} placeholder="e.g. Computer Science"/>
              <Field label="Start year" value={item.start} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,start:v}:x))} placeholder="2021"/>
              <Field label="End year" value={item.end} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,end:v}:x))} placeholder="2025 or Present"/>
              <Field label="Grade / GPA" value={item.grade} onChange={v=>setEducation(a=>a.map((x,j)=>i===j?{...x,grade:v}:x))} placeholder="Optional"/>
            </div>
          </div>)}</div>
          <button type="button" onClick={() => setEducation(a=>[...a,{...blankEducation}])} className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"><Plus className="h-4 w-4"/>Add education</button>
        </section>

        <section className={sectionClass}><Heading n="05" title="Skills and languages" description="Use specific skills that match your target roles." />
          <div className="grid gap-4 lg:grid-cols-2"><TextArea label="Skills" value={skills} onChange={setSkills} placeholder="React, TypeScript, Figma, communication, project management…" rows={4}/><TextArea label="Languages and proficiency" value={languages} onChange={setLanguages} placeholder="Malayalam — Native; English — Professional; Hindi — Conversational…" rows={4}/></div>
        </section>

        <section className={sectionClass}><Heading n="06" title="Projects and portfolio work" description="Show personal projects, client work, open-source contributions or case studies." />
          <div className="space-y-4">{projects.map((item,i)=><div key={i} className="rounded-card border border-border-default p-4">
            <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">Project {i+1}</p>{projects.length>1&&<button type="button" onClick={()=>setProjects(a=>a.filter((_,j)=>i!==j))} className="inline-flex cursor-pointer items-center gap-1 text-xs text-text-muted hover:text-status-error"><X className="h-3.5 w-3.5"/>Remove</button>}</div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Project name" value={item.name} onChange={v=>setProjects(a=>a.map((x,j)=>i===j?{...x,name:v}:x))} placeholder="Project title"/><Field label="Project link" value={item.link} onChange={v=>setProjects(a=>a.map((x,j)=>i===j?{...x,link:v}:x))} placeholder="https://..." type="url"/><div className="sm:col-span-2"><TextArea label="Project description and your contribution" value={item.description} onChange={v=>setProjects(a=>a.map((x,j)=>i===j?{...x,description:v}:x))} placeholder="What did you build? What tools did you use? What was the outcome?" rows={3}/></div></div>
          </div>)}</div>
          <button type="button" onClick={()=>setProjects(a=>[...a,{...blankProject}])} className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"><Plus className="h-4 w-4"/>Add project</button>
        </section>

        <section className={sectionClass}><Heading n="07" title="Certifications and achievements" description="Add certificates, awards, courses, publications or career highlights."/><TextArea label="Certifications and achievements" value={certifications} onChange={setCertifications} placeholder="One item per line. Include issuer and year when relevant." rows={4}/></section>

        <section className={sectionClass}><Heading n="08" title="Resume and online profiles" description="Help recruiters review your resume and professional work."/>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block cursor-pointer"><span className={labelClass}>Upload resume (PDF, DOC, DOCX)</span><span className="mt-1.5 flex min-h-24 items-center gap-3 rounded-control border border-dashed border-border-default px-4 py-4 hover:border-brand hover:bg-brand-soft/40"><span className="grid h-10 w-10 place-items-center rounded-control bg-brand-soft text-brand"><FileText className="h-5 w-5"/></span><span className="min-w-0"><span className="block text-sm font-medium text-text-primary">Choose a resume file</span><span className="mt-1 block break-all text-xs text-text-muted">{resume||"No file selected"}</span></span></span><input className="sr-only" type="file" accept=".pdf,.doc,.docx" onChange={e=>setResume(e.target.files?.[0]?.name||"")}/></label>
            <div className="grid gap-4"><Field label="LinkedIn profile" value={personal.linkedin} onChange={v=>setP("linkedin",v)} placeholder="https://linkedin.com/in/..." type="url"/><Field label="GitHub profile" value={personal.github} onChange={v=>setP("github",v)} placeholder="https://github.com/..." type="url"/><Field label="Portfolio / personal website" value={personal.portfolio} onChange={v=>setP("portfolio",v)} placeholder="https://..." type="url"/></div>
          </div><p className="mt-3 text-xs leading-5 text-text-muted">This sample stores the selected filename only. Connect your secure file-upload endpoint to upload the resume.</p>
        </section>

        <section className={sectionClass}><Heading n="09" title="Privacy and visibility" description="Set your preference for profile visibility when account settings are connected."/>
          <label className="flex cursor-pointer items-start gap-3 rounded-control bg-surface-subtle p-4"><input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-brand"/><span><span className="block text-sm font-medium text-text-primary">Allow employers to view my profile</span><span className="mt-1 block text-sm leading-6 text-text-muted">This preference is UI-only until it is saved to your account. Avoid including sensitive personal details employers do not need.</span></span></label>
        </section>

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-border-default bg-surface-base/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-1"><div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-text-muted">Fields marked <span className="text-status-error">*</span> are required.</p><div className="flex flex-col-reverse gap-2 sm:flex-row"><button type="button" onClick={reset} className="cursor-pointer rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-subtle">Reset form</button><button type="submit" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-hover shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><Save className="h-4 w-4"/>Complete profile</button></div></div></div>
      </form>
      <footer className="mt-8 border-t border-border-default pt-5 text-xs text-text-muted"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p>Keep your profile clear, accurate and up to date.</p><Link href="/jobs" className="inline-flex cursor-pointer items-center gap-1 font-medium text-brand hover:text-brand-hover">Explore jobs <ArrowUpRight className="h-3.5 w-3.5"/></Link></div></footer>
    </div>
  </div>;
}
