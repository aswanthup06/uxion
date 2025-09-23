"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Format ISO date string -> YYYY-MM-DD
  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // ✅ Convert YYYY-MM-DD -> full ISO string
  const formatDateForStorage = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString();
    const date = new Date(dateStr + "T00:00:00Z");
    return date.toISOString();
  };

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((jobs) => {
        const job = jobs.find((j: any) => j.id === jobId);
        if (job) {
          // ✅ Parse experience string into min/max
          let experienceMin = "";
          let experienceMax = "";

          if (job.experience === "Fresher") {
            experienceMin = "0";
            experienceMax = "0";
          } else if (job.experience?.includes("-")) {
            const [min, max] = job.experience.split(" ")[0].split("-");
            experienceMin = min;
            experienceMax = max;
          } else if (job.experience?.includes("+")) {
            experienceMin = job.experience.split("+")[0];
            experienceMax = "";
          }

          setForm({
            ...job,
            experienceMin,
            experienceMax,
            postedDate: formatDateForInput(job.postedDate),
          });
        }
      });
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        postedDate: form.postedDate
          ? formatDateForStorage(form.postedDate)
          : new Date().toISOString(),
        experience: experienceValue, // ✅ final formatted string
      };

      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Job updated successfully!");
        setTimeout(() => router.push("/admin/jobs"), 1200);
      } else {
        toast.error("Failed to update job");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return <p className="p-6">Loading...</p>;

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["title", "company", "location", "postedDate", "salary", "mail", "companyLink", "apply"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {fieldLabels[key]}
              </label>
              {key === "postedDate" ? (
                <input
                  type="date"
                  name={key}
                  value={(form as any)[key] || ""}
                  onChange={handleChange}
                  placeholder={fieldPlaceholders[key]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              ) : (
                <input
                  type={key === "mail" ? "email" : key === "apply" ? "url" : "text"}
                  name={key}
                  value={(form as any)[key] || ""}
                  onChange={handleChange}
                  placeholder={fieldPlaceholders[key]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              value={form.experienceMin || ""}
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
              value={form.experienceMax || ""}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={6}
            placeholder={fieldPlaceholders.description}
            className="focus:outline-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <input type="hidden" name="id" value={form.id} />

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
            {isSubmitting ? "Updating..." : "Update Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
