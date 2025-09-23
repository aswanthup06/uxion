"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FormState = {
  title: string;
  company: string;
  location: string;
  description: string;
  contactEmail: string;
  apply: string;
  salary?: string;
  website?: string;
  linkedin?: string;
  contactNumber?: string;
};

export default function PostJobPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const form = e.currentTarget;

    const body: FormState = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      description: (
        form.elements.namedItem("description") as HTMLTextAreaElement
      ).value,
      apply: (form.elements.namedItem("apply") as HTMLInputElement).value,
      contactEmail: (
        form.elements.namedItem("contactEmail") as HTMLInputElement
      ).value,
      salary:
        (form.elements.namedItem("salary") as HTMLInputElement).value || undefined,
      website:
        (form.elements.namedItem("website") as HTMLInputElement).value || undefined,
      linkedin:
        (form.elements.namedItem("linkedin") as HTMLInputElement).value || undefined,
      contactNumber:
        (form.elements.namedItem("contactNumber") as HTMLInputElement).value || undefined,
    };

    try {
      const res = await fetch("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("Job submitted successfully — We will reach you for more details");
        form.reset();
      } else {
        const data = await res.json();
        setMessage(data?.error || "Failed to submit job.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex gap-3 items-center">
        <Link
          href="/"
          className="text-white h-10 w-10 flex items-center justify-center border border-white/20 rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={14} />
        </Link>
        <h1 className="text-xl font-bold text-white">
          Post <span className="text-[#F97316]">Job</span>
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 max-w-2xl mx-auto bg-transparent"
      >
        {/* Required Fields */}
        <input
          name="title"
          placeholder="Job Title"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
          required
        />
        <input
          name="company"
          placeholder="Company Name"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
          required
        />
        <input
          name="location"
          placeholder="Location"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          rows={6}
          className="w-full px-4 py-3 rounded-2xl bgco text-sm text-white focus:ring-0 focus:outline-none resize-none placeholder:text-white/60"
          required
        />
        <input
          name="apply"
          placeholder="Apply Link or Apply Email"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
          required
        />
        <input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
          required
        />

        {/* Optional Fields */}
        <input
          name="salary"
          placeholder="Salary (optional)"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
        />
        <input
          type="url"
          name="website"
          placeholder="Company Website (optional)"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
        />
        <input
          type="url"
          name="linkedin"
          placeholder="LinkedIn Link (optional)"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
        />
        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number (optional)"
          className="w-full px-4 py-3 rounded-full bgco text-sm text-white focus:ring-0 focus:outline-none placeholder:text-white/60"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-medium py-3 px-4 rounded-full disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Job"
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
