
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import type { ElementType, FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Save,
  X,
  Globe,
  Plus,
} from "lucide-react";
import {
  COUNTRIES,
  INDIAN_STATES,
  CANONICAL_CITIES,
  formatLocationLabel,
  normalizeWorkMode,
  type RemoteEligibilityType,
} from "@/lib/supabase/locations-data";

const POPULAR_HUBS = [
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Kochi", state: "Kerala" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Chennai", state: "Tamil Nadu" },
];

interface SelectedCity {
  city: string;
  state: string;
}

interface JobForm {
  id: string;
  title: string;
  company: string;
  workMode: "Onsite" | "Hybrid" | "Remote";
  location: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  selectedCities: SelectedCity[];
  candidatePreference: "ALL_INDIA" | "STATE_SPECIFIC" | "LOCAL_ONLY" | "WORLDWIDE" | "COUNTRIES";
  preferredStates: string[];
  locality: string;
  postalCode: string;
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

interface JobFromAPI {
  id: string | number;
  title?: string;
  company?: string;
  location?: string;
  workMode?: string;
  experience?: string;
  experienceMin?: string | number;
  experienceMax?: string | number;
  postedDate?: string;
  salary?: string;
  mail?: string;
  companyLink?: string;
  description?: string;
}

const inputClass =
  "w-full min-w-0 rounded-control border border-border-default bg-surface-card px-3.5 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring disabled:bg-surface-subtle disabled:text-text-muted";

const labelClass =
  "mb-2 block text-[13px] font-medium text-text-secondary";

function dateForInput(value?: string): string {
  if (!value) return "";

  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateOnly) return dateOnly[1];

  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    const candidate = `${year}-${month}-${day}`;
    const date = new Date(`${candidate}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === candidate
      ? candidate
      : "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

function parseExperience(job: JobFromAPI) {
  if (job.experienceMin != null) {
    return {
      experienceMin: String(job.experienceMin),
      experienceMax:
        job.experienceMax == null ? "" : String(job.experienceMax),
    };
  }

  const value = (job.experience ?? "").trim();

  if (!value || /^fresher$/i.test(value)) {
    return { experienceMin: "0", experienceMax: "0" };
  }

  const number = String.raw`(\d+(?:\.\d+)?)`;
  const range = value.match(new RegExp(`${number}\\s*-\\s*${number}`));

  if (range) {
    return {
      experienceMin: range[1],
      experienceMax: range[2],
    };
  }

  const minimum = value.match(new RegExp(`${number}\\s*\\+`));

  if (minimum) {
    return {
      experienceMin: minimum[1],
      experienceMax: "",
    };
  }

  const single = value.match(new RegExp(number));

  return single
    ? { experienceMin: single[1], experienceMax: "" }
    : { experienceMin: "", experienceMax: "" };
}

function makeExperienceValue(min: string, max: string) {
  const minimum = min.trim();
  const maximum = max.trim();

  if (minimum === "0" && (!maximum || maximum === "0")) {
    return "Fresher";
  }

  if (minimum && maximum) return `${minimum}-${maximum} years`;
  if (minimum) return `${minimum}+ years`;

  return "";
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  min,
  step,
  hint,
}: {
  label: string;
  name: keyof JobForm;
  value: string;
  onChange: (name: keyof JobForm, value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: ElementType;
  min?: string;
  step?: string;
  hint?: string;
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
            size={16}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-text-muted">{hint}</p>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-default py-7 sm:py-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
          <Icon size={17} strokeWidth={1.7} />
        </span>

        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-text-primary">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-muted sm:text-[13px]">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [form, setForm] = useState<JobForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadJob = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setLoadError("");
      setForm(null);

      try {
        const response = await fetch("/api/jobs", {
          cache: "no-store",
          signal,
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve job listings.");
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The jobs API returned an unexpected response.");
        }

        const job = (data as JobFromAPI[]).find(
          (item) => String(item.id) === String(jobId)
        );

        if (!job) {
          setLoadError(
            "This job could not be found. It may have been deleted."
          );
          return;
        }

        const experience = parseExperience(job);
        const rawLoc = job.location ?? "";
        const workMode = normalizeWorkMode(job.workMode, rawLoc);
        const remType: RemoteEligibilityType =
          (job as any).remoteEligibilityType ??
          (job as any).remote_eligibility_type ??
          (workMode === "Remote" ? "COUNTRIES" : "UNSPECIFIED");
        const regions =
          (job as any).remoteEligibilityRegions ??
          (job as any).remote_eligibility_regions;
        const regionState =
          Array.isArray(regions) && regions.length > 0 ? regions[0].region : "";

        // Determine selected cities from physicalLocations or primaryCity or rawLoc
        let initialCities: SelectedCity[] = [];
        const rawPhys = (job as any).physicalLocations ?? (job as any).physical_locations;
        if (Array.isArray(rawPhys) && rawPhys.length > 0) {
          initialCities = rawPhys
            .filter((p: any) => p && p.city)
            .map((p: any) => ({ city: p.city, state: p.state || "" }));
        } else if ((job as any).primaryCity) {
          initialCities = [
            {
              city: (job as any).primaryCity,
              state: (job as any).primaryState || "",
            },
          ];
        } else if (rawLoc && rawLoc.includes(",") && !rawLoc.toLowerCase().includes("remote")) {
          const parts = rawLoc.split(",").map((s: string) => s.trim());
          if (parts.length > 1) {
            initialCities = parts.map((p: string) => {
              const matched = CANONICAL_CITIES.find(
                (c) => c.name.toLowerCase() === p.toLowerCase()
              );
              return { city: p, state: matched ? matched.state : "" };
            });
          }
        }

        // Determine candidate preference
        let candPref: "ALL_INDIA" | "STATE_SPECIFIC" | "LOCAL_ONLY" | "WORLDWIDE" | "COUNTRIES" = "ALL_INDIA";
        const prefStates: string[] = Array.isArray(regions) && regions.length > 0
          ? regions.map((r: { region: string }) => r.region)
          : [];

        if (workMode === "Remote") {
          if (remType === "WORLDWIDE") candPref = "WORLDWIDE";
          else if (remType === "REGIONS") candPref = "STATE_SPECIFIC";
          else if (remType === "COUNTRIES" && (job as any).remoteEligibilityCountries?.length > 1) candPref = "COUNTRIES";
          else candPref = "ALL_INDIA";
        } else {
          const notes = String((job as any).workModeNotes ?? (job as any).work_mode_notes ?? "");
          if (notes.includes("Local") || rawLoc.includes("Local only")) {
            candPref = "LOCAL_ONLY";
          } else if (notes.includes("preferred") || rawLoc.includes("preferred") || remType === "REGIONS") {
            candPref = "STATE_SPECIFIC";
            if (prefStates.length === 0 && (job as any).primaryState) {
              prefStates.push((job as any).primaryState);
            }
          }
        }

        setForm({
          id: String(job.id),
          title: job.title ?? "",
          company: job.company ?? "",
          workMode,
          location: rawLoc,
          city: (job as any).primaryCity ?? (job as any).primary_city ?? (initialCities[0]?.city || ""),
          state:
            (job as any).primaryState ??
            (job as any).primary_state ??
            regionState ??
            (initialCities[0]?.state || ""),
          country: (job as any).primaryCountry ?? (job as any).primary_country ?? "India",
          countryCode: (job as any).primaryCountryCode ?? (job as any).primary_country_code ?? "IN",
          selectedCities: initialCities,
          candidatePreference: candPref,
          preferredStates: prefStates,
          locality: (job as any).locality ?? "",
          postalCode: (job as any).postalCode ?? (job as any).postal_code ?? "",
          remoteEligibilityType: remType,
          remoteEligibilityCountries:
            (job as any).remoteEligibilityCountries ??
            (job as any).remote_eligibility_countries ??
            ["IN"],
          hqLocation: (job as any).hqLocationId ?? (job as any).hq_location_id ?? "",
          experienceMin: experience.experienceMin,
          experienceMax: experience.experienceMax,
          postedDate: dateForInput(job.postedDate),
          salary: job.salary ?? "",
          mail: job.mail ?? "",
          companyLink: job.companyLink ?? "",
          description: job.description ?? "",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the job."
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadJob(controller.signal);

    return () => controller.abort();
  }, [loadJob]);

  const [customCityInput, setCustomCityInput] = useState("");
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [showCustomCountries, setShowCustomCountries] = useState(false);

  const handleChange = (name: keyof JobForm, value: string) => {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  };

  const toggleCity = (cityName: string, defaultState?: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const exists = prev.selectedCities.some(
        (c) => c.city.toLowerCase() === cityName.toLowerCase()
      );
      let updatedCities: SelectedCity[];
      if (exists) {
        updatedCities = prev.selectedCities.filter(
          (c) => c.city.toLowerCase() !== cityName.toLowerCase()
        );
      } else {
        const matched = CANONICAL_CITIES.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        const stateName = defaultState || (matched ? matched.state : prev.state) || "";
        updatedCities = [...prev.selectedCities, { city: cityName, state: stateName }];
      }

      const first = updatedCities[0];
      return {
        ...prev,
        selectedCities: updatedCities,
        city: first ? first.city : "",
        state: first ? first.state : prev.state,
      };
    });
  };

  const handleAddCustomCity = () => {
    const trimmed = customCityInput.trim();
    if (!trimmed || !form) return;
    const matched = CANONICAL_CITIES.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    toggleCity(matched ? matched.name : trimmed, matched ? matched.state : form.state);
    setCustomCityInput("");
  };

  const togglePreferredState = (stateName: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const exists = prev.preferredStates.includes(stateName);
      const updated = exists
        ? prev.preferredStates.filter((s) => s !== stateName)
        : [...prev.preferredStates, stateName];
      return {
        ...prev,
        preferredStates: updated,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form || isSubmitting) return;

    const isRemote = form.workMode === "Remote";
    const isHybrid = form.workMode === "Hybrid";

    let computedLocation = form.location.trim();
    let primaryCity = form.city.trim();
    let primaryState = form.state.trim();
    let isMultiLocation = false;
    let physicalLocations: Array<{ city: string; state: string; countryCode: string }> | undefined;
    let workModeNotes: string | undefined;

    if (isRemote) {
      if (form.candidatePreference === "STATE_SPECIFIC" && form.preferredStates.length > 0) {
        computedLocation = `Remote · ${form.preferredStates.join(", ")}`;
      } else if (form.candidatePreference === "WORLDWIDE") {
        computedLocation = "Remote · Worldwide";
      } else if (form.candidatePreference === "COUNTRIES" && form.remoteEligibilityCountries.length > 0) {
        computedLocation = `Remote · ${form.remoteEligibilityCountries.length} countries`;
      } else {
        computedLocation = "Remote · India";
      }
    } else {
      // On-site or Hybrid
      const cityList = form.selectedCities.length > 0
        ? form.selectedCities
        : form.city.trim()
        ? [{ city: form.city.trim(), state: form.state.trim() }]
        : [];

      if (cityList.length > 1) {
        isMultiLocation = true;
        primaryCity = cityList[0].city;
        primaryState = cityList[0].state;
        physicalLocations = cityList.map((c) => ({
          city: c.city,
          state: c.state,
          countryCode: form.countryCode || "IN",
        }));
      } else if (cityList.length === 1) {
        primaryCity = cityList[0].city;
        primaryState = cityList[0].state;
      }

      const cityBaseNames = cityList.map((c) => c.city);
      const cityStr = cityBaseNames.length > 0
        ? cityBaseNames.join(", ")
        : primaryState
        ? `${primaryState}, ${form.country}`
        : "Location not specified";

      if (form.candidatePreference === "STATE_SPECIFIC" && form.preferredStates.length > 0) {
        workModeNotes = `${form.preferredStates.join(", ")} candidates preferred`;
        computedLocation = cityBaseNames.length > 0
          ? `${cityStr} (${form.preferredStates.join(", ")} preferred)`
          : `${form.preferredStates.join(", ")}, India`;
      } else if (form.candidatePreference === "LOCAL_ONLY") {
        workModeNotes = "Local candidates only (no relocation)";
        computedLocation = `${cityStr} (Local only)`;
      } else {
        computedLocation = cityList.length === 1 && primaryCity && primaryState
          ? `${primaryCity}, ${primaryState}`
          : cityStr;
      }

      if (isHybrid && !computedLocation.startsWith("Hybrid")) {
        computedLocation = `Hybrid · ${computedLocation}`;
      }
    }

    if (!computedLocation) {
      computedLocation = isRemote ? "Remote · India" : "Location not specified";
    }

    if (!form.title.trim() || !form.company.trim() || (!computedLocation && !isRemote)) {
      toast.error("Please complete the job title, company and location.");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please enter the job description.");
      return;
    }

    const minimum = Number(form.experienceMin);
    const maximum =
      form.experienceMax.trim() === "" ? null : Number(form.experienceMax);

    if (
      form.experienceMin.trim() === "" ||
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      toast.error("Enter a valid minimum experience.");
      return;
    }

    if (
      maximum !== null &&
      (!Number.isFinite(maximum) || maximum < 0)
    ) {
      toast.error("Enter a valid maximum experience.");
      return;
    }

    if (maximum !== null && maximum < minimum) {
      toast.error(
        "Maximum experience must be greater than or equal to minimum."
      );
      return;
    }

    if (!dateForInput(form.postedDate)) {
      toast.error("Please select a valid posting date.");
      return;
    }

    if (form.companyLink.trim()) {
      try {
        const url = new URL(form.companyLink.trim());

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Invalid protocol");
        }
      } catch {
        toast.error("Company website must be a valid HTTP or HTTPS URL.");
        return;
      }
    }

    if (!form.mail.trim()) {
      toast.error("Please enter an application email.");
      return;
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.mail.trim()
    );

    if (!emailLooksValid) {
      toast.error("Enter a valid application email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: form.id,
        title: form.title.trim(),
        company: form.company.trim(),
        location: computedLocation,
        workMode: form.workMode,
        primaryCity: primaryCity || undefined,
        primaryState: primaryState || undefined,
        primaryCountry: form.country.trim() || "India",
        primaryCountryCode: form.countryCode || "IN",
        locality: form.locality.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        isMultiLocation,
        physicalLocations,
        workModeNotes: workModeNotes ?? null,
        remoteEligibilityType: isRemote
          ? form.candidatePreference === "STATE_SPECIFIC"
            ? "REGIONS"
            : form.candidatePreference === "WORLDWIDE"
            ? "WORLDWIDE"
            : "COUNTRIES"
          : null,
        remoteEligibilityCountries:
          isRemote && (form.candidatePreference === "ALL_INDIA" || form.candidatePreference === "COUNTRIES")
            ? form.remoteEligibilityCountries
            : null,
        remoteEligibilityRegions:
          isRemote && form.candidatePreference === "STATE_SPECIFIC" && form.preferredStates.length > 0
            ? form.preferredStates.map((s) => ({ countryCode: "IN", region: s }))
            : [],
        hqLocationId: form.hqLocation.trim() || undefined,
        experience: makeExperienceValue(
          form.experienceMin,
          form.experienceMax
        ),
        postedDate: new Date(
          `${form.postedDate}T00:00:00.000Z`
        ).toISOString(),
        salary: form.salary.trim(),
        mail: form.mail.trim(),
        companyLink: form.companyLink.trim(),
        description: form.description.trim(),
      };

      const response = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Failed to update the job. Please try again."
        );
      }

      toast.success("Job updated successfully!");
      router.push("/admin/jobs");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the job."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-full bg-surface-page px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-3 w-28 rounded-pill bg-border-subtle" />
          <div className="mt-5 h-8 w-56 rounded-pill bg-border-subtle" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-pill bg-surface-subtle" />

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="mt-8 border-b border-border-subtle py-8"
            >
              <div className="h-4 w-40 rounded-pill bg-border-subtle" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="h-11 rounded-control bg-surface-subtle" />
                <div className="h-11 rounded-control bg-surface-subtle" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (loadError || !form) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-surface-page px-5 py-12">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-red-50 text-red-600">
            <AlertCircle size={21} />
          </span>

          <h1 className="mt-4 text-lg font-semibold text-text-primary">
            Unable to open this job
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {loadError || "The requested job is unavailable."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                void loadJob(controller.signal);
              }}
              className="rounded-control border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle"
            >
              Try again
            </button>

            <Link
              href="/admin/jobs"
              className="rounded-control bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse transition hover:bg-brand-hover"
            >
              Back to jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-surface-page text-text-primary">
      <div className="mx-auto max-w-5xl px-5 pb-32 pt-6 sm:px-8 sm:pt-9">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition hover:text-brand">
            Dashboard
          </Link>
          <ChevronRight size={13} />
          <Link
            href="/admin/jobs"
            className="transition hover:text-brand"
          >
            Manage jobs
          </Link>
          <ChevronRight size={13} />
          <span className="font-medium text-text-primary">Edit listing</span>
        </nav>

        <header className="flex flex-col gap-5 border-b border-border-subtle pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Job management
            </p>

            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-text-primary sm:text-[32px]">
              Edit job listing
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
              Make changes to the listing and save when everything looks right.
            </p>
          </div>

          <Link
            href="/admin/jobs"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-control border border-border-default px-3.5 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:bg-surface-subtle sm:self-auto"
          >
            <ArrowLeft size={15} />
            Back to jobs
          </Link>
        </header>

        <div className="flex items-start gap-3 border-b border-border-subtle py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
            <BriefcaseBusiness size={19} strokeWidth={1.7} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold text-text-primary">
              {form.title || "Untitled job"}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={13} />
                {form.company || "Company not set"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />
                {form.location || "Location not set"}
              </span>
            </p>
          </div>

          <span className="hidden items-center gap-1.5 pt-1 text-xs font-medium text-brand sm:inline-flex">
            <Check size={14} />
            Editing
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Role & Company */}
          <Section
            icon={BriefcaseBusiness}
            title="01 Role & Company"
            description="Basic information about the role and organization."
          >
            <div className="sm:col-span-2">
              <Field
                label="Job title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior UI/UX Designer"
                icon={BriefcaseBusiness}
                required
              />
            </div>

            <Field
              label="Company name"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Zenoway Technologies"
              icon={Building2}
              required
            />

            <Field
              label="Company website"
              name="companyLink"
              value={form.companyLink}
              onChange={handleChange}
              type="url"
              placeholder="https://company.com (optional)"
              icon={Globe}
            />

            {/* Work arrangement selector */}
            <div className="sm:col-span-2 pt-2">
              <label className={labelClass}>
                Work arrangement <span className="text-status-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: "Onsite" as const, label: "On-site", desc: "Work from office" },
                  { mode: "Hybrid" as const, label: "Hybrid", desc: "Office & remote" },
                  { mode: "Remote" as const, label: "Remote", desc: "Work from anywhere" },
                ].map((item) => {
                  const active = form.workMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() =>
                        setForm((prev) => (prev ? { ...prev, workMode: item.mode } : prev))
                      }
                      className={`cursor-pointer rounded-control border p-3 text-left transition-all duration-normal ${
                        active
                          ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                          : "border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-subtle"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${active ? "text-brand-dark" : "text-text-primary"}`}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Section 2: Work Location & Scope */}
          {/* Section 2: Work Location & Candidate Preference */}
          <Section
            icon={MapPin}
            title="02 Work & Candidate Location"
            description="Specify physical office branches and candidate residency preferences."
          >
            <div className="sm:col-span-2 space-y-6">
              {/* Part A: Office Location (when On-site or Hybrid) */}
              {form.workMode !== "Remote" && (
                <div className="rounded-control border border-border-default bg-surface-base p-4.5 space-y-4">
                  <div>
                    <label className={labelClass}>
                      Office Branch / Work Location(s) <span className="text-status-error">*</span>
                    </label>
                    <p className="text-xs text-text-muted mb-2.5">
                      Select 1 or more office branches where candidates can work:
                    </p>

                    {/* Quick popular tech hub pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {POPULAR_HUBS.map((hub) => {
                        const isSelected = form.selectedCities.some(
                          (c) => c.city.toLowerCase() === hub.city.toLowerCase()
                        );
                        return (
                          <button
                            key={hub.city}
                            type="button"
                            onClick={() => toggleCity(hub.city, hub.state)}
                            className={`cursor-pointer rounded-pill border px-3 py-1 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-brand bg-brand text-text-inverse font-semibold shadow-xs"
                                : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                            }`}
                          >
                            {hub.city} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Selected Cities Tags */}
                    {form.selectedCities.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2 rounded-control bg-brand-soft/40 border border-brand/20 p-2.5">
                        <span className="text-[11px] font-semibold text-brand-dark self-center mr-1">
                          Selected Offices ({form.selectedCities.length}):
                        </span>
                        {form.selectedCities.map((sc) => (
                          <span
                            key={sc.city}
                            className="inline-flex items-center gap-1.5 rounded-pill bg-surface-card border border-brand/40 px-2.5 py-1 text-xs font-semibold text-text-primary"
                          >
                            📍 {sc.city}
                            {sc.state ? <span className="text-text-muted font-normal">({sc.state})</span> : null}
                            <button
                              type="button"
                              onClick={() => toggleCity(sc.city)}
                              className="text-text-muted hover:text-status-error cursor-pointer ml-0.5"
                              title="Remove city"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Custom City row */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <input
                          id="edit-custom-city-input"
                          value={customCityInput}
                          onChange={(e) => setCustomCityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomCity();
                            }
                          }}
                          placeholder="Type another city and press Add (e.g. Kozhikode, Mysore, Chandigarh)"
                          list="edit-canonical-city-options"
                          className={`${inputClass} text-xs py-2`}
                        />
                        <datalist id="edit-canonical-city-options">
                          {CANONICAL_CITIES.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.state}, {c.countryCode}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomCity}
                        className="cursor-pointer rounded-control border border-border-strong bg-surface-card px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-subtle"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Locality & PIN collapsible (only relevant when 1 office) */}
                  {form.selectedCities.length <= 1 && (
                    <div className="border-t border-border-subtle pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressDetails((prev) => !prev)}
                        className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                      >
                        {showAddressDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAddressDetails ? "Hide specific building / PIN" : "+ Add specific building, tech park or PIN code"}
                      </button>

                      {showAddressDetails && (
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="Specific locality / Tech Park"
                            name="locality"
                            value={form.locality}
                            onChange={(name, val) => handleChange(name, val)}
                            placeholder="e.g. Infopark Phase 2, Koramangala"
                            icon={MapPin}
                          />
                          <Field
                            label="Postal code (PIN)"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={(name, val) => handleChange(name, val)}
                            placeholder="e.g. 682042"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Part B: Preferred Candidate Location / Hiring Scope */}
              <div>
                <label className={labelClass}>
                  Preferred candidate location (Who can apply?) <span className="text-status-error">*</span>
                </label>
                <p className="text-xs text-text-muted mb-2.5">
                  Set candidate residency or relocation preference:
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              candidatePreference: "ALL_INDIA",
                              remoteEligibilityType: "COUNTRIES",
                              remoteEligibilityCountries: ["IN"],
                            }
                          : prev
                      );
                      setShowCustomCountries(false);
                    }}
                    className={`cursor-pointer rounded-control border p-3.5 text-left transition-all ${
                      form.candidatePreference === "ALL_INDIA"
                        ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                        : "border-border-default bg-surface-card hover:border-border-strong"
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-primary">🇮🇳 All India</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {form.workMode === "Remote"
                        ? "Remote from anywhere in India"
                        : "Open to candidates anywhere in India (relocation welcome)"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              candidatePreference: "STATE_SPECIFIC",
                              remoteEligibilityType: "REGIONS",
                              preferredStates:
                                prev.preferredStates.length > 0
                                  ? prev.preferredStates
                                  : prev.state
                                  ? [prev.state]
                                  : ["Kerala"],
                            }
                          : prev
                      );
                      setShowCustomCountries(false);
                    }}
                    className={`cursor-pointer rounded-control border p-3.5 text-left transition-all ${
                      form.candidatePreference === "STATE_SPECIFIC"
                        ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                        : "border-border-default bg-surface-card hover:border-border-strong"
                    }`}
                  >
                    <p className="text-sm font-semibold text-text-primary">📍 Specific State(s)</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {form.workMode === "Remote"
                        ? "Must reside in selected state(s)"
                        : "Preference for candidates currently in state(s)"}
                    </p>
                  </button>

                  {form.workMode === "Remote" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                candidatePreference: "WORLDWIDE",
                                remoteEligibilityType: "WORLDWIDE",
                              }
                            : prev
                        );
                        setShowCustomCountries(false);
                      }}
                      className={`cursor-pointer rounded-control border p-3.5 text-left transition-all ${
                        form.candidatePreference === "WORLDWIDE"
                          ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                          : "border-border-default bg-surface-card hover:border-border-strong"
                      }`}
                    >
                      <p className="text-sm font-semibold text-text-primary">🌍 Worldwide</p>
                      <p className="mt-1 text-xs text-text-muted">Open to global applicants</p>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                candidatePreference: "LOCAL_ONLY",
                              }
                            : prev
                        );
                      }}
                      className={`cursor-pointer rounded-control border p-3.5 text-left transition-all ${
                        form.candidatePreference === "LOCAL_ONLY"
                          ? "border-brand bg-brand-soft ring-2 ring-brand/30"
                          : "border-border-default bg-surface-card hover:border-border-strong"
                      }`}
                    >
                      <p className="text-sm font-semibold text-text-primary">🏢 Local City Only</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Must already live locally (immediate joiners, no relocation)
                      </p>
                    </button>
                  )}
                </div>

                {/* State selector pills when State-Specific is chosen */}
                {form.candidatePreference === "STATE_SPECIFIC" && (
                  <div className="mt-3.5 rounded-control border border-brand/30 bg-brand-soft/40 p-4">
                    <p className="text-xs font-semibold text-brand-dark mb-2">
                      Select 1 or more states:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {["Kerala", "Karnataka", "Tamil Nadu", "Maharashtra", "Telangana", "Delhi", "Andhra Pradesh", "Gujarat"].map((st) => {
                        const isSelected = form.preferredStates.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => togglePreferredState(st)}
                            className={`cursor-pointer rounded-pill border px-3 py-1 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-brand bg-brand text-text-inverse font-semibold"
                                : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong"
                            }`}
                          >
                            {st} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        id="edit-state-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) togglePreferredState(e.target.value);
                        }}
                        className={`${inputClass} text-xs py-1.5 cursor-pointer max-w-xs`}
                      >
                        <option value="">+ Add any other Indian state...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      {form.preferredStates.length > 0 && (
                        <span className="text-xs text-text-muted">
                          Selected: <strong className="text-text-primary">{form.preferredStates.join(", ")}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* HQ context when Remote */}
                {form.workMode === "Remote" && (
                  <div className="pt-3">
                    <Field
                      label="Company headquarters (optional)"
                      name="hqLocation"
                      value={form.hqLocation}
                      onChange={(name, val) => handleChange(name, val)}
                      placeholder="e.g. Bengaluru, India (for candidate reference only)"
                      icon={Building2}
                      hint="Gives candidates context on company headquarters."
                    />
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Section 3: Experience & Compensation */}
          <Section
            icon={Clock3}
            title="03 Experience & Compensation"
            description="Qualifications, salary range, and posting schedule."
          >
            <Field
              label="Minimum experience (years)"
              name="experienceMin"
              value={form.experienceMin}
              onChange={handleChange}
              placeholder="0 for Fresher"
              type="number"
              min="0"
              step="0.5"
              required
              icon={Clock3}
              hint="Use 0 for fresher or entry-level roles."
            />

            <Field
              label="Maximum experience (years)"
              name="experienceMax"
              value={form.experienceMax}
              onChange={handleChange}
              placeholder="Leave blank for no max"
              type="number"
              min="0"
              step="0.5"
              icon={Clock3}
              hint="Optional upper limit."
            />

            <Field
              label="Salary range"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. ₹8–12 LPA or Not Disclosed"
              icon={Banknote}
            />

            <Field
              label="Posting date"
              name="postedDate"
              value={form.postedDate}
              onChange={handleChange}
              type="date"
              icon={CalendarDays}
              required
            />
          </Section>

          {/* Section 4: Application and contact */}
          <Section
            icon={Mail}
            title="04 Application Details"
            description="Where candidates will send their applications."
          >
            <div className="sm:col-span-2">
              <Field
                label="Application email"
                name="mail"
                value={form.mail}
                onChange={handleChange}
                type="email"
                placeholder="careers@company.com"
                icon={Mail}
                required
                hint="Candidates will apply by sending an email to this address."
              />
            </div>
          </Section>

          {/* Section 5: Description */}
          <Section
            icon={FileText}
            title="05 Job Description"
            description="Explain the responsibilities, requirements, and benefits."
          >
            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Description <span className="text-status-error">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={9}
                placeholder="Describe the role, responsibilities, requirements, perks, and how to apply..."
                required
                className={`${inputClass} min-h-48 resize-y leading-7`}
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                <span>Keep the description clear and easy to scan.</span>
                <span className="tabular-nums">
                  {form.description.length} characters
                </span>
              </div>
            </div>
          </Section>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-default bg-surface-base/95 px-4 py-3 backdrop-blur-md sm:px-8">
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-text-muted sm:block">
                <span className="text-status-error">*</span> Required fields
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/admin/jobs")}
                  disabled={isSubmitting}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-brand px-5 text-sm font-medium text-text-inverse transition hover:bg-brand-hover shadow-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Saving changes…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save changes
                      <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
