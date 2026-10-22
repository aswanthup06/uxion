"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  MapPin,
  CalendarDays,
  Banknote,
  Mail,
  Globe,
  ExternalLink,
  Clock3,
  FileText,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

interface JobForm {
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-900/[0.05] disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass =
  "mb-2 block text-[13px] font-semibold text-slate-700";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder: string;
  icon: React.ElementType;
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
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="group relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700"
          strokeWidth={1.8}
        />

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
          className={`${inputClass} pl-10`}
        />
      </div>
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <Icon className="h-[19px] w-[19px] text-slate-700" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            {number}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AddJobPage() {
  const router = useRouter();

  // Use local calendar date instead of UTC to avoid date shifts.
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
    location: "",
    experienceMin: "",
    experienceMax: "",
    postedDate: getToday(),
    salary: "",
    mail: "",
    companyLink: "",
    apply: "",
    description: "",
  });

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

  const formatDateForStorage = (dateString: string) => {
    // Format the date without UTC/time-zone conversion.
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

      const payload = {
        ...form,
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        id: `JOB${Date.now()}`,
        postedDate: formatDateForStorage(form.postedDate),
        salary: form.salary.trim() || "Not Disclosed",
        mail: form.mail.trim(),
        companyLink: form.companyLink.trim(),
        apply: form.apply.trim(),
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
          // Use the fallback message if the response isn't JSON.
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
    <main className="min-h-full bg-[#f8fafc]">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => router.push("/admin/jobs")}
            className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </button>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Job management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Add a new job
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Create a job listing with the details candidates need to
                discover and apply for the opportunity.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-600">
                New listing
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1 */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              number="01"
              title="Job information"
              description="Start with the essential details of this position."
              icon={BriefcaseBusiness}
            />

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
              <div className="md:col-span-2">
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
                label="Job location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Remote, Bengaluru"
                icon={MapPin}
                required
              />

              <Field
                label="Posted date"
                name="postedDate"
                type="date"
                value={form.postedDate}
                onChange={handleChange}
                placeholder="Select posting date"
                icon={CalendarDays}
                required
              />

              <Field
                label="Salary range"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. ₹8–12 LPA or Not Disclosed"
                icon={Banknote}
              />
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              number="02"
              title="Experience requirements"
              description="Specify the experience level candidates should have."
              icon={Clock3}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Minimum experience (years)"
                name="experienceMin"
                type="number"
                value={form.experienceMin}
                onChange={handleChange}
                placeholder="e.g. 0"
                icon={Clock3}
                min="0"
                step="any"
                required
              />

              <Field
                label="Maximum experience (years)"
                name="experienceMax"
                type="number"
                value={form.experienceMax}
                onChange={handleChange}
                placeholder="e.g. 5 (optional)"
                icon={Clock3}
                min="0"
                step="any"
              />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                Enter <strong className="font-semibold text-slate-700">0</strong>{" "}
                for minimum experience to include entry-level candidates.
                Leave maximum experience empty if there is no upper limit.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              number="03"
              title="Application details"
              description="Help candidates learn more about your company and apply."
              icon={ExternalLink}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Contact email"
                name="mail"
                type="email"
                value={form.mail}
                onChange={handleChange}
                placeholder="careers@company.com"
                icon={Mail}
              />

              <Field
                label="Company website"
                name="companyLink"
                type="url"
                value={form.companyLink}
                onChange={handleChange}
                placeholder="https://company.com"
                icon={Globe}
              />

              <div className="md:col-span-2">
                <Field
                  label="Application URL"
                  name="apply"
                  type="url"
                  value={form.apply}
                  onChange={handleChange}
                  placeholder="https://company.com/careers/apply"
                  icon={ExternalLink}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Add the direct application page so candidates can apply easily.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              number="04"
              title="Job description"
              description="Describe the responsibilities, qualifications, and benefits."
              icon={FileText}
            />

            <label htmlFor="description" className={labelClass}>
              Description <span className="ml-1 text-rose-500">*</span>
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={8}
              placeholder={`About the role\n\nResponsibilities:\n• Describe the key responsibilities\n\nRequirements:\n• List the essential skills and qualifications\n\nBenefits:\n• Add relevant perks and benefits`}
              required
              className={`${inputClass} min-h-48 resize-y leading-6`}
            />

            <p className="mt-2 text-xs text-slate-400">
              Use clear paragraphs and bullet points to make your listing easy
              to read.
            </p>
          </section>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <p className="text-sm leading-5 text-rose-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs text-slate-400 sm:block">
                <span className="text-rose-500">*</span> Required fields
              </p>

              <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/admin/jobs")}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
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
    </main>
  );
}
