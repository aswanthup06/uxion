"use client";



import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiInfo,
  FiMapPin,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

const C = { bg: "#F4F8F2", ink: "#06231A", accent: "#0FA968", lime: "#C5FF6B" };
const EASE = [0.22, 1, 0.36, 1] as const;
const HARD = (n = 4) => `${n}px ${n}px 0 0 ${C.ink}`;

/* ------------------------- option lists ------------------------- */

// Values match schema.org employmentType, which is what Google reads.
const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERN", label: "Internship" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "PER_DIEM", label: "Per diem" },
  { value: "OTHER", label: "Other" },
];

const ARRANGEMENTS = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const PERIODS = [
  { value: "HOUR", label: "Hour" },
  { value: "DAY", label: "Day" },
  { value: "WEEK", label: "Week" },
  { value: "MONTH", label: "Month" },
  { value: "YEAR", label: "Year" },
];

const CURRENCIES = [
  { value: "INR", symbol: "₹" },
  { value: "USD", symbol: "$" },
  { value: "EUR", symbol: "€" },
  { value: "GBP", symbol: "£" },
  { value: "AED", symbol: "AED " },
];

const EDUCATION = [
  "No requirements",
  "High school",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Professional certificate",
  "Doctorate",
];

const CATEGORIES = [
  "UI/UX & Product Design",
  "Frontend Development",
  "Full-stack Development",
  "Mobile Development",
  "Data & AI",
  "DevOps & Cloud",
  "QA & Testing",
  "Cybersecurity",
  "Other",
];

const BENEFITS = [
  "Health insurance",
  "Remote work",
  "Flexible hours",
  "Paid leave",
  "Learning budget",
  "Performance bonus",
  "Equipment provided",
  "Provident fund",
];

const COUNTRIES = ["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore"];

const IN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry",
  "Jammu and Kashmir", "Ladakh",
];

const VALID_PRESETS = [30, 45, 60, 90];

const TEMPLATE = `About the role
Describe the team, the product and what this person will own.

Responsibilities
-
-
-

Requirements
-
-
-

Nice to have
-

How to apply
Email your resume and portfolio to the address on this listing.`;

/* ------------------------- form state ------------------------- */

type Form = {
  title: string;
  types: string[];
  arrangement: string;
  category: string;
  description: string;
  skills: string[];
  company: string;
  website: string;
  logo: string | null;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  remoteCountry: string;
  showSalary: boolean;
  currency: string;
  min: string;
  max: string;
  period: string;
  expYears: string;
  education: string;
  benefits: string[];
  applyMode: "email" | "url";
  email: string;
  applyUrl: string;
  directApply: boolean;
  validDays: number;
};

const INITIAL: Form = {
  title: "",
  types: ["FULL_TIME"],
  arrangement: "onsite",
  category: "",
  description: "",
  skills: [],
  company: "",
  website: "",
  logo: null,
  street: "",
  city: "",
  state: "",
  postal: "",
  country: "India",
  remoteCountry: "India",
  showSalary: true,
  currency: "INR",
  min: "",
  max: "",
  period: "YEAR",
  expYears: "",
  education: "",
  benefits: [],
  applyMode: "email",
  email: "",
  applyUrl: "",
  directApply: true,
  validDays: 45,
};

/* ------------------------- primitives ------------------------- */

const inputCls =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#06231A] focus:shadow-[3px_3px_0_0_#06231A]";
const inputBorder = { borderColor: "rgba(6,35,26,0.22)" };

function Badge({ kind }: { kind: "required" | "recommended" }) {
  return kind === "required" ? (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: C.ink, color: C.lime }}
    >
      Required
    </span>
  ) : (
    <span
      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600"
      style={{ borderColor: "rgba(6,35,26,0.25)" }}
    >
      Recommended
    </span>
  );
}

function Field({
  label,
  kind,
  hint,
  children,
  className = "",
  htmlFor,
}: {
  label: string;
  kind?: "required" | "recommended";
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {kind && <Badge kind={kind} />}
      </div>
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-neutral-500">{hint}</p>}
    </div>
  );
}

function Segmented({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const reduce = useReducedMotion();
  return (
    <div
      role="radiogroup"
      className="inline-flex flex-wrap gap-1 rounded-full border bg-white p-1"
      style={{ borderColor: "rgba(6,35,26,0.22)" }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className="relative rounded-full px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2"
            style={{ color: on ? C.lime : `${C.ink}B3`, ["--tw-ring-color" as string]: C.accent }}
          >
            {on && (
              <motion.span
                layoutId={`seg-${name}`}
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ background: C.ink }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className="inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2"
            style={{
              borderColor: on ? C.ink : "rgba(6,35,26,0.2)",
              background: on ? C.lime : "#fff",
              color: C.ink,
              boxShadow: on ? HARD(2) : "none",
              ["--tw-ring-color" as string]: C.accent,
            }}
          >
            {on && <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-neutral-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 shrink-0 rounded-full border-2 outline-none transition-colors focus-visible:ring-2"
        style={{
          borderColor: C.ink,
          background: checked ? C.lime : "#fff",
          ["--tw-ring-color" as string]: C.accent,
        }}
      >
        <motion.span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full"
          style={{ background: C.ink }}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </button>
    </div>
  );
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft("");
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2.5 transition-shadow focus-within:border-[#06231A] focus-within:shadow-[3px_3px_0_0_#06231A]"
      style={inputBorder}
    >
      <AnimatePresence initial={false}>
        {value.map((t) => (
          <motion.span
            key={t}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-medium"
            style={{ background: "rgba(197,255,107,0.55)", color: C.ink }}
          >
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => onChange(value.filter((v) => v !== t))}
              className="grid h-5 w-5 place-items-center rounded-full hover:bg-black/10"
            >
              <FiX className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "Add another…" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}

function LogoDrop({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed bg-white"
        style={{ borderColor: "rgba(6,35,26,0.3)" }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Company logo preview" className="h-full w-full object-contain" />
        ) : (
          <FiImage className="h-6 w-6 text-neutral-400" />
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (value) URL.revokeObjectURL(value);
            onChange(file ? URL.createObjectURL(file) : null);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ borderColor: C.ink }}
          >
            <FiUploadCloud /> {value ? "Replace logo" : "Upload logo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(value);
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:text-ink"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-neutral-500">Square PNG, JPG, SVG or WebP. At least 112×112 px.</p>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="rounded-3xl border bg-white p-6 sm:p-8"
      style={{ borderColor: "rgba(6,35,26,0.12)" }}
    >
      <header className="flex items-start gap-4">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
          style={{ background: C.ink, color: C.lime }}
        >
          {String(n).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{desc}</p>
        </div>
      </header>
      <div className="mt-7 space-y-6">{children}</div>
    </motion.section>
  );
}

/* ------------------------- page ------------------------- */

export default function PostJobPage() {
  const reduce = useReducedMotion();
  const [f, setF] = useState<Form>(INITIAL);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => setToday(new Date()), []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setF((p) => ({ ...p, [key]: value }));

  const isRemote = f.arrangement === "remote";
  const symbol = CURRENCIES.find((c) => c.value === f.currency)?.symbol ?? "";
  const num = (s: string) => (s ? new Intl.NumberFormat("en-IN").format(Number(s)) : "");

  const salaryText = useMemo(() => {
    if (!f.showSalary || (!f.min && !f.max)) return null;
    const per = f.period.toLowerCase();
    if (f.min && f.max) return `${symbol}${num(f.min)} – ${symbol}${num(f.max)} per ${per}`;
    if (f.max) return `Up to ${symbol}${num(f.max)} per ${per}`;
    return `From ${symbol}${num(f.min)} per ${per}`;
  }, [f.showSalary, f.min, f.max, f.period, symbol]);

  const validThrough = useMemo(() => {
    if (!today) return "";
    const d = new Date(today);
    d.setDate(d.getDate() + f.validDays);
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  }, [today, f.validDays]);

  const typeLabels = EMPLOYMENT_TYPES.filter((t) => f.types.includes(t.value)).map((t) => t.label);
  const locationOk = isRemote ? !!f.remoteCountry : !!(f.city.trim() && f.state.trim() && f.country);
  const applyOk = f.applyMode === "email" ? /\S+@\S+\.\S+/.test(f.email) : /^https?:\/\/\S+\.\S+/.test(f.applyUrl);

  /* Google for Jobs readiness */
  const checks = [
    { id: "title", label: "Job title", kind: "required" as const, done: f.title.trim().length > 2 },
    { id: "desc", label: "Full job description", kind: "required" as const, done: f.description.trim().length >= 120 },
    { id: "org", label: "Hiring company name", kind: "required" as const, done: f.company.trim().length > 1 },
    {
      id: "loc",
      label: isRemote ? "Where applicants can be based" : "Job location (city, state, country)",
      kind: "required" as const,
      done: locationOk,
    },
    { id: "posted", label: "Date posted (set automatically)", kind: "required" as const, done: true },
    { id: "valid", label: "Expiry date", kind: "recommended" as const, done: true },
    { id: "type", label: "Employment type", kind: "recommended" as const, done: f.types.length > 0 },
    { id: "pay", label: "Base salary", kind: "recommended" as const, done: !!salaryText },
    { id: "site", label: "Company website", kind: "recommended" as const, done: /^https?:\/\/\S+\.\S+/.test(f.website) },
    { id: "logo", label: "Company logo", kind: "recommended" as const, done: !!f.logo },
    { id: "apply", label: "How to apply", kind: "recommended" as const, done: applyOk },
    { id: "exp", label: "Experience or education", kind: "recommended" as const, done: !!f.expYears || !!f.education },
    { id: "skills", label: "Skills", kind: "recommended" as const, done: f.skills.length > 0 },
  ];
  const requiredLeft = checks.filter((c) => c.kind === "required" && !c.done).length;
  const doneCount = checks.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checks.length) * 100);

  const locationLine = isRemote
    ? `Remote · ${f.remoteCountry}`
    : [f.city, f.state].filter(Boolean).join(", ") || "Add a location";

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: C.bg }}>
      <datalist id="in-states">
        {IN_STATES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-6 sm:px-8 md:pb-16 md:pt-8">

        {/* Header */}
        <motion.header {...rise(0.06)} className="mt-6 max-w-2xl">
          <p
            className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: C.accent }}
          >
            <span className="h-px w-6" style={{ background: C.accent }} />
            For employers
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl">
            Post a job
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600 sm:text-lg">
            Fill in the details Google for Jobs looks for, so your listing can show up right in search results.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-2">
              <Badge kind="required" /> must be filled for Google to show the job
            </span>
            <span className="inline-flex items-center gap-2">
              <Badge kind="recommended" /> helps Google show a richer listing
            </span>
          </div>
        </motion.header>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
          {/* ------------------------- form ------------------------- */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
            {/* 1. Job details */}
            <Section n={1} title="Job details" desc="What the role is and who it's for.">
              <Field label="Job title" kind="required" htmlFor="title" hint="Use a clear title such as “Senior UI/UX Designer”. Avoid codes, locations or “urgent hiring”.">
                <input
                  id="title"
                  value={f.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. UI/UX Designer"
                  className={inputCls}
                  style={inputBorder}
                />
              </Field>

              <Field label="Employment type" kind="recommended" hint="Pick everything that applies.">
                <ChipSelect options={EMPLOYMENT_TYPES} value={f.types} onChange={(v) => set("types", v)} />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Work arrangement" kind="required">
                  <Segmented name="arrangement" value={f.arrangement} onChange={(v) => set("arrangement", v)} options={ARRANGEMENTS} />
                </Field>

                <Field label="Job category" htmlFor="category">
                  <select
                    id="category"
                    value={f.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={inputCls}
                    style={inputBorder}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Job description" kind="required" htmlFor="desc">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-neutral-500">Google shows the whole description, so include the details.</p>
                  <button
                    type="button"
                    onClick={() => set("description", f.description ? f.description : TEMPLATE)}
                    className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#F4F8F2]"
                    style={{ borderColor: "rgba(6,35,26,0.25)" }}
                  >
                    Insert template
                  </button>
                </div>
                <textarea
                  id="desc"
                  rows={12}
                  value={f.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="About the role, responsibilities, requirements…"
                  className={`${inputCls} resize-y leading-6`}
                  style={inputBorder}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={f.description.trim().length >= 120 ? "text-[#0FA968]" : "text-neutral-500"}>
                    {f.description.trim().length >= 120 ? "Good length" : "Aim for at least 120 characters"}
                  </span>
                  <span className="tabular-nums text-neutral-400">{f.description.length} chars</span>
                </div>
              </Field>

              <Field label="Skills" kind="recommended" hint="Press Enter or comma after each skill.">
                <TagInput value={f.skills} onChange={(v) => set("skills", v)} placeholder="Figma, React, TypeScript…" />
              </Field>
            </Section>

            {/* 2. Company */}
            <Section n={2} title="Hiring company" desc="Shown next to the job on Google.">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Company name" kind="required" htmlFor="company">
                  <input
                    id="company"
                    value={f.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="e.g. Daiviksoft Technologies"
                    className={inputCls}
                    style={inputBorder}
                  />
                </Field>
                <Field label="Company website" kind="recommended" htmlFor="website">
                  <input
                    id="website"
                    inputMode="url"
                    value={f.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://company.com"
                    className={inputCls}
                    style={inputBorder}
                  />
                </Field>
              </div>
              <Field label="Company logo" kind="recommended">
                <LogoDrop value={f.logo} onChange={(v) => set("logo", v)} />
              </Field>
            </Section>

            {/* 3. Location */}
            <Section
              n={3}
              title={isRemote ? "Where applicants can be based" : "Job location"}
              desc={isRemote ? "Google needs to know which country remote candidates may apply from." : "The real address of the workplace."}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isRemote ? (
                  <motion.div
                    key="remote"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <Field label="Applicants must be located in" kind="required" htmlFor="remoteCountry">
                      <select
                        id="remoteCountry"
                        value={f.remoteCountry}
                        onChange={(e) => set("remoteCountry", e.target.value)}
                        className={inputCls}
                        style={inputBorder}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <p className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs leading-relaxed text-neutral-700" style={{ background: "rgba(197,255,107,0.35)" }}>
                      <FiInfo className="mt-0.5 shrink-0" />
                      Remote jobs don&apos;t need a street address. Google marks them as “work from home”.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="onsite"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <Field label="Street address" kind="recommended" htmlFor="street">
                      <div className="relative">
                        <FiMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="street"
                          value={f.street}
                          onChange={(e) => set("street", e.target.value)}
                          placeholder="Building, street, area"
                          className={`${inputCls} pl-10`}
                          style={inputBorder}
                        />
                      </div>
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="City" kind="required" htmlFor="city">
                        <input id="city" value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Kochi" className={inputCls} style={inputBorder} />
                      </Field>
                      <Field label="State / region" kind="required" htmlFor="state">
                        <input id="state" list="in-states" value={f.state} onChange={(e) => set("state", e.target.value)} placeholder="Kerala" className={inputCls} style={inputBorder} />
                      </Field>
                      <Field label="Postal code" kind="recommended" htmlFor="postal">
                        <input id="postal" inputMode="numeric" value={f.postal} onChange={(e) => set("postal", e.target.value)} placeholder="682001" className={inputCls} style={inputBorder} />
                      </Field>
                      <Field label="Country" kind="required" htmlFor="country">
                        <select id="country" value={f.country} onChange={(e) => set("country", e.target.value)} className={inputCls} style={inputBorder}>
                          {COUNTRIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {f.arrangement === "hybrid" && (
                      <p className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs leading-relaxed text-neutral-700" style={{ background: "rgba(197,255,107,0.35)" }}>
                        <FiInfo className="mt-0.5 shrink-0" />
                        Google has no “hybrid” type, so hybrid jobs are listed with their office address.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            {/* 4. Pay & requirements */}
            <Section n={4} title="Pay & requirements" desc="Listings with a salary tend to get more attention.">
              <Toggle
                checked={f.showSalary}
                onChange={(v) => set("showSalary", v)}
                label="Show salary on the listing"
                hint="Adds baseSalary so Google can display the pay range."
              />

              <AnimatePresence initial={false}>
                {f.showSalary && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 pb-1 pt-1">
                      <div className="grid gap-4 sm:grid-cols-[110px_1fr_1fr]">
                        <Field label="Currency" htmlFor="currency">
                          <select id="currency" value={f.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls} style={inputBorder}>
                            {CURRENCIES.map((c) => (
                              <option key={c.value}>{c.value}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Minimum" htmlFor="min">
                          <input id="min" inputMode="numeric" value={f.min} onChange={(e) => set("min", e.target.value.replace(/\D/g, ""))} placeholder="300000" className={inputCls} style={inputBorder} />
                        </Field>
                        <Field label="Maximum" htmlFor="max">
                          <input id="max" inputMode="numeric" value={f.max} onChange={(e) => set("max", e.target.value.replace(/\D/g, ""))} placeholder="600000" className={inputCls} style={inputBorder} />
                        </Field>
                      </div>

                      <Field label="Paid per">
                        <Segmented name="period" value={f.period} onChange={(v) => set("period", v)} options={PERIODS} />
                      </Field>

                      <p className="text-xs text-neutral-500">
                        {salaryText ? (
                          <>
                            Google will show: <span className="font-semibold text-ink">{salaryText}</span>
                          </>
                        ) : (
                          "Enter a minimum, a maximum, or both."
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-px" style={{ background: "rgba(6,35,26,0.1)" }} />

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Experience needed (years)" kind="recommended" htmlFor="exp" hint="Sent to Google as months of experience.">
                  <input id="exp" inputMode="numeric" value={f.expYears} onChange={(e) => set("expYears", e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="2" className={inputCls} style={inputBorder} />
                </Field>
                <Field label="Education" kind="recommended" htmlFor="edu">
                  <select id="edu" value={f.education} onChange={(e) => set("education", e.target.value)} className={inputCls} style={inputBorder}>
                    <option value="">Not specified</option>
                    {EDUCATION.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Benefits" hint="Optional perks shown with the job.">
                <ChipSelect options={BENEFITS.map((b) => ({ value: b, label: b }))} value={f.benefits} onChange={(v) => set("benefits", v)} />
              </Field>
            </Section>

            {/* 5. Apply */}
            <Section n={5} title="How to apply" desc="Where candidates should send their application.">
              <Field label="Apply via" kind="recommended">
                <Segmented
                  name="applyMode"
                  value={f.applyMode}
                  onChange={(v) => set("applyMode", v as Form["applyMode"])}
                  options={[
                    { value: "email", label: "HR email" },
                    { value: "url", label: "Career page link" },
                  ]}
                />
              </Field>

              {f.applyMode === "email" ? (
                <Field label="HR email" kind="recommended" htmlFor="email" hint="This address is shown publicly on the listing. Use a shared inbox if you can.">
                  <input id="email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="hr@company.com" className={inputCls} style={inputBorder} />
                </Field>
              ) : (
                <Field label="Application link" kind="recommended" htmlFor="applyUrl">
                  <input id="applyUrl" inputMode="url" value={f.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} placeholder="https://company.com/careers/ui-ux-designer" className={inputCls} style={inputBorder} />
                </Field>
              )}

              <Toggle
                checked={f.directApply}
                onChange={(v) => set("directApply", v)}
                label="Direct apply"
                hint="Candidates can apply without leaving the listing page. Google prefers jobs it can verify this way."
              />
            </Section>

            {/* 6. Dates */}
            <Section n={6} title="Listing dates" desc="Google removes expired jobs, so set an end date.">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Date posted" kind="required">
                  <p className="rounded-xl border bg-[#F4F8F2] px-4 py-3 text-sm text-neutral-600" style={inputBorder}>
                    Today, set automatically
                  </p>
                </Field>
                <Field label="Valid through" kind="recommended">
                  <p className="rounded-xl border bg-[#F4F8F2] px-4 py-3 text-sm font-semibold text-ink" style={inputBorder}>
                    {validThrough || "…"}
                  </p>
                </Field>
              </div>

              <Field label="Keep this listing live for">
                <Segmented
                  name="valid"
                  value={String(f.validDays)}
                  onChange={(v) => set("validDays", Number(v))}
                  options={VALID_PRESETS.map((d) => ({ value: String(d), label: `${d} days` }))}
                />
              </Field>
            </Section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="rounded-full border-2 bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#F4F8F2]"
                style={{ borderColor: "rgba(6,35,26,0.25)", color: C.ink }}
              >
                Save draft
              </button>
              <button
                type="button"
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px]"
                style={{ background: C.lime, borderColor: C.ink, color: C.ink, boxShadow: HARD(4) }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = HARD(1))}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = HARD(4))}
              >
                Publish job
              </button>
            </div>
          </form>

          {/* ------------------------- side: readiness + preview ------------------------- */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            {/* Readiness */}
            <div className="rounded-3xl border-2 bg-white p-6" style={{ borderColor: C.ink, boxShadow: HARD(5) }}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-ink">Google for Jobs</h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={requiredLeft === 0 ? "ok" : "todo"}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: requiredLeft === 0 ? C.lime : "rgba(6,35,26,0.08)",
                      color: C.ink,
                    }}
                  >
                    {requiredLeft === 0 ? "Ready to publish" : `${requiredLeft} required left`}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(6,35,26,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: C.accent }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {doneCount} of {checks.length} fields complete
              </p>

              <ul className="mt-5 space-y-2.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 text-sm">
                    <motion.span
                      animate={{ scale: c.done ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2"
                      style={{
                        borderColor: c.done ? C.accent : "rgba(6,35,26,0.25)",
                        background: c.done ? C.accent : "transparent",
                        color: "#fff",
                      }}
                    >
                      {c.done && <FiCheck className="h-3 w-3" strokeWidth={3.5} />}
                    </motion.span>
                    <span className={c.done ? "text-neutral-500" : "text-ink"}>{c.label}</span>
                    {c.kind === "required" && !c.done && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.accent }}>
                        Required
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Live preview */}
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Live preview
              </p>
              <div className="rounded-3xl border bg-white p-5" style={{ borderColor: "rgba(6,35,26,0.15)" }}>
                <div className="flex items-start gap-3.5">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl text-lg font-bold"
                    style={{ background: C.lime, color: C.ink }}
                  >
                    {f.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.logo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      f.company.trim().charAt(0).toUpperCase() || "Z"
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[17px] font-semibold leading-tight text-ink">
                      {f.title.trim() || "Job title"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-neutral-600">{f.company.trim() || "Company name"}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500">
                      <FiMapPin className="shrink-0" /> {locationLine}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...typeLabels, f.expYears ? `${f.expYears}+ yrs` : null, ARRANGEMENTS.find((a) => a.value === f.arrangement)?.label]
                    .filter(Boolean)
                    .map((t) => (
                      <span key={t as string} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: C.bg }}>
                        {t}
                      </span>
                    ))}
                </div>

                {salaryText && <p className="mt-3 text-sm font-semibold text-ink">{salaryText}</p>}

                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-neutral-500" style={{ borderColor: "rgba(6,35,26,0.1)" }}>
                  <span>Apply before {validThrough || "…"}</span>
                  <span className="rounded-full px-3 py-1.5 font-semibold" style={{ background: C.ink, color: C.lime }}>
                    Apply
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}