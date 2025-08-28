"use client";

import { useState } from "react";

type FormState = {
  title: string;
  company: string;
  location: string;
  description: string;
  contactEmail: string;
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
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      contactEmail: (form.elements.namedItem("contactEmail") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("Job submitted successfully — check your email.");
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Post a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="title"
          placeholder="Job Title"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          required
        />
        <input
          name="company"
          placeholder="Company Name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          required
        />
        <input
          name="location"
          placeholder="Location"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
          required
        />
        <input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Job"
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-lg text-center ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
}