"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Banknote,
  Mail,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Plus,
  X,
  Check,
  Compass,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  Wand2,
  ChevronDown,
  Zap,
  MapPin,
  HelpCircle,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import { State, City } from "country-state-city";
import { JOB_CATEGORIES, matchJobCategory } from "@/data/categories";
import {
  CANONICAL_CITIES,
  INDIAN_STATES,
  normalizeWorkMode,
  type RemoteEligibilityType,
} from "@/lib/supabase/locations-data";
import type { Job } from "@/app/types/job";

// Pre-index India cities and states from country-state-city
const CSC_STATES = State.getStatesOfCountry("IN") || [];
const CSC_STATE_MAP = new Map(CSC_STATES.map((s) => [s.isoCode, s.name]));
const CSC_CITIES = (City.getCitiesOfCountry("IN") || []).map((c) => ({
  name: c.name,
  state: CSC_STATE_MAP.get(c.stateCode) || c.stateCode,
  countryCode: "IN",
}));

export function resolveOfficeState(cityName: string): string {
  if (!cityName) return "";
  const cityLower = cityName.trim().toLowerCase();
  const canonical = CANONICAL_CITIES.find(
    (c) => c.name.toLowerCase() === cityLower || c.aliases?.some((a) => a.toLowerCase() === cityLower)
  );
  if (canonical?.state) return canonical.state;

  const csc = CSC_CITIES.find((c) => c.name.toLowerCase() === cityLower);
  return csc?.state || "";
}

export function getOfficeStates(offices: OfficeLocation[]): string[] {
  const states: string[] = [];
  for (const o of offices) {
    let st = (o.state || "").trim();
    if (!st && o.city) {
      st = resolveOfficeState(o.city);
    }
    if (st && !states.some((existing) => existing.toLowerCase() === st.toLowerCase())) {
      states.push(st);
    }
  }
  return states;
}

export type CandidatePreference =
  | "COMPANY_STATE"
  | "ALL_INDIA"
  | "EXACT_LOCATION"
  | "SPECIFIC_LOCATION"
  | "WORLDWIDE";

export interface OfficeLocation {
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

export interface PreferredTarget {
  name: string;
  type: "city" | "state";
  state?: string;
}

export interface JobFormState {
  title: string;
  company: string;
  category?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
  workMode: "Onsite" | "Hybrid" | "Remote";
  location: string;
  selectedOffices: OfficeLocation[];
  candidatePreference: CandidatePreference;
  preferredTargets: PreferredTarget[];
  remoteEligibilityType: RemoteEligibilityType;
  remoteEligibilityCountries: string[];
  hqLocation: string;
  experienceMin: string;
  experienceMax: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  description: string;
}

interface JobFormWizardProps {
  mode: "create" | "edit" | "public";
  jobId?: string;
  initialJob?: Job | null;
}

const inputClass =
  "w-full rounded-control border border-border-default bg-surface-card px-3.5 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-subtle";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-text-secondary";

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
  min,
  max,
  step,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ElementType;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
  error?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-status-error">*</span>}
      </label>

      <div className="group relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${error
                ? "text-status-error"
                : "text-text-muted group-focus-within:text-brand"
              }`}
            strokeWidth={1.8}
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`${inputClass} ${Icon ? "pl-10" : ""} ${error
              ? "border-status-error ring-1 ring-status-error/30 focus:border-status-error focus:ring-status-error/40"
              : ""
            }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-status-error animate-in fade-in duration-150">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function CompanyCitySelector({
  onSelect,
  placeholder = "Type city name (e.g. Bengaluru, Kochi, Mumbai)...",
}: {
  onSelect: (office: OfficeLocation) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { city: "Bengaluru", state: "Karnataka", country: "India", countryCode: "IN" },
        { city: "Kochi", state: "Kerala", country: "India", countryCode: "IN" },
        { city: "Mumbai", state: "Maharashtra", country: "India", countryCode: "IN" },
        { city: "Hyderabad", state: "Telangana", country: "India", countryCode: "IN" },
        { city: "Pune", state: "Maharashtra", country: "India", countryCode: "IN" },
        { city: "Delhi NCR", state: "Delhi", country: "India", countryCode: "IN" },
        { city: "Gurugram", state: "Haryana", country: "India", countryCode: "IN" },
        { city: "Noida", state: "Uttar Pradesh", country: "India", countryCode: "IN" },
        { city: "Chennai", state: "Tamil Nadu", country: "India", countryCode: "IN" },
        { city: "Trivandrum", state: "Kerala", country: "India", countryCode: "IN" },
      ];
    }

    const results: OfficeLocation[] = [];
    const seen = new Set<string>();

    for (const c of CANONICAL_CITIES) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      ) {
        seen.add(c.name.toLowerCase());
        results.push({ city: c.name, state: c.state, country: "India", countryCode: "IN" });
      }
    }

    for (const c of CSC_CITIES) {
      if (results.length >= 15) break;
      if (!seen.has(c.name.toLowerCase()) && c.name.toLowerCase().includes(q)) {
        seen.add(c.name.toLowerCase());
        results.push({ city: c.name, state: c.state, country: "India", countryCode: "IN" });
      }
    }

    return results;
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Building2
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.8}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`${inputClass} pl-10`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-control border border-border-default bg-surface-card shadow-modal">
          {suggestions.map((item, idx) => (
            <button
              key={`${item.city}-${item.state}-${idx}`}
              type="button"
              onClick={() => {
                onSelect(item);
                setQuery("");
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-surface-subtle"
            >
              <span className="font-semibold text-text-primary">{item.city}</span>
              <span className="text-[11px] text-text-muted">{item.state}, India</span>
            </button>
          ))}
          {query.trim() && !suggestions.some((s) => s.city.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={() => {
                const trimmedCity = query.trim();
                onSelect({
                  city: trimmedCity,
                  state: resolveOfficeState(trimmedCity),
                  country: "India",
                  countryCode: "IN",
                });
                setQuery("");
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-1.5 border-t border-border-default px-3.5 py-2 text-left text-xs text-brand hover:bg-brand-soft"
            >
              <Plus size={13} />
              <span>Add &quot;{query.trim()}&quot; as custom city</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CandidateScopeSelector({
  onAdd,
  placeholder = "Search candidate city or state...",
}: {
  onAdd: (target: PreferredTarget) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { name: "Karnataka", type: "state" as const },
        { name: "Kerala", type: "state" as const },
        { name: "Maharashtra", type: "state" as const },
        { name: "Tamil Nadu", type: "state" as const },
        { name: "Telangana", type: "state" as const },
        { name: "Bengaluru", type: "city" as const, state: "Karnataka" },
        { name: "Kochi", type: "city" as const, state: "Kerala" },
        { name: "Mumbai", type: "city" as const, state: "Maharashtra" },
        { name: "Hyderabad", type: "city" as const, state: "Telangana" },
      ];
    }

    const items: PreferredTarget[] = [];
    const seen = new Set<string>();

    for (const s of INDIAN_STATES) {
      if (s.name.toLowerCase().includes(q)) {
        seen.add(s.name.toLowerCase());
        items.push({ name: s.name, type: "state" });
      }
    }

    for (const c of CANONICAL_CITIES) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      ) {
        seen.add(c.name.toLowerCase());
        items.push({ name: c.name, type: "city", state: c.state });
      }
    }

    return items.slice(0, 15);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Compass
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.8}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`${inputClass} pl-10`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-control border border-border-default bg-surface-card shadow-modal">
          {results.map((item, idx) => (
            <button
              key={`${item.name}-${item.type}-${idx}`}
              type="button"
              onClick={() => {
                onAdd(item);
                setQuery("");
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-surface-subtle"
            >
              <span className="font-semibold text-text-primary">{item.name}</span>
              <span className="text-[11px] text-text-muted">
                {item.type === "state" ? "State, India" : `${item.state}, India`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatExperienceLabel(minVal: string, maxVal: string): string {
  const minNum = minVal.trim() === "" ? 0 : Number(minVal);
  const hasMax = maxVal.trim() !== "";
  const maxNum = hasMax ? Number(maxVal) : null;

  if (minNum === 0 && (maxNum === null || maxNum === 0)) {
    return "Fresher";
  }
  if (minNum === 0 && maxNum !== null && maxNum > 0) {
    return `0–${maxNum} years`;
  }
  if (maxNum !== null && maxNum > minNum) {
    return `${minNum}–${maxNum} years`;
  }
  if (maxNum !== null && maxNum === minNum) {
    return `${minNum} year${minNum === 1 ? "" : "s"}`;
  }
  return `${minNum}+ years`;
}

function parseExperienceFromJob(job: Job): { min: string; max: string } {
  const value = (job.experience || "").trim();
  if (!value || /^fresher$/i.test(value)) {
    return { min: "0", max: "0" };
  }
  const range = value.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) {
    return { min: range[1], max: range[2] };
  }
  const plus = value.match(/(\d+(?:\.\d+)?)\s*\+/);
  if (plus) {
    return { min: plus[1], max: "" };
  }
  const single = value.match(/(\d+(?:\.\d+)?)/);
  if (single) {
    return { min: single[1], max: single[1] };
  }
  return { min: "0", max: "0" };
}


function computeSubmitPostedDate(
  formPostedDate: string,
  todayStr: string,
  mode: string,
  initialJobPostedDate?: string
): string {
  if (mode === "edit" && initialJobPostedDate) {
    const initialInputDate = dateForInput(initialJobPostedDate);
    if (initialInputDate === formPostedDate) {
      const isMidnight =
        /T00:00:00(\.000)?Z?$/i.test(initialJobPostedDate) ||
        /00:00:00/.test(initialJobPostedDate);
      if (formPostedDate === todayStr && isMidnight) {
        return new Date().toISOString();
      }
      return initialJobPostedDate;
    }
  }

  if (formPostedDate === todayStr) {
    return new Date().toISOString();
  }

  return new Date(`${formPostedDate}T12:00:00.000Z`).toISOString();
}

function dateForInput(value?: string): string {
  if (!value) return "";
  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

const WIZARD_STEPS = [
  {
    num: 1,
    tag: "01",
    label: "Role",
    brief: "Job title, company & type",
  },
  {
    num: 2,
    tag: "02",
    label: "Location",
    brief: "Offices & candidate residency",
  },
  {
    num: 3,
    tag: "03",
    label: "Compensation",
    brief: "Experience, salary & contact email",
  },
  {
    num: 4,
    tag: "04",
    label: "Review",
    brief: "Job description & publish",
  },
];

const SAMPLE_JOB_DESCRIPTION = `Role: Senior Frontend Engineer
Company: Zenoway Tech
Location: Bengaluru, Karnataka (Hybrid)
Employment Type: Full-time
Experience: 3 to 6 years
Salary: ₹18,00,000 - ₹26,00,000 per annum
Contact Email: careers@zenoway.online

About the Role:
We are looking for an experienced Senior Frontend Engineer to build high-performance web applications using Next.js, React, and TypeScript. You will collaborate closely with UI/UX designers and backend engineers to craft responsive, accessible interfaces.

Key Responsibilities:
- Build modular, accessible web interfaces using Next.js App Router and Tailwind CSS.
- Optimize web application performance, Core Web Vitals, and responsive layouts.
- Collaborate with product designers in Figma to implement design systems and reusable components.

Requirements:
- 3+ years of experience with React, Next.js, and TypeScript.
- Strong knowledge of modern CSS, Tailwind, state management, and web performance.
- Passion for great developer experience, automated testing, and semantic HTML.`;

const applicants = [
  { initials: "AR", name: "Anjali R.", role: "React Developer", time: "just now" },
  { initials: "RM", name: "Rahul M.", role: "Product Designer", time: "2m ago" },
  { initials: "SK", name: "Sneha K.", role: "Backend Engineer", time: "5m ago" },
];

function HeroVisual() {
  return (
    <div aria-hidden className="relative hidden h-[380px] lg:block">
      {/* Soft brand glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl" />

      {/* Dot grid, faded at edges. If the --border-default token is not an RGB triplet, use rgba(120,120,120,0.35) instead. */}
      <div
        className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(closest-side,black,transparent)]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(120,120,120,0.35) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Floating job card */}
      <div className="hero-anim absolute right-4 top-4 w-[300px] animate-[float_7s_ease-in-out_infinite] rounded-2xl border border-border-default/50 bg-surface-card/80 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-muted">New opening</span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-brand">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            Live
          </span>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-text-primary">Senior UI Developer</h3>
        <p className="mt-0.5 text-xs text-text-muted">Kochi · Hybrid · ₹18–26 LPA</p>
        <div className="mt-3 flex gap-1.5">
          {["React", "Next.js", "Tailwind"].map((t) => (
            <span key={t} className="rounded-full border border-border-default/50 px-2 py-0.5 text-[10px] text-text-secondary">{t}</span>
          ))}
        </div>
      </div>

      {/* Applicants sliding in */}
      <div className="absolute bottom-6 left-0 w-[290px] space-y-2.5">
        {applicants.map((a, i) => (
          <div
            key={a.name}
            className="hero-anim flex animate-[slide-in_0.6s_ease-out_both] items-center gap-3 rounded-xl border border-border-default/50 bg-surface-card/90 p-2.5 shadow-subtle backdrop-blur"
            style={{ animationDelay: `${0.5 + i * 0.35}s` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">{a.initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">{a.name}</p>
              <p className="truncate text-[11px] text-text-muted">{a.role}</p>
            </div>
            <span className="text-[10px] text-text-muted">{a.time}</span>
          </div>
        ))}
      </div>

      {/* Commission chip */}
      <div
        className="hero-anim absolute bottom-0 right-6 animate-[slide-in_0.6s_ease-out_both] rounded-full border border-border-default/50 bg-surface-card px-3 py-1.5 text-[11px] font-medium text-text-primary shadow-subtle"
        style={{ animationDelay: "1.8s" }}
      >
        ₹0 <span className="text-text-muted">commission</span>
      </div>
    </div>
  );
}

export default function JobFormWizard({
  mode,
  jobId,
  initialJob,
}: JobFormWizardProps) {
  const router = useRouter();

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState<JobFormState>({
    title: "",
    company: "",
    category: "UI/UX & Product Design",
    employmentType: "FULL_TIME",
    workMode: "Onsite",
    location: "",
    selectedOffices: [],
    candidatePreference: "COMPANY_STATE",
    preferredTargets: [],
    remoteEligibilityType: "COUNTRIES",
    remoteEligibilityCountries: ["IN"],
    hqLocation: "",
    experienceMin: "",
    experienceMax: "",
    postedDate: getToday(),
    salary: "",
    mail: "",
    companyLink: "",
    description: "",
  });

  const [loadingInitial, setLoadingInitial] = useState(mode === "edit" && !initialJob);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedJobData, setSubmittedJobData] = useState<Partial<Job> | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailVerifiedDomain, setEmailVerifiedDomain] = useState<string | null>(null);
  const [isCheckingNext, setIsCheckingNext] = useState(false);
  const lastVerifiedEmailRef = useRef<string>("");
  const isNavigatingRef = useRef<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // AI Tools State
  const [showAiModal, setShowAiModal] = useState(false);
  const [rawAiText, setRawAiText] = useState("");
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);

  // Auto-resizing refs for content-height textareas
  const descriptionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustDescriptionHeight = useCallback(() => {
    const el = descriptionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 220)}px`;
  }, []);

  const adjustAiTextareaHeight = useCallback(() => {
    const el = aiTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    if (currentStep === 4) {
      requestAnimationFrame(() => {
        adjustDescriptionHeight();
      });
    }
  }, [currentStep, form.description, adjustDescriptionHeight]);

  useEffect(() => {
    if (showAiModal) {
      requestAnimationFrame(() => {
        adjustAiTextareaHeight();
      });
    }
  }, [showAiModal, rawAiText, adjustAiTextareaHeight]);

  const handleLoadSample = () => {
    setRawAiText(SAMPLE_JOB_DESCRIPTION);
    setShowAiModal(true);
    setTimeout(() => {
      adjustAiTextareaHeight();
      aiTextareaRef.current?.focus();
    }, 50);
  };

  const handleToggleAiModal = () => {
    setShowAiModal((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          adjustAiTextareaHeight();
          aiTextareaRef.current?.focus();
        }, 50);
      }
      return next;
    });
  };

  const handleParseWithAi = async () => {
    if (!rawAiText.trim()) {
      toast.error("Please paste the job description first.");
      return;
    }
    setIsParsingAi(true);
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: rawAiText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract job details");
      }
      const parsed = typeof data.data === "string" ? JSON.parse(data.data) : data.data;

      const cat = parsed.category || matchJobCategory(parsed.title || "");

      let expMin = String(parsed.experienceMin || "");
      let expMax = String(parsed.experienceMax || "");
      if (!expMin && parsed.experience) {
        const digits = (String(parsed.experience).match(/\d+/g) || []).map(Number);
        if (digits.length >= 2) {
          expMin = String(digits[0]);
          expMax = String(digits[1]);
        } else if (digits.length === 1) {
          expMin = String(digits[0]);
        }
      }

      const empUpper = String(parsed.employmentType || "").toUpperCase();
      let empType: JobFormState["employmentType"] = "FULL_TIME";
      if (empUpper.includes("PART")) empType = "PART_TIME";
      else if (empUpper.includes("INTERN")) empType = "INTERN";
      else if (empUpper.includes("CONTRACT")) empType = "CONTRACTOR";

      // Resolve office location
      const extractedCity = (parsed.city || parsed.location || "").trim();
      let resolvedOffices: OfficeLocation[] = [];
      if (extractedCity && !/^(remote|worldwide|pan-india|anywhere)$/i.test(extractedCity)) {
        const found = CANONICAL_CITIES.find(
          (c) => c.name.toLowerCase() === extractedCity.toLowerCase()
        ) || CSC_CITIES.find(
          (c) => c.name.toLowerCase() === extractedCity.toLowerCase()
        );
        resolvedOffices = [
          {
            city: found ? found.name : extractedCity,
            state: found?.state || parsed.state || "",
            country: "India",
            countryCode: "IN",
          },
        ];
      }

      const wm: JobFormState["workMode"] =
        parsed.workMode === "Remote" || parsed.workMode === "Hybrid"
          ? parsed.workMode
          : normalizeWorkMode("", parsed.location || extractedCity);

      setForm((prev) => ({
        ...prev,
        title: parsed.title || prev.title,
        company: parsed.company || prev.company,
        category: cat || prev.category,
        salary: parsed.salary || prev.salary,
        mail: parsed.email || parsed.mail || prev.mail,
        workMode: wm,
        experienceMin: expMin || prev.experienceMin,
        experienceMax: expMax || prev.experienceMax,
        selectedOffices: resolvedOffices.length > 0 ? resolvedOffices : prev.selectedOffices,
        description: parsed.description || rawAiText,
        employmentType: empType,
      }));

      // Clear any field errors that might have been visible
      setFieldErrors({});

      toast.success(
        data.isAiPowered
          ? "Gemini AI extracted and auto-filled all steps!"
          : "Job details extracted and auto-filled!"
      );
      setShowAiModal(false);
      setRawAiText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI extraction failed");
    } finally {
      setIsParsingAi(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a Job Title in Step 1 first.");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-description",
          title: form.title,
          company: form.company,
          category: form.category,
          experience: form.experienceMin
            ? `${form.experienceMin}-${form.experienceMax || form.experienceMin} years`
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate description");
      }
      setForm((prev) => ({ ...prev, description: data.description }));
      setFieldErrors((prev) => {
        if (!prev.description) return prev;
        const cp = { ...prev };
        delete cp.description;
        return cp;
      });
      toast.success(data.isAiPowered ? "AI description generated!" : "Professional description generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!form.description.trim()) {
      toast.error("Please write or paste a description first to enhance it.");
      return;
    }
    setIsEnhancingDesc(true);
    try {
      const res = await fetch("/api/ai-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enhance-description",
          currentDescription: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to enhance description");
      }
      setForm((prev) => ({ ...prev, description: data.description }));
      setFieldErrors((prev) => {
        if (!prev.description) return prev;
        const cp = { ...prev };
        delete cp.description;
        return cp;
      });
      toast.success(data.isAiPowered ? "Description enhanced by AI!" : "Description formatted and polished!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to enhance description");
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const populateFromJob = useCallback((job: Job) => {
    const rawLoc = job.location || "";
    const wm = normalizeWorkMode(job.workMode, rawLoc);

    // Parse offices
    let offices: OfficeLocation[] = [];
    if (job.physicalLocations && job.physicalLocations.length > 0) {
      offices = job.physicalLocations
        .filter((p) => Boolean(p.city))
        .map((p) => ({
          city: p.city!,
          state: p.state || "",
          country: "India",
          countryCode: p.countryCode || "IN",
        }));
    } else if (job.primaryCity) {
      offices = [
        {
          city: job.primaryCity,
          state: job.primaryState || "",
          country: job.primaryCountry || "India",
          countryCode: job.primaryCountryCode || "IN",
        },
      ];
    } else if (rawLoc && !rawLoc.toLowerCase().includes("remote")) {
      const parts = rawLoc.split(",").map((s) => s.trim()).filter(Boolean);
      offices = parts.map((p) => {
        const matched = CANONICAL_CITIES.find(
          (c) => c.name.toLowerCase() === p.toLowerCase()
        );
        return {
          city: p,
          state: matched ? matched.state : "",
          country: "India",
          countryCode: "IN",
        };
      });
    }

    // Parse preferred targets
    const targets: PreferredTarget[] = [];
    if (Array.isArray(job.remoteEligibilityCities)) {
      for (const c of job.remoteEligibilityCities) {
        if (c.city) targets.push({ name: c.city, type: "city", state: c.region });
      }
    }
    if (Array.isArray(job.remoteEligibilityRegions)) {
      for (const r of job.remoteEligibilityRegions) {
        if (r.region) targets.push({ name: r.region, type: "state" });
      }
    }

    // Determine preference
    const remType = job.remoteEligibilityType || "COUNTRIES";
    const notes = String(job.workModeNotes || "");
    const rawLocLower = rawLoc.toLowerCase();
    const officeStates = getOfficeStates(offices);
    const officeStateSet = new Set(officeStates.map((s) => s.toLowerCase()));
    let candPref: CandidatePreference = "COMPANY_STATE";

    if (
      remType === "WORLDWIDE" ||
      notes.toLowerCase().includes("global") ||
      notes.toLowerCase().includes("worldwide")
    ) {
      candPref = "WORLDWIDE";
    } else if (
      notes.toLowerCase().includes("local only") ||
      notes.toLowerCase().includes("must reside in office") ||
      rawLocLower.includes("local only")
    ) {
      candPref = "EXACT_LOCATION";
    } else if (
      remType === "REGIONS" &&
      Array.isArray(job.remoteEligibilityRegions) &&
      job.remoteEligibilityRegions.length > 0 &&
      job.remoteEligibilityRegions.every((r) => r.region && officeStateSet.has(r.region.toLowerCase()))
    ) {
      candPref = "COMPANY_STATE";
      targets.length = 0;
    } else if (targets.length > 0 || remType === "REGIONS") {
      candPref = "SPECIFIC_LOCATION";
    } else if (
      rawLocLower.includes("pan-india") ||
      notes.toLowerCase().includes("anywhere in india") ||
      (remType === "COUNTRIES" && job.remoteEligibilityCountries?.includes("IN"))
    ) {
      candPref = "ALL_INDIA";
    } else {
      candPref = "COMPANY_STATE";
    }

    const exp = parseExperienceFromJob(job);

    const empType = (job.employmentType || "FULL_TIME").toUpperCase();
    const validEmpType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN" =
      empType === "PART_TIME"
        ? "PART_TIME"
        : empType === "CONTRACTOR"
          ? "CONTRACTOR"
          : empType === "INTERN"
            ? "INTERN"
            : "FULL_TIME";

    setForm({
      title: job.title || "",
      company: job.company || "",
      category: job.category || matchJobCategory(job.title || ""),
      employmentType: validEmpType,
      workMode: wm,
      location: rawLoc,
      selectedOffices: offices,
      candidatePreference: candPref,
      preferredTargets: targets,
      remoteEligibilityType: remType,
      remoteEligibilityCountries: job.remoteEligibilityCountries || ["IN"],
      hqLocation: job.hqLocationId || "",
      experienceMin: exp.min,
      experienceMax: exp.max,
      postedDate: dateForInput(job.postedDate) || getToday(),
      salary: job.salary || "",
      mail: job.mail || "",
      companyLink: job.companyLink || "",
      description: job.description || "",
    });
  }, []);

  useEffect(() => {
    if (initialJob) {
      populateFromJob(initialJob);
      setLoadingInitial(false);
      return;
    }

    if (mode === "edit" && jobId) {
      let cancelled = false;
      setLoadingInitial(true);
      setLoadError("");

      fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load job listing.");
          return res.json();
        })
        .then((data: Job) => {
          if (!cancelled) {
            populateFromJob(data);
            setLoadingInitial(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error(err);
            setLoadError(err instanceof Error ? err.message : "Failed to load job.");
            setLoadingInitial(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [mode, jobId, initialJob, populateFromJob]);

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!form.title.trim()) {
        errors.title = "Please enter a job title.";
      }
      if (!form.company.trim()) {
        errors.company = "Please enter the company name.";
      }
    } else if (stepNumber === 2) {
      if (form.selectedOffices.length === 0) {
        errors.selectedOffices = "Please add at least one company office location.";
      }
      if (
        form.candidatePreference === "SPECIFIC_LOCATION" &&
        form.preferredTargets.length === 0
      ) {
        errors.preferredTargets = "Please select at least one allowed candidate city or state.";
      }
      if (form.candidatePreference === "COMPANY_STATE" && form.selectedOffices.length > 0) {
        const states = getOfficeStates(form.selectedOffices);
        if (states.length === 0) {
          errors.selectedOffices = "Please choose a recognized city with an identifiable state.";
        }
      }
    } else if (stepNumber === 3) {
      if (!form.experienceMin.trim()) {
        errors.experienceMin = "Please enter minimum experience required (0 for fresher).";
      } else {
        const min = Number(form.experienceMin);
        if (isNaN(min) || min < 0) {
          errors.experienceMin = "Please enter a valid minimum experience (0 or higher).";
        }
      }

      if (form.experienceMax.trim() !== "") {
        const max = Number(form.experienceMax);
        const min = Number(form.experienceMin) || 0;
        if (isNaN(max) || max < 0) {
          errors.experienceMax = "Please enter a valid maximum experience.";
        } else if (max < min) {
          errors.experienceMax = "Maximum experience cannot be less than minimum experience.";
        }
      }

      const trimmedMail = form.mail.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedMail) {
        errors.mail = "Please enter an application email.";
      } else if (!emailRegex.test(trimmedMail)) {
        errors.mail = "Please enter a valid email address (e.g. hr@company.com).";
      }
    } else if (stepNumber === 4) {
      if (!form.description.trim()) {
        errors.description = "Please provide a job description.";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("");
      return false;
    }

    setError("");
    return true;
  };

  const verifyEmailDomain = async (emailToVerify: string): Promise<boolean> => {
    const trimmed = (emailToVerify || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setFieldErrors((prev) => ({ ...prev, mail: "Please enter an application email." }));
      setEmailVerifiedDomain(null);
      lastVerifiedEmailRef.current = "";
      return false;
    }
    if (!emailRegex.test(trimmed)) {
      setFieldErrors((prev) => ({
        ...prev,
        mail: "Please enter a valid email address (e.g. hr@company.com).",
      }));
      setEmailVerifiedDomain(null);
      lastVerifiedEmailRef.current = "";
      return false;
    }

    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (
      lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
      (emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain)
    ) {
      lastVerifiedEmailRef.current = trimmed;
      return true;
    }

    setIsValidatingEmail(true);
    try {
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setFieldErrors((prev) => ({
          ...prev,
          mail: data.reason || "The domain has no active mail server (MX records).",
        }));
        setEmailVerifiedDomain(null);
        lastVerifiedEmailRef.current = "";
        return false;
      }

      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.mail;
        return next;
      });
      const resolvedDomain = data.domain || domain;
      setEmailVerifiedDomain(resolvedDomain);
      lastVerifiedEmailRef.current = trimmed;
      return true;
    } catch {
      // In case of network errors during checking, avoid hard blocking the wizard
      lastVerifiedEmailRef.current = trimmed;
      return true;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleEmailBlur = () => {
    if (isNavigatingRef.current) return;
    const trimmed = form.mail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) return;

    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (
      lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
      (emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain)
    ) {
      return;
    }

    verifyEmailDomain(trimmed);
  };

  const handleNext = async () => {
    if (isCheckingNext) return;
    if (!validateStep(currentStep)) {
      isNavigatingRef.current = false;
      return;
    }

    if (currentStep === 3) {
      const trimmed = form.mail.trim();
      const domain = trimmed.split("@")[1]?.toLowerCase();
      const alreadyValid =
        lastVerifiedEmailRef.current.toLowerCase() === trimmed.toLowerCase() ||
        Boolean(emailVerifiedDomain && domain && emailVerifiedDomain.toLowerCase() === domain);

      if (!alreadyValid) {
        setIsCheckingNext(true);
        try {
          const isDomainValid = await verifyEmailDomain(form.mail);
          if (!isDomainValid) {
            isNavigatingRef.current = false;
            return;
          }
        } finally {
          setIsCheckingNext(false);
        }
      }
    }

    isNavigatingRef.current = false;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    isNavigatingRef.current = false;
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep: number) => {
    isNavigatingRef.current = false;
    if (targetStep < currentStep) {
      setError("");
      setCurrentStep(targetStep);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (targetStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title" && value.trim()) {
        const detected = matchJobCategory(value);
        if (detected) {
          updated.category = detected;
        }
      }
      return updated;
    });
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    if (name === "mail") {
      const nextDomain = value.trim().split("@")[1]?.toLowerCase();
      if (!nextDomain || nextDomain !== emailVerifiedDomain) {
        setEmailVerifiedDomain(null);
        lastVerifiedEmailRef.current = "";
      }
    }
    if (error) setError("");
  };

  const handleAddOffice = (office: OfficeLocation) => {
    setFieldErrors((prev) => { const cp = { ...prev }; delete cp.selectedOffices; return cp; });
    const enrichedOffice: OfficeLocation = {
      ...office,
      state: office.state || resolveOfficeState(office.city),
    };
    setForm((prev) => {
      const exists = prev.selectedOffices.some(
        (o) => o.city.toLowerCase() === enrichedOffice.city.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        selectedOffices: [...prev.selectedOffices, enrichedOffice],
      };
    });
    if (error) setError("");
  };

  const handleRemoveOffice = (cityName: string) => {
    setForm((prev) => ({
      ...prev,
      selectedOffices: prev.selectedOffices.filter(
        (o) => o.city.toLowerCase() !== cityName.toLowerCase()
      ),
    }));
  };

  const handleAddPreferredTarget = (target: PreferredTarget) => {
    setFieldErrors((prev) => {
      if (!prev.preferredTargets) return prev;
      const copy = { ...prev };
      delete copy.preferredTargets;
      return copy;
    });
    setForm((prev) => {
      const exists = prev.preferredTargets.some(
        (t) => t.name.toLowerCase() === target.name.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        preferredTargets: [...prev.preferredTargets, target],
      };
    });
    if (error) setError("");
  };

  const handleRemovePreferredTarget = (targetName: string) => {
    setForm((prev) => ({
      ...prev,
      preferredTargets: prev.preferredTargets.filter(
        (t) => t.name.toLowerCase() !== targetName.toLowerCase()
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateStep(1)) {
      setCurrentStep(1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validateStep(4)) {
      setCurrentStep(4);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const minExperience = Number(form.experienceMin);
    const maxExperience =
      form.experienceMax.trim() === "" ? null : Number(form.experienceMax);

    setIsSubmitting(true);
    setError("");

    try {
      let experience = "";
      if (minExperience === 0 && (maxExperience === null || maxExperience === 0)) {
        experience = "Fresher";
      } else if (maxExperience !== null && maxExperience > minExperience) {
        experience = `${minExperience}–${maxExperience} years`;
      } else if (maxExperience !== null && maxExperience === minExperience) {
        experience = `${minExperience} year${minExperience === 1 ? "" : "s"}`;
      } else {
        experience = `${minExperience}+ years`;
      }

      const isRemote = form.workMode === "Remote";
      const isHybrid = form.workMode === "Hybrid";

      const primaryOffice = form.selectedOffices[0];
      const primaryCity = primaryOffice?.city || "";
      const primaryState = primaryOffice?.state || resolveOfficeState(primaryCity) || "";
      const primaryCountry = primaryOffice?.country || "India";
      const primaryCountryCode = primaryOffice?.countryCode || "IN";
      const officeNames = form.selectedOffices.map((o) => o.city);
      const officeSummary = officeNames.join(", ");
      const officeStates = getOfficeStates(form.selectedOffices);
      const officeStatesSummary = officeStates.join(", ");

      const targetCities = form.preferredTargets.filter((t) => t.type === "city");
      const targetStates = form.preferredTargets.filter((t) => t.type === "state");
      const prefNames = form.preferredTargets.map((t) => t.name);
      const prefSummary = prefNames.join(", ");

      let computedLocation = "";
      let workModeNotes: string | undefined;
      let remoteEligibilityType: RemoteEligibilityType | undefined;
      let remoteEligibilityCountries: string[] | undefined;
      let remoteEligibilityRegions: Array<{ countryCode: string; region: string }> | undefined;
      let remoteEligibilityCities: Array<{ countryCode: string; region: string; city: string }> | undefined;

      if (isRemote) {
        if (form.candidatePreference === "COMPANY_STATE") {
          computedLocation = officeStatesSummary ? `Remote · ${officeStatesSummary}` : "Remote · Pan-India";
          workModeNotes = officeStatesSummary ? `Remote (Must reside in ${officeStatesSummary})` : "Candidates in company's state only";
          remoteEligibilityType = "REGIONS";
          remoteEligibilityRegions = officeStates.map((s) => ({ countryCode: "IN", region: s }));
        } else if (form.candidatePreference === "WORLDWIDE") {
          computedLocation = "Remote · Worldwide";
          workModeNotes = "Open to global applicants";
          remoteEligibilityType = "WORLDWIDE";
        } else if (form.candidatePreference === "ALL_INDIA") {
          computedLocation = "Remote · Pan-India";
          workModeNotes = "Open to candidates anywhere in India";
          remoteEligibilityType = "COUNTRIES";
          remoteEligibilityCountries = ["IN"];
        } else if (form.candidatePreference === "EXACT_LOCATION") {
          computedLocation = `Remote · ${officeSummary}`;
          workModeNotes = `Remote (Must reside in ${officeSummary})`;
          remoteEligibilityType = "CITIES";
          remoteEligibilityCities = form.selectedOffices.map((o) => ({
            countryCode: o.countryCode || "IN",
            region: o.state,
            city: o.city,
          }));
        } else if (form.candidatePreference === "SPECIFIC_LOCATION") {
          computedLocation = `Remote · ${prefSummary}`;
          workModeNotes = `Must reside in ${prefSummary}`;
          if (targetCities.length > 0) {
            remoteEligibilityCities = targetCities.map((c) => ({
              countryCode: "IN",
              region: c.state || "",
              city: c.name,
            }));
          }
          if (targetStates.length > 0) {
            remoteEligibilityRegions = targetStates.map((s) => ({
              countryCode: "IN",
              region: s.name,
            }));
          }
          if (targetCities.length > 0 && targetStates.length === 0) {
            remoteEligibilityType = "CITIES";
          } else if (targetStates.length > 0 && targetCities.length === 0) {
            remoteEligibilityType = "REGIONS";
          } else {
            remoteEligibilityType = "CITIES";
          }
        }
      } else {
        // Onsite or Hybrid
        const prefix = isHybrid ? "Hybrid · " : "";
        if (form.candidatePreference === "COMPANY_STATE") {
          computedLocation = officeStatesSummary
            ? `${prefix}${officeSummary} (${officeStatesSummary} only)`
            : `${prefix}${officeSummary}`;
          workModeNotes = officeStatesSummary
            ? `Candidates in ${officeStatesSummary} only`
            : "Candidates in company's state only";
          remoteEligibilityType = "REGIONS";
          remoteEligibilityRegions = officeStates.map((s) => ({ countryCode: "IN", region: s }));
        } else if (form.candidatePreference === "EXACT_LOCATION") {
          computedLocation = `${prefix}${officeSummary} (Local only)`;
          workModeNotes = "Local candidates only";
          remoteEligibilityType = "CITIES";
          remoteEligibilityCities = form.selectedOffices.map((o) => ({
            countryCode: o.countryCode || "IN",
            region: o.state,
            city: o.city,
          }));
        } else if (form.candidatePreference === "ALL_INDIA") {
          computedLocation = `${prefix}${officeSummary}`;
          workModeNotes = "Open to candidates anywhere in India";
          remoteEligibilityType = "COUNTRIES";
          remoteEligibilityCountries = ["IN"];
        } else if (form.candidatePreference === "WORLDWIDE") {
          computedLocation = `${prefix}${officeSummary} (Worldwide)`;
          workModeNotes = "Open to global applicants";
          remoteEligibilityType = "WORLDWIDE";
        } else if (form.candidatePreference === "SPECIFIC_LOCATION") {
          workModeNotes = `${prefSummary} candidates preferred`;
          computedLocation = `${prefix}${officeSummary} (${prefSummary} preferred)`;
          if (targetCities.length > 0) {
            remoteEligibilityCities = targetCities.map((c) => ({
              countryCode: "IN",
              region: c.state || "",
              city: c.name,
            }));
          }
          if (targetStates.length > 0) {
            remoteEligibilityRegions = targetStates.map((s) => ({
              countryCode: "IN",
              region: s.name,
            }));
          }
          if (targetCities.length > 0 && targetStates.length === 0) {
            remoteEligibilityType = "CITIES";
          } else {
            remoteEligibilityType = "REGIONS";
          }
        }
      }

      if (!computedLocation) {
        computedLocation = isRemote ? "Remote · Pan-India" : officeSummary;
      }

      const payload: Partial<Job> = {
        title: form.title.trim(),
        company: form.company.trim(),
        category: form.category || "UI/UX & Product Design",
        location: computedLocation,
        workMode: form.workMode,
        employmentType: form.employmentType,
        primaryCity: primaryCity || undefined,
        primaryState: primaryState || undefined,
        primaryCountry: primaryCountry,
        primaryCountryCode: primaryCountryCode,
        isMultiLocation: form.selectedOffices.length > 1,
        physicalLocations: form.selectedOffices.map((o) => ({
          city: o.city,
          state: o.state,
          countryCode: o.countryCode,
        })),
        experience,
        postedDate: computeSubmitPostedDate(form.postedDate, getToday(), mode, initialJob?.postedDate),
        salary: form.salary.trim() || "Not Disclosed",
        mail: form.mail.trim(),
        companyLink: form.companyLink.trim(),
        description: form.description.trim(),
        workModeNotes: workModeNotes || undefined,
        remoteEligibilityType: remoteEligibilityType || (isRemote ? "COUNTRIES" : undefined),
        remoteEligibilityCountries: remoteEligibilityCountries || (isRemote ? ["IN"] : undefined),
        remoteEligibilityRegions: remoteEligibilityRegions || [],
        remoteEligibilityCities: remoteEligibilityCities || [],
      };

      if (mode === "edit" && jobId) {
        payload.id = jobId;
        const res = await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to update job listing.");
        }

        toast.success("Job updated successfully!");
        router.push(jobId ? `/admin/jobs/${jobId}` : "/admin/jobs");
        router.refresh();
      } else if (mode === "public") {
        payload.status = "draft";
        payload.requiresReview = true;

        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to submit job listing.");
        }

        const data = await res.json().catch(() => null);
        setSubmittedJobData(data?.job || payload);
        setIsSubmittedSuccess(true);
        setIsSubmitting(false);
        toast.success("Job submitted for review!");
        return;
      } else {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || "Failed to publish job listing.");
        }

        toast.success("Job published successfully!");
        router.push("/admin/jobs");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes("mail") ||
        errMsg.toLowerCase().includes("email") ||
        errMsg.toLowerCase().includes("domain")
      ) {
        setFieldErrors((prev) => ({ ...prev, mail: errMsg }));
        setCurrentStep(3);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
      setIsSubmitting(false);
    }
  };

  const previewExperience = formatExperienceLabel(
    form.experienceMin,
    form.experienceMax
  );

  const previewLocation = useMemo(() => {
    const isRemote = form.workMode === "Remote";
    const isHybrid = form.workMode === "Hybrid";
    const officeNames = form.selectedOffices.map((o) => o.city);
    const officeSummary = officeNames.join(", ") || "City not set";
    const officeStates = getOfficeStates(form.selectedOffices);
    const stateSummary = officeStates.join(", ");
    const prefNames = form.preferredTargets.map((t) => t.name).join(", ");

    if (isRemote) {
      if (form.candidatePreference === "COMPANY_STATE") {
        return stateSummary ? `Remote · ${stateSummary}` : "Remote · Company State";
      }
      if (form.candidatePreference === "ALL_INDIA") return "Remote · Pan-India";
      if (form.candidatePreference === "WORLDWIDE") return "Remote · Worldwide";
      if (form.candidatePreference === "EXACT_LOCATION") return `Remote · ${officeSummary}`;
      if (form.candidatePreference === "SPECIFIC_LOCATION") return `Remote · ${prefNames || "Specific areas"}`;
      return "Remote · Pan-India";
    }

    const prefix = isHybrid ? "Hybrid · " : "";
    if (form.candidatePreference === "COMPANY_STATE") {
      return stateSummary
        ? `${prefix}${officeSummary} (${stateSummary} only)`
        : `${prefix}${officeSummary}`;
    }
    if (form.candidatePreference === "EXACT_LOCATION") return `${prefix}${officeSummary} (Local only)`;
    if (form.candidatePreference === "SPECIFIC_LOCATION") return `${prefix}${officeSummary} (${prefNames || "Preferred areas"})`;
    return `${prefix}${officeSummary}`;
  }, [form.workMode, form.selectedOffices, form.candidatePreference, form.preferredTargets]);

  if (loadingInitial) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <LoaderCircle size={24} className="animate-spin text-brand" />
        <p className="text-xs font-medium text-text-muted">Loading job details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-control bg-status-error/10 text-status-error">
          <AlertCircle size={20} />
        </div>
        <h2 className="mt-3 text-base font-semibold text-text-primary">Unable to load job</h2>
        <p className="mt-1 text-xs text-text-muted">{loadError}</p>
        <Link
          href="/admin/jobs"
          className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-brand px-3.5 py-2 text-xs font-medium text-text-inverse"
        >
          <ArrowLeft size={13} />
          Back to job listings
        </Link>
      </div>
    );
  }

  if (mode === "public" && isSubmittedSuccess) {
    return (
      <main className="min-h-full bg-surface-base text-text-primary">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
          <div className="rounded-card border border-border-default bg-surface-card p-6 sm:p-10 text-center shadow-subtle">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <CheckCircle2 size={32} strokeWidth={2} />
            </div>

            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-control bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Submitted · Pending Review
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Job Submitted for Review!
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Thank you for posting on Zenoway. To maintain high listing quality and ensure compensation transparency, all public submissions undergo a quick editorial review. Your listing will go live once approved by our moderation team.
            </p>

            {/* Submitted Job Overview Card */}
            <div className="mt-6 rounded-card border border-border-default bg-surface-subtle/50 p-5 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {submittedJobData?.title || form.title}
                  </h3>
                  <p className="text-xs font-medium text-text-secondary">
                    {submittedJobData?.company || form.company}
                  </p>
                </div>
                <span className="rounded-control bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                  {submittedJobData?.workMode || form.workMode}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-default/40 pt-3 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-text-muted">Location</span>
                  <p className="mt-0.5 truncate font-medium text-text-primary">{previewLocation}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-text-muted">Salary</span>
                  <p className="mt-0.5 font-semibold text-brand">{form.salary || "Not Disclosed"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-text-muted">Contact Email</span>
                  <p className="mt-0.5 truncate font-medium text-text-primary">{form.mail || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/jobs"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control bg-brand px-6 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover shadow-subtle"
              >
                <span>Browse Job Listings</span>
                <ArrowUpRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    title: "",
                    company: "",
                    category: "UI/UX & Product Design",
                    employmentType: "FULL_TIME",
                    workMode: "Onsite",
                    location: "",
                    selectedOffices: [],
                    candidatePreference: "COMPANY_STATE",
                    preferredTargets: [],
                    remoteEligibilityType: "COUNTRIES",
                    remoteEligibilityCountries: ["IN"],
                    hqLocation: "",
                    experienceMin: "",
                    experienceMax: "",
                    postedDate: getToday(),
                    salary: "",
                    mail: "",
                    companyLink: "",
                    description: "",
                  });
                  setCurrentStep(1);
                  setIsSubmittedSuccess(false);
                  setSubmittedJobData(null);
                  setEmailVerifiedDomain(null);
                  lastVerifiedEmailRef.current = "";
                  setIsCheckingNext(false);
                }}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control border border-border-default bg-surface-card px-5 text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary"
              >
                <span>Post Another Job</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-surface-base text-text-primary">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-12">
        {/* Breadcrumb */}
        {mode === "public" ? (
          <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
            <Link href="/" className="transition hover:text-brand">
              Zenoway
            </Link>
            <span>/</span>
            <Link href="/jobs" className="transition hover:text-brand">
              Jobs
            </Link>
            <span>/</span>
            <span className="font-medium text-text-primary">Post a Job</span>
          </nav>
        ) : (
          <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
            <Link href="/admin" className="transition hover:text-brand">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/admin/jobs" className="transition hover:text-brand">
              Job listings
            </Link>
            <span>/</span>
            {mode === "edit" && jobId ? (
              <>
                <Link
                  href={`/admin/jobs/${jobId}`}
                  className="transition hover:text-brand"
                >
                  Job details
                </Link>
                <span>/</span>
                <span className="font-medium text-text-primary">Edit</span>
              </>
            ) : (
              <span className="font-medium text-text-primary">
                Add job
              </span>
            )}
          </nav>
        )}

        {/* Public Hero vs Admin Header */}
        {mode === "public" ? (
          currentStep === 1 ? (
            <div className="mb-10 border-b border-border-default/40 pb-10">
              <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="lg:pt-2">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    <span>Zenoway for Employers</span>
                    <span className="text-border-default">/</span>
                    <span>Direct · Zero brokerage</span>
                  </div>

                  {/* Headline */}
                  <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                    Hire India&apos;s best tech & design talent.{" "}
                    <span className="text-brand">Without the middlemen.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                    Publish openings to verified engineers, designers and tech leads. Candidates
                    apply straight to your official HR email. No agency fees, no delays.
                  </p>

                  {/* How it works button */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowHowItWorksModal(true)}
                      className="group inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span>How it works</span>
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                  </div>
                </div>

                <HeroVisual />
              </div>

              {/* Feature row, full width */}
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-border-default/40 pt-8 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-border-default/40">
                {[
                  { icon: Mail, title: "Direct applications", body: "Resumes land directly in your official HR email." },
                  { icon: Sparkles, title: "AI auto-fill", body: "Paste a draft JD and Gemini fills every step." },
                  { icon: MapPin, title: "Pan-India & remote", body: "Target Bengaluru, NCR, Kochi, or go remote." },
                  { icon: Zap, title: "Live in 2 minutes", body: "Four-step wizard with live markdown preview." },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                    <dt className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <Icon size={15} strokeWidth={1.75} className="shrink-0 text-brand" />
                      {title}
                    </dt>
                    <dd className="mt-1.5 text-xs leading-relaxed text-text-muted">{body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <header className="mb-6 flex flex-col gap-1 border-b border-border-default/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">
                  Post an IT Job
                </h1>
                <p className="text-xs text-text-muted">
                  Step {currentStep} of 4 • {WIZARD_STEPS[currentStep - 1]?.label}: {WIZARD_STEPS[currentStep - 1]?.brief}
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted">
                <span className="font-semibold text-brand">Direct Applications</span>
                <span>•</span>
                <span className="text-text-secondary">Zero Brokerage</span>
              </div>
            </header>
          )
        ) : (
          /* Admin / Edit Header */
          <header className="mb-8 border-b border-border-default/40 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              {mode === "edit" ? "Edit Job Listing" : "Add New Job"}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {mode === "edit" && jobId
                ? `Listing ID: ${jobId}`
                : "Fill in role details and publish to the Zenoway catalog."}
            </p>
          </header>
        )}

        {/* Upgraded AI Auto-Fill Section */}
        {currentStep === 1 && (
          <div className="mb-8 rounded-control border border-brand/25 bg-gradient-to-br from-brand-soft/60 via-surface-card to-brand-soft/20 p-4 sm:p-5 shadow-subtle transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand text-text-inverse shadow-subtle">
                  <Sparkles size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold text-text-primary">
                      Gemini AI Smart Importer
                    </h2>
                    <span className="rounded-control bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                      All 4 Steps
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-text-secondary">
                    Paste raw text from a draft, PDF, or email. Gemini AI automatically parses and fills all 4 steps.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!showAiModal && (
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-subtle transition hover:border-brand/40 hover:text-text-primary"
                  >
                    <span>Try Sample JD</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleToggleAiModal}
                  className="inline-flex items-center justify-center gap-1.5 rounded-control bg-brand px-3.5 py-1.5 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover shrink-0"
                >
                  <Wand2 size={13} />
                  <span>{showAiModal ? "Close AI Importer" : "Paste Draft with AI"}</span>
                </button>
              </div>
            </div>

            {showAiModal && (
              <div className="mt-4 border-t border-brand/15 pt-4 space-y-3.5 animate-in fade-in duration-200">
                {/* Extraction tags preview */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="font-semibold text-text-secondary">Auto-extracts:</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">🏷️ Role & Category</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">🏢 Company & City</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">💼 Work Mode & Type</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">💰 Experience & Salary</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">✉️ Contact Email</span>
                  <span className="rounded-control bg-surface-card px-2 py-0.5 border border-border-default/60 text-text-secondary">📝 Description</span>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    ref={aiTextareaRef}
                    value={rawAiText}
                    disabled={isParsingAi}
                    onChange={(e) => {
                      setRawAiText(e.target.value);
                      adjustAiTextareaHeight();
                    }}
                    onInput={adjustAiTextareaHeight}
                    placeholder="Paste job title, requirements, company info, or raw job text here...&#10;&#10;e.g. 'Senior UI/UX Designer at TechCorp in Bengaluru (Hybrid), 3-5 years experience, ₹15-20 LPA, contact hiring@techcorp.com...'"
                    style={{ minHeight: "130px", overflow: "hidden", resize: "none" }}
                    className={`${inputClass} text-xs leading-relaxed font-sans placeholder:text-text-muted/70 bg-surface-card`}
                  />
                </div>

                {/* Footer action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="font-mono">{rawAiText.length} characters</span>
                    {rawAiText.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-brand font-medium">Ready for AI extraction</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {rawAiText.length === 0 ? (
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="rounded-control px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition"
                      >
                        Insert Sample
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRawAiText("");
                          setTimeout(adjustAiTextareaHeight, 0);
                        }}
                        className="rounded-control px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-rose-600 transition"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                      }}
                      className="rounded-control px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={isParsingAi || !rawAiText.trim()}
                      onClick={handleParseWithAi}
                      className="inline-flex items-center gap-1.5 rounded-control bg-brand px-4 py-1.5 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isParsingAi ? (
                        <>
                          <LoaderCircle size={13} className="animate-spin" />
                          <span>Extracting & Auto-Filling...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Auto-Fill All Steps</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Wizard Layout: Left Progress Stepper + Right Form Step */}
        <div className="flex flex-col md:flex-row md:items-start gap-10 lg:gap-14">
          {/* Progress Section (Left Sidebar on Desktop, Compact Stepper on Mobile) */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0">
            {/* Mobile Stepper (< md) */}
            <div className="md:hidden mb-6 rounded-control border border-border-default/60 bg-surface-card p-3.5 shadow-subtle">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-brand shrink-0">
                    {WIZARD_STEPS[currentStep - 1].tag}
                  </span>
                  <span className="font-semibold text-text-primary shrink-0">
                    {WIZARD_STEPS[currentStep - 1].label}
                  </span>
                  <span className="text-text-muted shrink-0">·</span>
                  <span className="text-text-muted truncate text-[11px]">
                    {WIZARD_STEPS[currentStep - 1].brief}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-text-muted shrink-0 ml-2">
                  {currentStep} / 4
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Left Stepper (md+) - Clean Light White Cards with Right-Side Checkmark */}
            <div className="hidden md:block md:sticky md:top-8">
              <nav className="space-y-2.5" aria-label="Wizard Steps">
                {WIZARD_STEPS.map((step) => {
                  const isActive = currentStep === step.num;
                  const isPast = currentStep > step.num;

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => handleStepClick(step.num)}
                      className={`group flex w-full items-center justify-between gap-3 rounded-control border p-3.5 text-left transition-all duration-150 ${isPast
                          ? "border-brand/30 bg-brand-soft/40 text-brand shadow-subtle hover:bg-brand-soft/60"
                          : isActive
                            ? "border-brand/40 bg-white shadow-subtle ring-1 ring-brand/20"
                            : "border-border-default/50 bg-white/70 text-text-muted hover:border-border-strong hover:bg-white hover:text-text-secondary"
                        }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-bold ${isPast
                                ? "text-brand"
                                : isActive
                                  ? "text-brand"
                                  : "text-text-muted"
                              }`}
                          >
                            {step.tag}
                          </span>
                          <span
                            className={`text-sm font-bold tracking-tight ${isPast
                                ? "text-brand"
                                : isActive
                                  ? "text-text-primary"
                                  : "text-text-muted group-hover:text-text-secondary"
                              }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        <p
                          className={`mt-0.5 text-xs truncate ${isPast
                              ? "text-brand/80"
                              : isActive
                                ? "text-text-secondary"
                                : "text-text-muted/70 group-hover:text-text-muted"
                            }`}
                        >
                          {step.brief}
                        </p>
                      </div>

                      {/* Right side tick mark for completed tasks */}
                      {isPast ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                          <Check size={13} className="stroke-[2.5]" />
                        </div>
                      ) : isActive ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-brand ring-4 ring-brand/15" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Form Content */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="mb-6 flex items-start gap-2.5 rounded-control border border-status-error/30 bg-status-error/10 p-3.5 text-xs text-status-error">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* STEP 1: ROLE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Job Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior Frontend Engineer"
                      icon={BriefcaseBusiness}
                      error={fieldErrors.title}
                      required
                    />

                    <Field
                      label="Company Name"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="e.g. Acme Inc."
                      icon={Building2}
                      error={fieldErrors.company}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className={labelClass}>
                        Job Category
                        <span className="ml-1 text-status-error">*</span>
                      </label>
                      <div className="group relative">
                        <select
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className={`${inputClass} cursor-pointer appearance-none pr-10`}
                          required
                        >
                          {JOB_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          strokeWidth={1.8}
                          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="employmentType" className={labelClass}>
                        Employment Type
                      </label>
                      <div className="group relative">
                        <select
                          id="employmentType"
                          name="employmentType"
                          value={form.employmentType}
                          onChange={handleChange}
                          className={`${inputClass} cursor-pointer appearance-none pr-10`}
                        >
                          <option value="FULL_TIME">Full-time</option>
                          <option value="PART_TIME">Part-time</option>
                          <option value="CONTRACTOR">Contract</option>
                          <option value="INTERN">Internship</option>
                        </select>
                        <ChevronDown
                          size={15}
                          strokeWidth={1.8}
                          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
                        />
                      </div>
                    </div>
                  </div>

                  <Field
                    label="Company Website (Optional)"
                    name="companyLink"
                    value={form.companyLink}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    icon={Globe}
                    type="url"
                  />

                  <div className="flex items-center justify-end pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 rounded-control bg-brand px-5 py-2.5 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover"
                    >
                      <span>Continue to Location</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Work Mode Toggle */}
                  <div>
                    <label className={labelClass}>Work Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Onsite", "Hybrid", "Remote"] as const).map((modeOption) => {
                        const isSelected = form.workMode === modeOption;
                        return (
                          <button
                            key={modeOption}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                workMode: modeOption,
                              }));
                              if (error) setError("");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-control border py-2.5 text-xs font-semibold transition-all ${isSelected
                              ? "border-brand bg-brand-soft text-brand"
                              : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                              }`}
                          >
                            {modeOption === "Onsite" && <Building2 size={13} />}
                            {modeOption === "Hybrid" && <Building2 size={13} />}
                            {modeOption === "Remote" && <Globe size={13} />}
                            <span>{modeOption === "Onsite" ? "On-site" : modeOption}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. Company Office / Branches Picker */}
                  <div className="space-y-3">
                    <label className={labelClass}>
                      Company Office Locations / Hubs
                      <span className="ml-1 text-status-error">*</span>
                    </label>

                    <CompanyCitySelector
                      onSelect={handleAddOffice}
                      placeholder="Search city (e.g. Bengaluru, Kochi, Mumbai)..."
                    />
                    {fieldErrors.selectedOffices && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-status-error animate-in fade-in duration-150">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.selectedOffices}</span>
                      </p>
                    )}

                    {/* Selected office chips */}
                    {form.selectedOffices.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {form.selectedOffices.map((office) => (
                          <span
                            key={office.city}
                            className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-primary"
                          >
                            <span className="font-semibold">{office.city}</span>
                            {office.state && (
                              <span className="text-[11px] text-text-muted">
                                ({office.state})
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveOffice(office.city)}
                              className="ml-1 text-text-muted hover:text-status-error"
                              aria-label={`Remove ${office.city}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Candidate Residency / Eligibility Scope */}
                  <div className="space-y-3 border-t border-border-default/40 pt-5">
                    <label className={labelClass}>Candidate Residency & Eligibility</label>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(() => {
                        const officeStates = getOfficeStates(form.selectedOffices);
                        const stateDesc = officeStates.join(", ");
                        const officeCities = form.selectedOffices.map((o) => o.city);
                        const officeSummary = officeCities.join(", ");

                        const residencyOptions: Array<{
                          id: CandidatePreference;
                          title: string;
                          desc: string;
                          fullWidth?: boolean;
                        }> = [
                            {
                              id: "COMPANY_STATE",
                              title: "Company State",
                              desc: stateDesc
                                ? (form.workMode === "Remote" ? `Remote, within ${stateDesc}` : `Candidates in ${stateDesc} only`)
                                : (form.workMode === "Remote" ? "Remote, within company state" : "Candidates in company's state only"),
                            },
                            {
                              id: "ALL_INDIA",
                              title: "Pan-India",
                              desc: form.workMode === "Remote"
                                ? "Anywhere in India (Remote · Pan-India)"
                                : "Anywhere in India",
                            },
                            {
                              id: "EXACT_LOCATION",
                              title: "Office Location Only",
                              desc: officeSummary
                                ? (form.workMode === "Remote" ? `Remote, within ${officeSummary}` : `Local candidates in ${officeSummary} only`)
                                : (form.workMode === "Remote" ? "Remote, but candidate must reside in office city" : "Local candidates only"),
                            },
                            {
                              id: "SPECIFIC_LOCATION",
                              title: "Specific States / Cities",
                              desc: "Limit eligible applicants to chosen regions or cities",
                            },
                            {
                              id: "WORLDWIDE",
                              title: "Worldwide",
                              desc: form.workMode === "Remote"
                                ? "Open to global international candidates"
                                : "International applicants",
                              fullWidth: true,
                            },
                          ];

                        return residencyOptions.map((pref) => {
                          const isSelected = form.candidatePreference === pref.id;
                          return (
                            <button
                              key={pref.id}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  candidatePreference: pref.id,
                                }));
                                setFieldErrors((prev) => {
                                  if (!prev.preferredTargets) return prev;
                                  const copy = { ...prev };
                                  delete copy.preferredTargets;
                                  return copy;
                                });
                                if (error) setError("");
                              }}
                              className={`flex flex-col rounded-control border p-3 text-left transition-all ${pref.fullWidth ? "sm:col-span-2" : ""
                                } ${isSelected
                                  ? "border-brand bg-brand-soft/60 ring-1 ring-brand/30"
                                  : "border-border-default bg-surface-card hover:border-border-strong"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold ${isSelected ? "text-brand" : "text-text-primary"
                                    }`}
                                >
                                  {pref.title}
                                </span>
                                {isSelected && <Check size={14} className="text-brand" />}
                              </div>
                              <span className="mt-1 text-[11px] leading-4 text-text-muted">
                                {pref.desc}
                              </span>
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Feedback helper when COMPANY_STATE is selected */}
                    {form.candidatePreference === "COMPANY_STATE" && (
                      <div className="rounded-control border border-border-default/60 bg-surface-subtle/50 px-3 py-2 text-xs text-text-secondary">
                        {(() => {
                          const states = getOfficeStates(form.selectedOffices);
                          if (states.length > 0) {
                            return (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="shrink-0 text-brand" />
                                <span>
                                  Candidates residing in <strong className="text-text-primary">{states.join(", ")}</strong> will be eligible to apply.
                                </span>
                              </span>
                            );
                          }
                          return (
                            <span className="text-[11px] text-text-muted">
                              Add your company office location above to automatically limit applicant eligibility to your company&apos;s state.
                            </span>
                          );
                        })()}
                      </div>
                    )}

                    {/* Feedback helper when EXACT_LOCATION is selected */}
                    {form.candidatePreference === "EXACT_LOCATION" && (
                      <div className="rounded-control border border-border-default/60 bg-surface-subtle/50 px-3 py-2 text-xs text-text-secondary">
                        {form.selectedOffices.length > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="shrink-0 text-brand" />
                            <span>
                              Only candidates residing in <strong className="text-text-primary">{form.selectedOffices.map((o) => o.city).join(", ")}</strong> will be eligible to apply.
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted">
                            Add your company office location above to automatically limit applicant eligibility to your office city.
                          </span>
                        )}
                      </div>
                    )}

                    {/* Specific targets selector if chosen */}
                    {form.candidatePreference === "SPECIFIC_LOCATION" && (
                      <div className="mt-3 space-y-2 rounded-control border border-border-default bg-surface-subtle/40 p-3.5">
                        <label className={labelClass}>
                          Add Allowed Cities or States
                        </label>
                        <CandidateScopeSelector
                          onAdd={handleAddPreferredTarget}
                          placeholder="Search allowed city or state..."
                        />
                        {fieldErrors.preferredTargets && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-status-error animate-in fade-in duration-150">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{fieldErrors.preferredTargets}</span>
                          </p>
                        )}

                        {form.preferredTargets.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {form.preferredTargets.map((target) => (
                              <span
                                key={target.name}
                                className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-card px-2 py-0.5 text-xs text-text-primary"
                              >
                                <span>{target.name}</span>
                                <span className="text-[10px] text-text-muted">
                                  ({target.type})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePreferredTarget(target.name)}
                                  className="ml-1 text-text-muted hover:text-status-error"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
                    >
                      <ArrowLeft size={13} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 rounded-control bg-brand px-5 py-2.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
                    >
                      <span>Continue to Compensation</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: COMPENSATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Experience fields */}
                  <div>
                    <label className={labelClass}>
                      Experience Requirement (Years)
                      <span className="ml-1 text-status-error">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Minimum (0 for Fresher)"
                        name="experienceMin"
                        value={form.experienceMin}
                        onChange={handleChange}
                        placeholder="0"
                        type="number"
                        min="0"
                        max="30"
                        error={fieldErrors.experienceMin}
                        required
                      />

                      <Field
                        label="Maximum (Optional)"
                        name="experienceMax"
                        value={form.experienceMax}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        type="number"
                        min="0"
                        max="30"
                        error={fieldErrors.experienceMax}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                      <span>Formatted display:</span>
                      <span className="rounded-control bg-surface-subtle px-2 py-0.5 font-semibold text-text-primary">
                        {previewExperience}
                      </span>
                    </div>
                  </div>

                  {/* Salary & Application Email */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Compensation / Salary"
                      name="salary"
                      value={form.salary}
                      onChange={handleChange}
                      placeholder="e.g. ₹12–18 LPA or Not Disclosed"
                      icon={Banknote}
                    />

                    <div>
                      <Field
                        label="Application Email"
                        name="mail"
                        value={form.mail}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        placeholder="careers@company.com"
                        icon={Mail}
                        type="email"
                        error={fieldErrors.mail}
                        required
                      />
                      <div className="min-h-[22px]">
                        {isValidatingEmail && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-text-muted animate-in fade-in duration-150">
                            <LoaderCircle size={12} className="animate-spin text-brand shrink-0" />
                            <span>Verifying mail server & MX records...</span>
                          </p>
                        )}
                        {!isValidatingEmail && !fieldErrors.mail && emailVerifiedDomain && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-text-muted animate-in fade-in duration-150">
                            <CheckCircle2 size={12} className="shrink-0 text-brand" />
                            <span>Active email domain (@{emailVerifiedDomain})</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Posting Date */}
                  <div className="max-w-xs">
                    <Field
                      label="Posting Date"
                      name="postedDate"
                      value={form.postedDate}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      type="date"
                      icon={CalendarDays}
                      required
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
                    >
                      <ArrowLeft size={13} />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        isNavigatingRef.current = true;
                        e.preventDefault();
                      }}
                      onClick={handleNext}
                      disabled={isCheckingNext}
                      className="inline-flex items-center gap-1.5 rounded-control bg-brand px-5 py-2.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCheckingNext ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>Verifying & Continuing...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Review</span>
                          <ArrowUpRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="description" className={`${labelClass} mb-0`}>
                        Job Description & Requirements
                        <span className="ml-1 text-status-error">*</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isGeneratingDesc}
                          onClick={handleGenerateDescription}
                          title="Generate a structured job description from role details"
                          className="inline-flex items-center gap-1.5 rounded-control border border-brand/30 bg-brand-soft/50 px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-brand-soft disabled:opacity-50"
                        >
                          {isGeneratingDesc ? (
                            <>
                              <LoaderCircle size={12} className="animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} />
                              <span>Generate Description</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isEnhancingDesc || !form.description.trim()}
                          onClick={handleEnhanceDescription}
                          title="Polish, format and add bullet points to existing text"
                          className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-secondary transition hover:bg-surface-base hover:text-text-primary disabled:opacity-40"
                        >
                          {isEnhancingDesc ? (
                            <>
                              <LoaderCircle size={12} className="animate-spin" />
                              <span>Polishing...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 size={12} />
                              <span>Enhance & Polish</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={descriptionTextareaRef}
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={(e) => {
                        handleChange(e);
                        adjustDescriptionHeight();
                      }}
                      onInput={adjustDescriptionHeight}
                      placeholder="Paste or write the complete role description, responsibilities, and requirements..."
                      style={{
                        minHeight: "220px",
                        overflow: "hidden",
                        resize: "none",
                      }}
                      className={`${inputClass} leading-relaxed transition-[border-color,box-shadow] ${fieldErrors.description
                          ? "border-status-error ring-1 ring-status-error/30 focus:border-status-error focus:ring-status-error/40"
                          : ""
                        }`}
                      required
                    />
                    {fieldErrors.description && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-status-error animate-in fade-in duration-150">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{fieldErrors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Live Preview Summary Card */}
                  <div className="rounded-card border border-border-default bg-surface-subtle/50 p-5">
                    <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Listing Preview
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-control bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary border border-border-default/40">
                          {form.category || "UI/UX & Product Design"}
                        </span>
                        <span className="rounded-control bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                          {form.workMode}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-text-primary">
                        {form.title || "Untitled Role"}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-text-secondary">
                        {form.company || "Company not specified"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-default/40 pt-3 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">
                          Location
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary truncate block">
                          {previewLocation}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">
                          Experience
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary block">
                          {previewExperience}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">
                          Salary
                        </span>
                        <span className="mt-0.5 font-semibold text-brand block">
                          {form.salary || "Not Disclosed"}
                        </span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">
                          Contact
                        </span>
                        <span className="mt-0.5 font-medium text-text-primary truncate block">
                          {form.mail || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Final Submit Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-subtle transition-all hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary disabled:opacity-50"
                    >
                      <ArrowLeft size={13} />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-brand px-6 text-sm font-semibold text-text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 shadow-subtle"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          <span>
                            {mode === "edit"
                              ? "Saving..."
                              : mode === "public"
                                ? "Submitting..."
                                : "Publishing..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>
                            {mode === "edit"
                              ? "Save Changes"
                              : mode === "public"
                                ? "Submit for Review"
                                : "Publish Job Listing"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      <Modal
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
        maxWidth="2xl"
        bodyClassName="p-5 sm:p-6"
        title={
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-text-primary sm:text-lg">
              How Posting Works
            </span>
            <span className="rounded-control bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              4 Quick Steps
            </span>
          </div>
        }
        description="Direct candidate reach to your HR email. Zero agency fees, zero middlemen."
      >
        <div className="space-y-4">
          {/* Step list */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                  1
                </span>
                <h3 className="text-xs font-semibold text-text-primary">
                  Role & AI Auto-Fill
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Add job title and role type, or paste raw notes and let Gemini AI fill all 4 steps.
              </p>
            </div>

            <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                  2
                </span>
                <h3 className="text-xs font-semibold text-text-primary">
                  Work Mode & City
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Select Onsite, Hybrid, or Remote and pick your office branch or pan-India.
              </p>
            </div>

            <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                  3
                </span>
                <h3 className="text-xs font-semibold text-text-primary">
                  Salary & Direct HR Email
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Set salary and your official HR email. Candidate resumes land straight in your inbox.
              </p>
            </div>

            <div className="rounded-control border border-border-default/60 bg-surface-subtle p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-brand/10 text-xs font-bold text-brand">
                  4
                </span>
                <h3 className="text-xs font-semibold text-text-primary">
                  Review & Go Live
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Quick preview and publish. Your opening goes live immediately with ₹0 commission.
              </p>
            </div>
          </div>

          {/* Key Advantages Banner */}
          <div className="rounded-control border border-brand/20 bg-brand-soft/40 p-3">
            <h4 className="text-xs font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <Sparkles size={13} className="text-brand" />
              <span>Direct Employer Benefits</span>
            </h4>
            <div className="grid gap-2 text-[11px] text-text-secondary sm:grid-cols-3">
              <div className="flex items-center gap-1.5">
                <Check size={12} className="text-brand shrink-0" />
                <span>Direct to your HR email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={12} className="text-brand shrink-0" />
                <span>₹0 Commission & no hidden fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={12} className="text-brand shrink-0" />
                <span>Top tech & design talent</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowHowItWorksModal(false)}
              className="rounded-control bg-brand px-5 py-2 text-xs font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover"
            >
              Got it, let's post
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
