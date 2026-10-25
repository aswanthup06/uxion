
"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMapPin, FiChevronDown } from "react-icons/fi";


const inputClass =
  "mt-1.5 w-full rounded-md border border-[#E2E8E4] bg-white px-3 py-2.5 text-sm text-[#17251F] outline-none transition focus:border-[#0FA968] focus:ring-2 focus:ring-[#0FA968]/10";

const labelClass = "text-sm font-medium text-[#26372F]";

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
        <p className="mt-1.5 text-xs leading-5 text-[#7A8780]">{hint}</p>
      )}
    </div>
  );
}

function SelectChevron() {
  return (
    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718078]" />
  );
}

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [employment, setEmployment] = useState("Full-time");
  const [arrangement, setArrangement] = useState("Remote");

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

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

  const location = isRemote
    ? "Remote"
    : [city.trim(), state.trim(), country.trim()].filter(Boolean).join(", ") ||
      "Job location";

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
      label: "Location",
      complete:
        isRemote ||
        Boolean(city.trim() && state.trim() && country.trim()),
    },
    { label: "Application details", complete: applicationComplete },
  ];

  function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // UI only: connect your publishing API here.
  }

  return (
    <main className="min-h-screen bg-[#F8FAF8] text-[#17251F]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="cursor-pointer text-[#718078] transition-colors hover:text-[#087F50]"
          >
            Home
          </Link>
          <span className="text-[#B5BDB8]">/</span>
          <span aria-current="page" className="font-medium text-[#17251F]">
            Post Job
          </span>
        </nav>

        {/* Page heading */}
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#087F50]">
            For employers
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Post a job
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#718078]">
            Share your opportunity with designers, developers and creative
            technologists across India.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main form */}
          <form onSubmit={handlePublish} className="min-w-0 space-y-5">
            {/* 1. Job details */}
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Job details</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
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
                      className="mt-1.5 shrink-0 cursor-pointer rounded-md border border-[#DCE5DE] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F8F4]"
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
                          className="cursor-pointer rounded-md bg-[#EAF6EF] px-2.5 py-1.5 text-xs font-medium text-[#087F50] transition-colors hover:bg-[#DDF0E4]"
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
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Hiring company</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
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
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Location</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
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
                          className={`cursor-pointer rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                            selected
                              ? "border-[#0FA968] bg-[#EDF8F1] text-[#087F50]"
                              : "border-[#E2E8E3] text-[#53635A] hover:bg-[#F7FAF7]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {!isRemote && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City" htmlFor="city" required>
                      <input
                        id="city"
                        required={!isRemote}
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="e.g. Bengaluru"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="State" htmlFor="state" required>
                      <input
                        id="state"
                        required={!isRemote}
                        value={state}
                        onChange={(event) => setState(event.target.value)}
                        placeholder="e.g. Karnataka"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                <Field label="Country" htmlFor="country" required>
                  <input
                    id="country"
                    required
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="e.g. India"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* 4. Pay and benefits */}
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Pay and benefits</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
                Share compensation details and optional perks.
              </p>

              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#26372F]">
                      Show salary on listing
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#7A8780]">
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
                      showSalary ? "bg-[#0FA968]" : "bg-[#D7DED9]"
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
                  <p className="mt-1 text-xs text-[#7A8780]">
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
                          className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                            selected
                              ? "border-[#0FA968] bg-[#EDF8F1] text-[#087F50]"
                              : "border-[#E2E8E3] text-[#53635A] hover:bg-[#F7FAF7]"
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
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">How to apply</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
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
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Listing dates</h2>
              <p className="mt-1 text-sm text-[#7A8780]">
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
                className="cursor-pointer rounded-md bg-[#0FA968] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#087F50]"
              >
                Publish job
              </button>
            </div>
          </form>

          {/* Compact sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            {/* Live preview */}
            <section className="overflow-hidden rounded-lg border border-[#E6EBE7] bg-white">
              <div className="border-b border-[#E8EDE9] px-4 py-3">
                <h2 className="text-sm font-semibold">Live preview</h2>
                <p className="mt-0.5 text-xs text-[#7A8780]">
                  Preview of your listing
                </p>
              </div>

              <div className="p-4">
                <h3 className="break-words text-base font-semibold leading-snug text-[#17251F]">
                  {title.trim() || "Job title"}
                </h3>

                <p className="mt-1 text-sm text-[#53635A]">
                  {company.trim() || "Company name"}
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#718078]">
                  <FiMapPin className="shrink-0" />
                  <span>{location}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[employment, arrangement, category]
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-[#F2F6F3] px-2 py-1 text-xs text-[#53635A]"
                      >
                        {item}
                      </span>
                    ))}
                </div>

                {salary && (
                  <p className="mt-3 text-sm font-semibold text-[#087F50]">
                    {salary}
                  </p>
                )}
              </div>
            </section>

            {/* Short checklist */}
            <section className="rounded-lg border border-[#E6EBE7] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Required fields</h2>
                <span className="text-xs tabular-nums text-[#718078]">
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
                        item.complete ? "bg-[#0FA968]" : "bg-[#D5DDD7]"
                      }`}
                    />
                    <span
                      className={
                        item.complete ? "text-[#53635A]" : "text-[#7A8780]"
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
    </main>
  );
}
