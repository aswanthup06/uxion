
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FiMapPin, FiChevronDown } from "react-icons/fi";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
  formatLocationLabel,
  type RemoteEligibilityType,
} from "@/lib/supabase/locations-data";


const inputClass =
  "mt-1.5 w-full rounded-control border border-border-default bg-surface-card px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-brand focus:ring-4 focus:ring-focus-ring";

const labelClass = "text-sm font-medium text-text-secondary";

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

const benefits = [
  "Health insurance",
  "Flexible hours",
  "Learning budget",
  "Paid leave",
  "Equipment provided",
];


function Field({
  label,
  hint,
  required = false,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-label="required">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-text-muted">{hint}</p>
      )}
    </div>
  );
}

function SelectChevron() {
  return (
    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
  );
}

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [employment, setEmployment] = useState("Full-time");
  const [arrangement, setArrangement] = useState("Remote");

  const [countryCode, setCountryCode] = useState("IN");
  const [countryName, setCountryName] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Remote applicant eligibility state
  const [remoteEligibilityType, setRemoteEligibilityType] = useState<RemoteEligibilityType>("COUNTRIES");
  const [eligibleCountries, setEligibleCountries] = useState<string[]>(["IN"]);
  const [eligibleRegion, setEligibleRegion] = useState("");
  const [eligibleCity, setEligibleCity] = useState("");
  const [hqLocation, setHqLocation] = useState("");

  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [salaryPeriod, setSalaryPeriod] = useState("year");
  const [showSalary, setShowSalary] = useState(true);

  const [email, setEmail] = useState("");

  const [expiry, setExpiry] = useState("30");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const isRemote = arrangement === "Remote";
  const isHybrid = arrangement === "Hybrid";

  // Dynamic available states & cities
  const availableStates = useMemo(() => getStatesForCountry(countryCode), [countryCode]);
  const availableCities = useMemo(() => getCitiesForState(countryCode, state), [countryCode, state]);

  // Formatted location display
  const location = isRemote
    ? formatLocationLabel({
        workMode: "Remote",
        remoteEligibilityType,
        remoteEligibilityCountries: eligibleCountries,
        location: hqLocation ? `Remote (HQ: ${hqLocation})` : "Remote",
      })
    : formatLocationLabel({
        workMode: isHybrid ? "Hybrid" : "Onsite",
        primaryCity: city.trim(),
        primaryState: state.trim(),
        primaryCountry: countryName.trim(),
      });

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const applicationComplete = validEmail;

  const salary = (() => {
    if (!showSalary || (!minSalary && !maxSalary)) return "";

    const symbol =
      currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";

    const format = (value: string) =>
      Number(value).toLocaleString("en-IN");

    const range =
      minSalary && maxSalary
        ? `${symbol}${format(minSalary)} – ${symbol}${format(maxSalary)}`
        : minSalary
          ? `From ${symbol}${format(minSalary)}`
          : `Up to ${symbol}${format(maxSalary)}`;

    const periodLabel =
      salaryPeriod === "year"
        ? "year"
        : salaryPeriod === "month"
          ? "month"
          : "hour";

    return `${range} per ${periodLabel}`;
  })();

  function addSkill() {
    const skill = skillInput.trim();

    if (skill && !skills.includes(skill)) {
      setSkills((previous) => [...previous, skill]);
    }

    setSkillInput("");
  }

  function toggleBenefit(benefit: string) {
    setSelectedBenefits((previous) =>
      previous.includes(benefit)
        ? previous.filter((item) => item !== benefit)
        : [...previous, benefit],
    );
  }

  const checklist = [
    { label: "Job title", complete: title.trim().length > 0 },
    { label: "Description", complete: description.trim().length > 0 },
    { label: "Company name", complete: company.trim().length > 0 },
    {
      label: "Location & Eligibility",
      complete: isRemote
        ? remoteEligibilityType === "WORLDWIDE" ||
          (remoteEligibilityType === "COUNTRIES" && eligibleCountries.length > 0) ||
          (remoteEligibilityType === "REGIONS" && eligibleRegion.trim().length > 0) ||
          (remoteEligibilityType === "CITIES" && eligibleCity.trim().length > 0)
        : Boolean(city.trim() && state.trim() && countryName.trim()),
    },
    { label: "Application details", complete: applicationComplete },
  ];

  function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // UI only: connect your publishing API here.
  }

  return (
    <div className="min-h-screen bg-surface-page text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="cursor-pointer text-text-muted transition-colors hover:text-brand"
          >
            Home
          </Link>
          <span className="text-border-strong">/</span>
          <span aria-current="page" className="font-medium text-text-primary">
            Post Job
          </span>
        </nav>

        {/* Page heading */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            For employers
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Post a job
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Share your opportunity with designers, developers and creative
            technologists across India.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main form */}
          <form onSubmit={handlePublish} className="min-w-0 space-y-5">
            {/* 1. Job details */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">Job details</h2>
              <p className="mt-1 text-sm text-text-muted">
                Introduce the role and its responsibilities.
              </p>

              <div className="mt-5 space-y-5">
                <Field label="Job title" htmlFor="job-title" required>
                  <input
                    id="job-title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Senior UI/UX Designer"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Job description"
                  htmlFor="job-description"
                  required
                  hint="Include responsibilities, qualifications and what the candidate will work on."
                >
                  <textarea
                    id="job-description"
                    required
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the role and what makes this opportunity worthwhile..."
                    rows={6}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Employment type" htmlFor="employment-type" required>
                    <div className="relative">
                      <select
                        id="employment-type"
                        required
                        value={employment}
                        onChange={(event) => setEmployment(event.target.value)}
                        className={`${inputClass} cursor-pointer appearance-none pr-9`}
                      >
                        {employmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </Field>

                  <Field label="Job category" htmlFor="job-category" required>
                    <div className="relative">
                      <select
                        id="job-category"
                        required
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className={`${inputClass} cursor-pointer appearance-none pr-9`}
                      >
                        <option value="">Select category</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Product Design">Product Design</option>
                        <option value="Frontend Development">
                          Frontend Development
                        </option>
                        <option value="Creative Technology">
                          Creative Technology
                        </option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Motion Design">Motion Design</option>
                      </select>
                      <SelectChevron />
                    </div>
                  </Field>
                </div>

                <Field
                  label="Skills"
                  htmlFor="skill-input"
                  hint="Optional. Add relevant skills one at a time."
                >
                  <div className="flex items-center gap-2">
                    <input
                      id="skill-input"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g. Figma, React, Prototyping"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="mt-1.5 shrink-0 cursor-pointer rounded-control border border-border-default bg-surface-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
                    >
                      Add
                    </button>
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            setSkills((previous) =>
                              previous.filter((item) => item !== skill),
                            )
                          }
                          aria-label={`Remove ${skill}`}
                          className="cursor-pointer rounded-control bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-surface-muted"
                        >
                          {skill} ×
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            </section>

            {/* 2. Hiring company */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">Hiring company</h2>
              <p className="mt-1 text-sm text-text-muted">
                Add the company name candidates will see.
              </p>

              <div className="mt-5">
                <Field label="Company name" htmlFor="company-name" required>
                  <input
                    id="company-name"
                    required
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="e.g. Studio North"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* 3. Location */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">Location</h2>
              <p className="mt-1 text-sm text-text-muted">
                Tell candidates where they will work.
              </p>

              <div className="mt-5 space-y-5">
                <Field label="Work arrangement" required>
                  <div className="grid grid-cols-3 gap-2">
                    {["Remote", "Hybrid", "On-site"].map((option) => {
                      const selected = arrangement === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setArrangement(option)}
                          className={`cursor-pointer rounded-control border px-3 py-2.5 text-sm font-medium transition-colors ${
                            selected
                              ? "border-brand-accent bg-brand-soft text-brand shadow-xs"
                              : "border-border-default text-text-secondary hover:bg-surface-subtle"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* 3A. Non-Remote (On-site & Hybrid) Location Fields */}
                {!isRemote && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Country" htmlFor="country" required>
                        <div className="relative">
                          <select
                            id="country"
                            required
                            value={countryCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              const found = COUNTRIES.find((c) => c.code === code);
                              setCountryCode(code);
                              setCountryName(found?.name || "India");
                              setState("");
                              setCity("");
                            }}
                            className={`${inputClass} cursor-pointer appearance-none pr-9`}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <SelectChevron />
                        </div>
                      </Field>

                      <Field label="State / Region" htmlFor="state" required>
                        {availableStates.length > 0 ? (
                          <div className="relative">
                            <select
                              id="state"
                              required
                              value={state}
                              onChange={(e) => {
                                setState(e.target.value);
                                setCity("");
                              }}
                              className={`${inputClass} cursor-pointer appearance-none pr-9`}
                            >
                              <option value="">Select state or region</option>
                              {availableStates.map((s) => (
                                <option key={s.code} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <SelectChevron />
                          </div>
                        ) : (
                          <input
                            id="state"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="e.g. State or Province"
                            className={inputClass}
                          />
                        )}
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" htmlFor="city" required>
                        {availableCities.length > 0 ? (
                          <div className="relative">
                            <input
                              id="city"
                              required
                              list="city-options"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Bengaluru"
                              className={inputClass}
                            />
                            <datalist id="city-options">
                              {availableCities.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name} {c.aliases.length > 0 ? `(${c.aliases.join(", ")})` : ""}
                                </option>
                              ))}
                            </datalist>
                          </div>
                        ) : (
                          <input
                            id="city"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Kochi"
                            className={inputClass}
                          />
                        )}
                      </Field>

                      <Field label="Locality / Area" htmlFor="locality" hint="Optional (e.g. Sector-58, Infopark)">
                        <input
                          id="locality"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          placeholder="e.g. Indiranagar, Infopark"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="PIN / Postal code" htmlFor="postal-code" hint="Optional">
                        <input
                          id="postal-code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="e.g. 560038"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* 3B. Remote Applicant Eligibility (Decoupled from physical office) */}
                {isRemote && (
                  <div className="space-y-4 rounded-control border border-border-subtle bg-surface-subtle p-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-brand">
                        Remote Applicant Eligibility
                      </label>
                      <p className="mt-1 text-xs text-text-muted">
                        Specify geographic boundaries where candidates are legally and operationally permitted to work.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { type: "WORLDWIDE" as RemoteEligibilityType, label: "Worldwide", hint: "Any country" },
                        { type: "COUNTRIES" as RemoteEligibilityType, label: "Countries", hint: "Selected nations" },
                        { type: "REGIONS" as RemoteEligibilityType, label: "State / Region", hint: "Specific state" },
                        { type: "CITIES" as RemoteEligibilityType, label: "City", hint: "Specific city" },
                      ].map((item) => {
                        const active = remoteEligibilityType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setRemoteEligibilityType(item.type)}
                            className={`cursor-pointer rounded-control border p-2.5 text-left transition-colors ${
                              active
                                ? "border-brand bg-surface-card text-brand shadow-xs"
                                : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong"
                            }`}
                          >
                            <p className="text-xs font-semibold">{item.label}</p>
                            <p className="text-[11px] text-text-muted">{item.hint}</p>
                          </button>
                        );
                      })}
                    </div>

                    {remoteEligibilityType === "COUNTRIES" && (
                      <div className="space-y-2 pt-1">
                        <label className={labelClass}>Permitted candidate countries</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["IN", "AE", "SG", "GB", "US"].map((cCode) => {
                            const isSelected = eligibleCountries.includes(cCode);
                            const cName = COUNTRIES.find((c) => c.code === cCode)?.name || cCode;
                            return (
                              <button
                                key={cCode}
                                type="button"
                                onClick={() => {
                                  setEligibleCountries((prev) =>
                                    isSelected
                                      ? prev.length > 1
                                        ? prev.filter((c) => c !== cCode)
                                        : prev
                                      : [...prev, cCode]
                                  );
                                }}
                                className={`cursor-pointer rounded-pill border px-2.5 py-1 text-xs font-medium transition-colors ${
                                  isSelected
                                    ? "border-brand bg-brand text-text-inverse"
                                    : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong"
                                }`}
                              >
                                {cName} {isSelected && "✓"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {remoteEligibilityType === "REGIONS" && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        <Field label="Country" required>
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Permitted State / Region" required>
                          <input
                            value={eligibleRegion}
                            onChange={(e) => setEligibleRegion(e.target.value)}
                            placeholder="e.g. Kerala"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}

                    {remoteEligibilityType === "CITIES" && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        <Field label="Permitted City" required>
                          <input
                            value={eligibleCity}
                            onChange={(e) => setEligibleCity(e.target.value)}
                            placeholder="e.g. Kochi"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}

                    {/* Optional HQ for remote roles */}
                    <div className="border-t border-border-subtle pt-3">
                      <Field
                        label="Office Headquarters (Optional)"
                        hint="Display the team's primary headquarters without restricting applicant location."
                      >
                        <input
                          value={hqLocation}
                          onChange={(e) => setHqLocation(e.target.value)}
                          placeholder="e.g. Bengaluru, India"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Pay and benefits */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">Pay and benefits</h2>
              <p className="mt-1 text-sm text-text-muted">
                Share compensation details and optional perks.
              </p>

              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Show salary on listing
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      Display the salary range in the public preview.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={showSalary}
                    aria-label="Show salary on listing"
                    onClick={() => setShowSalary((previous) => !previous)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      showSalary ? "bg-brand-accent" : "bg-border-strong"
                    }`}
                  >
                    <span
                      className={`absolute left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                        showSalary ? "translate-x-[20px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {showSalary && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Currency" htmlFor="currency">
                      <select
                        id="currency"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </Field>

                    <Field label="Salary period" htmlFor="salary-period">
                      <select
                        id="salary-period"
                        value={salaryPeriod}
                        onChange={(event) => setSalaryPeriod(event.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="year">Per year</option>
                        <option value="month">Per month</option>
                        <option value="hour">Per hour</option>
                      </select>
                    </Field>

                    <Field label="Minimum salary" htmlFor="min-salary">
                      <input
                        id="min-salary"
                        type="number"
                        min="0"
                        value={minSalary}
                        onChange={(event) => setMinSalary(event.target.value)}
                        placeholder="e.g. 600000"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Maximum salary" htmlFor="max-salary">
                      <input
                        id="max-salary"
                        type="number"
                        min="0"
                        value={maxSalary}
                        onChange={(event) => setMaxSalary(event.target.value)}
                        placeholder="e.g. 1200000"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                <div>
                  <p className={labelClass}>Benefits</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Optional — select all that apply.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {benefits.map((benefit) => {
                      const selected = selectedBenefits.includes(benefit);

                      return (
                        <button
                          key={benefit}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleBenefit(benefit)}
                          className={`cursor-pointer rounded-control border px-3 py-2 text-xs font-medium transition-colors ${
                            selected
                              ? "border-brand-accent bg-brand-soft text-brand shadow-xs"
                              : "border-border-default text-text-secondary hover:bg-surface-subtle"
                          }`}
                        >
                          {benefit}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. How to apply */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">How to apply</h2>
              <p className="mt-1 text-sm text-text-muted">
                Candidates will apply directly by sending an email.
              </p>

              <div className="mt-5">
                <Field
                  label="Application email"
                  htmlFor="application-email"
                  required
                  hint="Candidates will send their applications and resumes to this email address."
                >
                  <input
                    id="application-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="careers@company.com"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* 6. Listing dates */}
            <section className="rounded-panel border border-border-default bg-surface-card p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold text-text-primary">Listing dates</h2>
              <p className="mt-1 text-sm text-text-muted">
                Choose how long the listing stays active.
              </p>

              <div className="mt-5">
                <Field label="Keep this listing live for" htmlFor="expiry">
                  <select
                    id="expiry"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Form action */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="cursor-pointer rounded-control bg-brand px-5 py-3 text-sm font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Publish job
              </button>
            </div>
          </form>

          {/* Compact sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            {/* Live preview */}
            <section className="overflow-hidden rounded-panel border border-border-default bg-surface-card shadow-subtle">
              <div className="border-b border-border-subtle px-4 py-3">
                <h2 className="text-sm font-semibold text-text-primary">Live preview</h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  Preview of your listing
                </p>
              </div>

              <div className="p-4">
                <h3 className="break-words text-base font-semibold leading-snug text-text-primary">
                  {title.trim() || "Job title"}
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  {company.trim() || "Company name"}
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                  <FiMapPin className="shrink-0" />
                  <span>{location}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[employment, arrangement, category]
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-control bg-surface-muted px-2 py-1 text-xs text-text-secondary"
                      >
                        {item}
                      </span>
                    ))}
                </div>

                {salary && (
                  <p className="mt-3 text-sm font-semibold text-brand">
                    {salary}
                  </p>
                )}
              </div>
            </section>

            {/* Short checklist */}
            <section className="rounded-panel border border-border-default bg-surface-card p-4 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-text-primary">Required fields</h2>
                <span className="text-xs tabular-nums text-text-muted">
                  {checklist.filter((item) => item.complete).length}/
                  {checklist.length}
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {checklist.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 text-xs"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        item.complete ? "bg-brand-accent" : "bg-border-subtle"
                      }`}
                    />
                    <span
                      className={
                        item.complete ? "text-text-secondary" : "text-text-muted"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
