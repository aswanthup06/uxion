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
  Clock3,
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
} from "lucide-react";
import { State, City } from "country-state-city";
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

export type CandidatePreference =
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
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  placeholder: string;
  icon?: React.ElementType;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
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
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
            strokeWidth={1.8}
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
        />
      </div>
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
                onSelect({
                  city: query.trim(),
                  state: "",
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

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-border-default/40 pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-brand" strokeWidth={2.2} />}
        <h2 className="text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
      </div>
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
    employmentType: "FULL_TIME",
    workMode: "Onsite",
    location: "",
    selectedOffices: [],
    candidatePreference: "ALL_INDIA",
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
  const [currentStep, setCurrentStep] = useState<number>(1);

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
    let candPref: CandidatePreference = "ALL_INDIA";

    if (
      remType === "WORLDWIDE" ||
      notes.toLowerCase().includes("global") ||
      notes.toLowerCase().includes("worldwide")
    ) {
      candPref = "WORLDWIDE";
    } else if (targets.length > 0 || remType === "REGIONS") {
      candPref = "SPECIFIC_LOCATION";
    } else if (
      notes.toLowerCase().includes("local only") ||
      notes.toLowerCase().includes("must reside in") ||
      rawLoc.includes("Local only")
    ) {
      candPref = "EXACT_LOCATION";
    } else {
      candPref = "ALL_INDIA";
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
    if (stepNumber === 1) {
      if (!form.title.trim()) {
        setError("Please enter a job title.");
        return false;
      }
      if (!form.company.trim()) {
        setError("Please enter the company name.");
        return false;
      }
    } else if (stepNumber === 2) {
      if (form.selectedOffices.length === 0) {
        setError("Please add at least one company office location.");
        return false;
      }
      if (
        form.candidatePreference === "SPECIFIC_LOCATION" &&
        form.preferredTargets.length === 0
      ) {
        setError("Please select at least one allowed candidate city or state.");
        return false;
      }
    } else if (stepNumber === 3) {
      if (!form.experienceMin.trim()) {
        setError("Please enter minimum experience required (0 for fresher).");
        return false;
      }
      const min = Number(form.experienceMin);
      if (isNaN(min) || min < 0) {
        setError("Please enter a valid minimum experience (0 or higher).");
        return false;
      }
      if (form.experienceMax.trim() !== "") {
        const max = Number(form.experienceMax);
        if (isNaN(max) || max < 0) {
          setError("Please enter a valid maximum experience.");
          return false;
        }
        if (max < min) {
          setError("Maximum experience cannot be less than minimum experience.");
          return false;
        }
      }
    } else if (stepNumber === 4) {
      if (!form.description.trim()) {
        setError("Please provide a job description.");
        return false;
      }
      if (!form.mail.trim() || !form.mail.includes("@")) {
        setError("Please provide a valid application email.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep: number) => {
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleAddOffice = (office: OfficeLocation) => {
    setForm((prev) => {
      const exists = prev.selectedOffices.some(
        (o) => o.city.toLowerCase() === office.city.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        selectedOffices: [...prev.selectedOffices, office],
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

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
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
      const primaryState = primaryOffice?.state || "";
      const primaryCountry = primaryOffice?.country || "India";
      const primaryCountryCode = primaryOffice?.countryCode || "IN";
      const officeNames = form.selectedOffices.map((o) => o.city);
      const officeSummary = officeNames.join(", ");

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
        if (form.candidatePreference === "WORLDWIDE") {
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
        if (form.candidatePreference === "EXACT_LOCATION") {
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
        postedDate: new Date(`${form.postedDate}T00:00:00.000Z`).toISOString(),
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
        router.push("/admin/jobs");
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
    const prefNames = form.preferredTargets.map((t) => t.name).join(", ");

    if (isRemote) {
      if (form.candidatePreference === "ALL_INDIA") return "Remote · Pan-India";
      if (form.candidatePreference === "WORLDWIDE") return "Remote · Worldwide";
      if (form.candidatePreference === "EXACT_LOCATION") return `Remote · ${officeSummary}`;
      if (form.candidatePreference === "SPECIFIC_LOCATION") return `Remote · ${prefNames || "Specific areas"}`;
      return "Remote · Pan-India";
    }

    const prefix = isHybrid ? "Hybrid · " : "";
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
                    employmentType: "FULL_TIME",
                    workMode: "Onsite",
                    location: "",
                    selectedOffices: [],
                    candidatePreference: "ALL_INDIA",
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
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
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
            <span className="font-medium text-text-primary">
              {mode === "edit" ? "Edit job" : "Add job"}
            </span>
          </nav>
        )}

        {/* Header */}
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "public" ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Recruiter & Hiring Portal
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                  Post a UX & Design Job
                </h1>
                <p className="mt-1.5 text-xs text-text-muted">
                  Reach verified product designers, UX researchers, and creative leaders across India and worldwide.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                  {mode === "edit" ? "Edit Job Listing" : "Add New Job"}
                </h1>
                {mode === "edit" && jobId && (
                  <p className="mt-1 font-mono text-[11px] text-text-muted">ID: {jobId}</p>
                )}
              </>
            )}
          </div>
          <Link
            href={mode === "public" ? "/jobs" : "/admin/jobs"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            <span>{mode === "public" ? "Back to Jobs" : "Cancel"}</span>
          </Link>
        </header>

        {/* Minimal 4-Step Progress Section */}
        <div className="mb-8 border-b border-border-default/60 pb-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, tag: "01", label: "Role" },
              { num: 2, tag: "02", label: "Location" },
              { num: 3, tag: "03", label: "Compensation" },
              { num: 4, tag: "04", label: "Review" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleStepClick(step.num)}
                  className={`group flex flex-col text-left transition-colors focus:outline-none ${isActive
                    ? "text-brand"
                    : isPast
                      ? "text-text-primary hover:text-brand"
                      : "text-text-muted hover:text-text-secondary"
                    }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive
                        ? "bg-brand"
                        : isPast
                          ? "bg-text-secondary"
                          : "bg-border-strong"
                        }`}
                    />
                    <span>{step.tag}</span>
                    <span className="hidden sm:inline font-medium text-text-secondary">
                      {step.label}
                    </span>
                  </div>
                  <div
                    className={`mt-2 h-0.5 w-full rounded-full transition-colors ${isActive
                      ? "bg-brand"
                      : isPast
                        ? "bg-brand/60"
                        : "bg-border-default"
                      }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
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
              <SectionHeader title="Role Overview" icon={BriefcaseBusiness} />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Job Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer"
                  icon={BriefcaseBusiness}
                  required
                />

                <Field
                  label="Company Name"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Inc."
                  icon={Building2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="employmentType" className={labelClass}>
                    Employment Type
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACTOR">Contract</option>
                    <option value="INTERN">Internship</option>
                  </select>
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
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-control bg-brand px-5 py-2.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
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
              <SectionHeader title="Work Mode & Locations" icon={Compass} />

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
                  {[
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
                      desc: form.workMode === "Remote"
                        ? "Remote, but candidate must reside in office city"
                        : "Local candidates only",
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
                    },
                  ].map((pref) => {
                    const isSelected = form.candidatePreference === pref.id;
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            candidatePreference: pref.id as CandidatePreference,
                          }));
                          if (error) setError("");
                        }}
                        className={`flex flex-col rounded-control border p-3 text-left transition-all ${isSelected
                          ? "border-brand bg-brand-soft/60"
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
                  })}
                </div>

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
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
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
              <SectionHeader title="Experience & Compensation" icon={Banknote} />

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

                <Field
                  label="Application Email"
                  name="mail"
                  value={form.mail}
                  onChange={handleChange}
                  placeholder="careers@company.com"
                  icon={Mail}
                  type="email"
                  required
                />
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
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-control bg-brand px-5 py-2.5 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
                >
                  <span>Continue to Review</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <SectionHeader title="Review & Publish" icon={FileText} />

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Job Description & Requirements
                  <span className="ml-1 text-status-error">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={9}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Paste or write the complete role description, responsibilities, and requirements..."
                  className={`${inputClass} leading-relaxed`}
                  required
                />
              </div>

              {/* Live Preview Summary Card */}
              <div className="rounded-card border border-border-default bg-surface-subtle/50 p-5">
                <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Listing Preview
                  </span>
                  <span className="rounded-control bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                    {form.workMode}
                  </span>
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
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary transition hover:text-text-primary disabled:opacity-50"
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
    </main>
  );
}
