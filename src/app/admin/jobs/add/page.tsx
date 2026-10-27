"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  CalendarDays,
  Banknote,
  Mail,
  Globe,
  Clock3,
  FileText,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
} from "lucide-react";
import {
  COUNTRIES,
  INDIAN_STATES,
  CANONICAL_CITIES,
  type RemoteEligibilityType,
} from "@/lib/supabase/locations-data";

interface SelectedCity {
  city: string;
  state: string;
}

interface JobForm {
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

const inputClass =
  "w-full rounded-control border border-border-default bg-surface-card px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring disabled:cursor-not-allowed disabled:bg-surface-subtle";

const labelClass =
  "mb-2 block text-[13px] font-semibold text-text-secondary";

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
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder: string;
  icon?: React.ElementType;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
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
            className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand"
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

      {hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

function SectionHeader({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
        <Icon
          className="h-[19px] w-[19px] text-brand"
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold tracking-tight text-text-primary">
            {title}
          </h2>

          <span className="rounded-control bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-dark">
            {number}
          </span>
        </div>

        <p className="mt-1 text-sm leading-5 text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AddJobPage() {
  const router = useRouter();

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState<JobForm>({
    title: "",
    company: "",
    workMode: "Onsite",
    location: "",
    city: "",
    state: "",
    country: "India",
    countryCode: "IN",
    selectedCities: [],
    candidatePreference: "ALL_INDIA",
    preferredStates: [],
    locality: "",
    postalCode: "",
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

  const [customCityInput, setCustomCityInput] = useState("");
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [showCustomCountries, setShowCustomCountries] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const toggleCity = (cityName: string, defaultState?: string) => {
    setForm((prev) => {
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
    if (!trimmed) return;
    const matched = CANONICAL_CITIES.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    toggleCity(matched ? matched.name : trimmed, matched ? matched.state : form.state);
    setCustomCityInput("");
  };

  const togglePreferredState = (stateName: string) => {
    setForm((prev) => {
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

  const formatDateForStorage = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const minExperience = Number(form.experienceMin);

    const maxExperience =
      form.experienceMax.trim() === ""
        ? null
        : Number(form.experienceMax);

    if (
      form.experienceMin.trim() === "" ||
      !Number.isFinite(minExperience) ||
      minExperience < 0
    ) {
      setError("Please enter a valid minimum experience.");
      return;
    }

    if (
      maxExperience !== null &&
      (!Number.isFinite(maxExperience) ||
        maxExperience < 0 ||
        maxExperience < minExperience)
    ) {
      setError(
        "Maximum experience must be greater than or equal to minimum experience."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let experience = "";

      if (
        minExperience === 0 &&
        (maxExperience === null || maxExperience === 0)
      ) {
        experience = "Fresher";
      } else if (maxExperience !== null) {
        experience = `${minExperience}-${maxExperience} years`;
      } else {
        experience = `${minExperience}+ years`;
      }

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

      const payload = {
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
        workModeNotes,
        remoteEligibilityType: isRemote
          ? form.candidatePreference === "STATE_SPECIFIC"
            ? "REGIONS"
            : form.candidatePreference === "WORLDWIDE"
            ? "WORLDWIDE"
            : "COUNTRIES"
          : undefined,
        remoteEligibilityCountries:
          isRemote && (form.candidatePreference === "ALL_INDIA" || form.candidatePreference === "COUNTRIES")
            ? form.remoteEligibilityCountries
            : undefined,
        remoteEligibilityRegions:
          isRemote && form.candidatePreference === "STATE_SPECIFIC" && form.preferredStates.length > 0
            ? form.preferredStates.map((s) => ({ countryCode: "IN", region: s }))
            : undefined,
        hqLocationId: form.hqLocation.trim() || undefined,
        id: `JOB${Date.now()}`,
        postedDate: formatDateForStorage(form.postedDate),
        salary: form.salary.trim() || "Not Disclosed",
        mail: form.mail.trim(),
        companyLink: form.companyLink.trim(),
        description: form.description.trim(),
        experience,
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Unable to save the job. Please try again.";

        try {
          const data = await response.json();

          if (typeof data?.error === "string" && data.error.trim()) {
            message = data.error;
          } else if (
            typeof data?.message === "string" &&
            data.message.trim()
          ) {
            message = data.message;
          }
        } catch {
          // Keep the fallback error message.
        }

        setError(message);
        return;
      }

      router.push("/admin/jobs");
    } catch (err) {
      console.error("Error adding job:", err);
      setError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-surface-base text-text-primary">
      <div className="mx-auto max-w-4xl px-5 pb-32 pt-6 sm:px-8 sm:pt-9">
        {/* Breadcrumb navigation and page heading */}
        <div className="mb-7">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm"
          >
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-text-muted transition hover:text-brand"
            >
              Dashboard
            </button>

            <span className="text-border-strong">/</span>

            <button
              type="button"
              onClick={() => router.push("/admin/jobs")}
              className="text-text-muted transition hover:text-brand"
            >
              Manage jobs
            </button>

            <span className="text-border-strong">/</span>

            <span
              aria-current="page"
              className="font-semibold text-text-primary"
            >
              Add listing
            </span>
          </nav>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-brand">
                <Sparkles className="h-3.5 w-3.5" />
                Job management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Add a new job
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                Create a clean, discoverable job listing for candidates on Zenoway.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start border-l-2 border-brand pl-3 sm:self-auto">
              <span className="text-xs font-medium text-text-secondary">
                New listing
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Role & Company */}
          <section className="rounded-panel border border-border-default bg-surface-card p-6 shadow-subtle sm:p-7">
            <SectionHeader
              number="01"
              title="Role & Company"
              description="Basic information about the role and hiring organization."
              icon={BriefcaseBusiness}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Job title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior UX Designer"
                  icon={BriefcaseBusiness}
                  required
                />
              </div>

              <Field
                label="Company name"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Acme Technologies"
                icon={Building2}
                required
              />

              <Field
                label="Company website"
                name="companyLink"
                type="url"
                value={form.companyLink}
                onChange={handleChange}
                placeholder="https://acme.com (optional)"
                icon={Globe}
              />

              {/* Work Arrangement Selector */}
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
                        onClick={() => setForm((prev) => ({ ...prev, workMode: item.mode }))}
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
            </div>
          </section>

          {/* Section 2: Work Location & Candidate Preference */}
          <section className="rounded-panel border border-border-default bg-surface-card p-6 shadow-subtle sm:p-7">
            <SectionHeader
              number="02"
              title="Work & Candidate Location"
              description="Specify physical office branches and candidate residency preferences."
              icon={MapPin}
            />

            <div className="space-y-6">
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
                          id="custom-city-input"
                          value={customCityInput}
                          onChange={(e) => setCustomCityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomCity();
                            }
                          }}
                          placeholder="Type another city and press Add (e.g. Kozhikode, Mysore, Chandigarh)"
                          list="add-canonical-city-options"
                          className={`${inputClass} text-xs py-2`}
                        />
                        <datalist id="add-canonical-city-options">
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
                            onChange={handleChange}
                            placeholder="e.g. Infopark Phase 2, Koramangala"
                            icon={MapPin}
                          />
                          <Field
                            label="Postal code (PIN)"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={handleChange}
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
                      setForm((prev) => ({
                        ...prev,
                        candidatePreference: "ALL_INDIA",
                        remoteEligibilityType: "COUNTRIES",
                        remoteEligibilityCountries: ["IN"],
                      }));
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
                      setForm((prev) => ({
                        ...prev,
                        candidatePreference: "STATE_SPECIFIC",
                        remoteEligibilityType: "REGIONS",
                        preferredStates:
                          prev.preferredStates.length > 0
                            ? prev.preferredStates
                            : prev.state
                            ? [prev.state]
                            : ["Kerala"],
                      }));
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
                        setForm((prev) => ({
                          ...prev,
                          candidatePreference: "WORLDWIDE",
                          remoteEligibilityType: "WORLDWIDE",
                        }));
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
                        setForm((prev) => ({
                          ...prev,
                          candidatePreference: "LOCAL_ONLY",
                        }));
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
                        id="add-state-select"
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
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru, India (for candidate reference only)"
                      icon={Building2}
                      hint="Gives candidates context on company headquarters."
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Experience & Compensation */}
          <section className="rounded-panel border border-border-default bg-surface-card p-6 shadow-subtle sm:p-7">
            <SectionHeader
              number="03"
              title="Experience & Compensation"
              description="Candidate qualifications and salary range."
              icon={Clock3}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field
                label="Min experience (years)"
                name="experienceMin"
                type="number"
                value={form.experienceMin}
                onChange={handleChange}
                placeholder="0 for Fresher"
                icon={Clock3}
                min="0"
                step="any"
                required
              />

              <Field
                label="Max experience (years)"
                name="experienceMax"
                type="number"
                value={form.experienceMax}
                onChange={handleChange}
                placeholder="Leave blank for no max"
                icon={Clock3}
                min="0"
                step="any"
              />

              <Field
                label="Salary range"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. ₹8–12 LPA or Not Disclosed"
                icon={Banknote}
              />

              <div className="sm:col-span-3">
                <Field
                  label="Posting date"
                  name="postedDate"
                  type="date"
                  value={form.postedDate}
                  onChange={handleChange}
                  placeholder="Posting date"
                  icon={CalendarDays}
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 4: Job Description */}
          <section className="rounded-panel border border-border-default bg-surface-card p-6 shadow-subtle sm:p-7">
            <SectionHeader
              number="04"
              title="Job Description"
              description="Detailed requirements, responsibilities, and perks."
              icon={FileText}
            />

            <label htmlFor="description" className={labelClass}>
              Description <span className="text-status-error">*</span>
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={8}
              placeholder={`About the role:
• Detail key responsibilities

Requirements:
• Essential skills and experience

Benefits:
• Perks, healthcare, flexibility`}
              required
              className={`${inputClass} min-h-48 resize-y leading-6`}
            />
          </section>

          {/* Section 5: Application Details */}
          <section className="rounded-panel border border-border-default bg-surface-card p-6 shadow-subtle sm:p-7">
            <SectionHeader
              number="05"
              title="Application Details"
              description="Where applications and resumes should be sent."
              icon={Mail}
            />

            <Field
              label="Application email"
              name="mail"
              type="email"
              value={form.mail}
              onChange={handleChange}
              placeholder="careers@company.com"
              icon={Mail}
              required
              hint="Candidates will apply directly to this email address."
            />
          </section>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-control border border-status-error-border bg-status-error-bg px-4 py-3.5"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-error" />
              <p className="text-sm leading-5 text-status-error">{error}</p>
            </div>
          )}

          {/* Fixed bottom action bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-default bg-surface-base/95 px-4 py-3 backdrop-blur-md sm:px-8">
            <div className="mx-auto flex max-w-4xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-text-muted sm:block">
                <span className="text-status-error">*</span> Required fields
              </p>

              <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/admin/jobs")}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-control border border-border-default bg-surface-card px-5 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-6 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-hover shadow-subtle disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving job...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save job listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
