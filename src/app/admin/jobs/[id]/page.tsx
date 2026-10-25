
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
  Clock3,
  FileText,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  Save,
  X,
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
  description: string;
}

interface JobFromAPI {
  id: string | number;
  title?: string;
  company?: string;
  location?: string;
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

        setForm({
          id: String(job.id),
          title: job.title ?? "",
          company: job.company ?? "",
          location: job.location ?? "",
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

  const handleChange = (name: keyof JobForm, value: string) => {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form || isSubmitting) return;

    if (!form.title.trim() || !form.company.trim() || !form.location.trim()) {
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
      <main className="min-h-full bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-3 w-28 rounded-pill bg-[#E9EEE9]" />
          <div className="mt-5 h-8 w-56 rounded-pill bg-[#E9EEE9]" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-pill bg-[#F0F3F0]" />

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="mt-8 border-b border-[#E7ECE8] py-8"
            >
              <div className="h-4 w-40 rounded-pill bg-[#E9EEE9]" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="h-11 rounded-control bg-[#F0F3F0]" />
                <div className="h-11 rounded-control bg-[#F0F3F0]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (loadError || !form) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-5 py-12">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-control bg-red-50 text-red-600">
            <AlertCircle size={21} />
          </span>

          <h1 className="mt-4 text-lg font-semibold text-[#172820]">
            Unable to open this job
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7B867E]">
            {loadError || "The requested job is unavailable."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
                void loadJob(controller.signal);
              }}
              className="rounded-control border border-[#DDE5DE] px-4 py-2.5 text-sm font-medium text-[#34463A] transition hover:bg-[#F7F9F7]"
            >
              Try again
            </button>

            <Link
              href="/admin/jobs"
              className="rounded-control bg-[#087F50] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#066640]"
            >
              Back to jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-white text-[#172820]">
      <div className="mx-auto max-w-5xl px-5 pb-32 pt-6 sm:px-8 sm:pt-9">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#849087]">
          <Link href="/admin" className="transition hover:text-[#087F50]">
            Dashboard
          </Link>
          <ChevronRight size={13} />
          <Link
            href="/admin/jobs"
            className="transition hover:text-[#087F50]"
          >
            Manage jobs
          </Link>
          <ChevronRight size={13} />
          <span className="font-medium text-[#35463A]">Edit listing</span>
        </nav>

        <header className="flex flex-col gap-5 border-b border-[#E7ECE8] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#087F50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0FA968]" />
              Job management
            </p>

            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#172820] sm:text-[32px]">
              Edit job listing
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#7B867E]">
              Make changes to the listing and save when everything looks right.
            </p>
          </div>

          <Link
            href="/admin/jobs"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-control border border-[#E1E8E2] px-3.5 text-sm font-medium text-[#45554A] transition hover:border-[#C8D7CC] hover:bg-[#F8FAF8] sm:self-auto"
          >
            <ArrowLeft size={15} />
            Back to jobs
          </Link>
        </header>

        <div className="flex items-start gap-3 border-b border-[#E7ECE8] py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-[#EFF7F0] text-[#087F50]">
            <BriefcaseBusiness size={19} strokeWidth={1.7} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold text-[#172820]">
              {form.title || "Untitled job"}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#849087]">
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

          <span className="hidden items-center gap-1.5 pt-1 text-xs font-medium text-[#087F50] sm:inline-flex">
            <Check size={14} />
            Editing
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <Section
            icon={BriefcaseBusiness}
            title="Basic information"
            description="The main details candidates will see in the listing."
          >
            <Field
              label="Job title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior UI/UX Designer"
              icon={BriefcaseBusiness}
              required
            />

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
              placeholder="e.g. Remote, Kochi, India"
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
              placeholder="e.g. ₹8–12 LPA"
              icon={Banknote}
              hint="Optional. Use the salary format suitable for the role."
            />
          </Section>

          <Section
            icon={Clock3}
            title="Experience requirements"
            description="Set the expected experience range in years."
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
              hint="Use 0 for fresher or entry-level roles."
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
              hint="Leave blank if there is no upper limit."
            />
          </Section>

          <Section
            icon={Globe}
            title="Application and contact"
            description="Give applicants a reliable way to contact the employer."
          >
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

            <Field
              label="Company website"
              name="companyLink"
              value={form.companyLink}
              onChange={handleChange}
              type="url"
              placeholder="https://company.com"
              icon={Globe}
              hint="Optional. Include https:// or http://."
            />
          </Section>

          <Section
            icon={FileText}
            title="Job description"
            description="Explain the responsibilities, requirements and expectations."
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
                placeholder="Describe the role, responsibilities, requirements, benefits and how to apply..."
                required
                className={`${inputClass} min-h-48 resize-y leading-7`}
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#849087]">
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
