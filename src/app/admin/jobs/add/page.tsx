"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddJobPage() {
  const router = useRouter();

  // ✅ Default today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    experienceMin: "",
    experienceMax: "",
    postedDate: today, // ✅ Default to today
    salary: "",
    mail: "",
    companyLink: "",
    apply: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Store date in dd/mm/yyyy format
  const formatDateForStorage = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toLocaleDateString("en-GB");
      return date.toLocaleDateString("en-GB");
    } catch {
      return new Date().toLocaleDateString("en-GB");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ Format experience properly
      let experienceValue = "";
      if (form.experienceMin === "0" && (!form.experienceMax || form.experienceMax === "0")) {
        experienceValue = "Fresher";
      } else if (form.experienceMin && form.experienceMax) {
        experienceValue = `${form.experienceMin}-${form.experienceMax} years`;
      } else if (form.experienceMin) {
        experienceValue = `${form.experienceMin}+ years`;
      }

      const payload = {
        ...form,
        id: `JOB${Date.now()}`,
        postedDate: form.postedDate
          ? formatDateForStorage(form.postedDate)
          : new Date().toLocaleDateString("en-GB"),
        salary: form.salary.trim() || "Not Disclosed",
        mail: form.mail.trim() || "",
        companyLink: form.companyLink.trim() || "",
        apply: form.apply.trim() || "",
        experience: experienceValue, // ✅ final formatted string
      };

      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error adding job:", error);
      setIsSubmitting(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    title: "Job Title",
    company: "Company Name",
    location: "Location",
    postedDate: "Posted Date",
    salary: "Salary Range (Optional)",
    mail: "Contact Email (Optional)",
    companyLink: "Company Website (Optional)",
    apply: "Apply Link (Optional)",
    description: "Job Description",
  };

  const fieldPlaceholders: Record<string, string> = {
    title: "e.g. Senior UX Designer",
    company: "e.g. TechCorp Inc.",
    location: "e.g. Remote, San Francisco, CA",
    postedDate: "Select posting date",
    salary: "e.g. $80,000 - $120,000",
    mail: "e.g. careers@company.com",
    companyLink: "e.g. https://company.com",
    apply: "e.g. https://company.com/careers/apply",
    description:
      "Describe the job responsibilities, requirements, and benefits...",
  };

  return (
    <div className="h-full bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 overflow-scroll">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Regular fields */}
          {["title", "company", "location", "postedDate", "salary", "mail", "companyLink"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {fieldLabels[key]}
              </label>
              {key === "postedDate" ? (
                <input
                  type="date"
                  name={key}
                  value={(form as any)[key]}
                  onChange={handleChange}
                  placeholder={fieldPlaceholders[key]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              ) : (
                <input
                  type={key === "mail" ? "email" : "text"}
                  name={key}
                  value={(form as any)[key]}
                  onChange={handleChange}
                  placeholder={fieldPlaceholders[key]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required={["title", "company", "location", "postedDate"].includes(key)}
                />
              )}
            </div>
          ))}

          {/* Experience Min / Max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Experience
            </label>
            <input
              type="number"
              min="0"
              name="experienceMin"
              value={form.experienceMin}
              onChange={handleChange}
              placeholder="e.g. 0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Experience (Optional)
            </label>
            <input
              type="number"
              min="0"
              name="experienceMax"
              value={form.experienceMax}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Apply Link - optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {fieldLabels.apply}
          </label>
          <input
            type="url"
            name="apply"
            value={form.apply}
            onChange={handleChange}
            placeholder={fieldPlaceholders.apply}
            className="focus:outline-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Description - required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder={fieldPlaceholders.description}
            className="focus:outline-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/admin/jobs")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? "Saving..." : "Save Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
