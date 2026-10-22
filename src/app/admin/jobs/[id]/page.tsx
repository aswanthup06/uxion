
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Globe,
  LoaderCircle,
  MapPin,
  Save,
  X,
  AlertCircle,
  Mail,
  Banknote,
  Clock3,
  ExternalLink,
} from "lucide-react";

interface JobForm {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceMin: string;
  experienceMax: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  apply: string;
  description: string;
}

interface JobFromAPI {
  id: string;
  title: string;
  company: string;
  location: string;
  experience?: string;
  experienceMin?: string | number;
  experienceMax?: string | number;
  postedDate: string;
  salary?: string;
  mail?: string;
  companyLink?: string;
  apply?: string;
  description?: string;
}

function dateForInput(value?: string): string {
  if (!value) return "";

  // Keep date-only ISO strings unchanged to avoid timezone shifts.
  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateOnly) return dateOnly[1];

  // Support dd/mm/yyyy values.
  const dmy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3];
    const candidate = `${year}-${month}-${day}`;
    const date = new Date(`${candidate}T00:00:00Z`);

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
  if (
    job.experienceMin !== undefined &&
    job.experienceMin !== null
  ) {
    return {
      experienceMin: String(job.experienceMin),
      experienceMax:
        job.experienceMax === undefined || job.experienceMax === null
          ? ""
          : String(job.experienceMax),
    };
  }

  const value = (job.experience ?? "").trim();

  if (!value || /^fresher$/i.test(value)) {
    return { experienceMin: "0", experienceMax: "0" };
  }

  const range = value.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);

  if (range) {
    return {
      experienceMin: range[1],
      experienceMax: range[2],
    };
  }

  const minimum = value.match(/(\d+(?:\.\d+)?)\s*\+/);

  if (minimum) {
    return {
      experienceMin: minimum[1],
      experienceMax: "",
    };
  }

  const single = value.match(/(\d+(?:\.\d+)?)/);

  if (single) {
    return {
      experienceMin: single[1],
      experienceMax: "",
    };
  }

  return { experienceMin: "", experienceMax: "" };
}

function makeExperienceValue(min: string, max: string) {
  const minimum = min.trim();
  const maximum = max.trim();

  if (minimum === "0" && (!maximum || maximum === "0")) {
    return "Fresher";
  }

  if (minimum && maximum) {
    return `${minimum}-${maximum} years`;
  }

  if (minimum) {
    return `${minimum}+ years`;
  }

  return "";
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

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
  icon?: React.ElementType;
  min?: string;
  step?: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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

      {hint && <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7">
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

  const loadJob = useCallback(async (signal: AbortSignal) => {
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
        setLoadError("This job could not be found. It may have been deleted.");
        return;
      }

      const experience = parseExperience(job);

      setForm({
        id: job.id,
        title: job.title ?? "",
        company: job.company ?? "",
        location: job.location ?? "",
        experienceMin: experience.experienceMin,
        experienceMax: experience.experienceMax,
        postedDate: dateForInput(job.postedDate),
        salary: job.salary ?? "",
        mail: job.mail ?? "",
        companyLink: job.companyLink ?? "",
        apply: job.apply ?? "",
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
  }, [jobId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadJob(controller.signal);

    return () => controller.abort();
  }, [loadJob]);

  const handleChange = (name: keyof JobForm, value: string) => {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form || isSubmitting) return;

    const minimum = Number(form.experienceMin);
    const maximum = form.experienceMax
      ? Number(form.experienceMax)
      : null;

    if (
      form.experienceMin.trim() === "" ||
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      toast.error("Enter a valid minimum experience.");
      return;
    }

    if (
      form.experienceMax.trim() !== "" &&
      (!Number.isFinite(maximum) || maximum! < 0)
    ) {
      toast.error("Enter a valid maximum experience.");
      return;
    }

    if (maximum !== null && maximum < minimum) {
      toast.error("Maximum experience must be greater than or equal to minimum.");
      return;
    }

    if (!dateForInput(form.postedDate)) {
      toast.error("Please select a valid posting date.");
      return;
    }

    for (const [label, value] of [
      ["Company website", form.companyLink],
      ["Application link", form.apply],
    ]) {
      if (value.trim()) {
        try {
          const url = new URL(value);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error("Invalid protocol");
          }
        } catch {
          toast.error(`${label} must be a valid HTTP or HTTPS URL.`);
          return;
        }
      }
    }

    if (form.mail.trim()) {
      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail);
      if (!emailLooksValid) {
        toast.error("Enter a valid contact email.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: form.id,
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
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
        apply: form.apply.trim(),
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
      <div className="h-full overflow-y-auto bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-200" />
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle size={23} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Unable to open this job
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {loadError || "The requested job is unavailable."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                void loadJob(controller.signal);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Try again
            </button>

            <Link
              href="/admin/jobs"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6 p-4 pb-10 sm:p-6 lg:p-8">
        {/* Page header */}
        <header>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/admin" className="transition hover:text-slate-900">
              Dashboard
            </Link>
            <ChevronRight size={14} />
            <Link
              href="/admin/jobs"
              className="transition hover:text-slate-900"
            >
              Jobs
            </Link>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-800">Edit listing</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Job management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Edit job listing
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Update the job details below. Review your changes before
                saving them.
              </p>
            </div>

            <Link
              href="/admin/jobs"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <ArrowLeft size={16} />
              Back to jobs
            </Link>
          </div>
        </header>

        {/* Job summary */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <BriefcaseBusiness size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words font-semibold text-slate-950">
              {form.title || "Untitled job"}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} />
                {form.company || "Company not set"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {form.location || "Location not set"}
              </span>
            </p>
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">
            <Check size={13} />
            Editing
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            icon={BriefcaseBusiness}
            title="Basic information"
            description="The main details job seekers will see in your listing."
          >
            <div>
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
              label="Job location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Remote, Bengaluru, India"
              icon={MapPin}
              required
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

            <Field
              label="Salary range"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. ₹8–12 LPA or Not disclosed"
              icon={Banknote}
              hint="Optional. Use the format appropriate for the role."
            />
          </Section>

          <Section
            icon={Clock3}
            title="Experience requirements"
            description="Specify the experience range required for this role."
          >
            <Field
              label="Minimum experience (years)"
              name="experienceMin"
              value={form.experienceMin}
              onChange={handleChange}
              placeholder="e.g. 0"
              type="number"
              min="0"
              step="0.5"
              required
              icon={Clock3}
              hint="Use 0 for entry-level or fresher positions."
            />

            <Field
              label="Maximum experience (years)"
              name="experienceMax"
              value={form.experienceMax}
              onChange={handleChange}
              placeholder="e.g. 5"
              type="number"
              min="0"
              step="0.5"
              icon={Clock3}
              hint="Leave blank for an open-ended experience requirement."
            />
          </Section>

          <Section
            icon={Globe}
            title="Application and contact details"
            description="Provide links and contact information for interested applicants."
          >
            <Field
              label="Contact email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              type="email"
              placeholder="careers@company.com"
              icon={Mail}
              hint="Optional. Use a monitored recruitment email."
            />

            <Field
              label="Company website"
              name="companyLink"
              value={form.companyLink}
              onChange={handleChange}
              type="url"
              placeholder="https://company.com"
              icon={Globe}
              hint="Optional. Include the full URL."
            />

            <div className="sm:col-span-2">
              <Field
                label="Application URL"
                name="apply"
                value={form.apply}
                onChange={handleChange}
                type="url"
                placeholder="https://company.com/careers/apply"
                icon={ExternalLink}
                hint="Optional. Direct applicants to the correct application page."
              />
            </div>
          </Section>

          <Section
            icon={FileText}
            title="Job description"
            description="Describe responsibilities, qualifications, and what candidates can expect."
          >
            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={9}
                placeholder={
                  "Describe the role, responsibilities, requirements, benefits, and how to apply..."
                }
                required
                className={`${inputClass} min-h-48 resize-y leading-7`}
              />

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>Keep the description clear and easy to scan.</span>
                <span className="shrink-0 tabular-nums">
                  {form.description.length} characters
                </span>
              </div>
            </div>
          </Section>

          {/* Form actions */}
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-slate-500 sm:block">
                Fields marked <span className="text-red-500">*</span> are
                required.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/admin/jobs")}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save changes
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
