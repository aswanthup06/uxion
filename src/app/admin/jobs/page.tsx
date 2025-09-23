"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobTable from "../comp/JobTable";
import LoadingSpinner from "../comp/LoadingSpinner";
import { Job } from "../../types/job";
import toast, { Toaster } from "react-hot-toast";

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await res.json();
        setJobs(data); // already sorted by backend
      } catch (error) {
        console.error(error);
        toast.error("Failed to load jobs ❌");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(`Delete failed: ${errorData.message || "Unknown error"}`);
        return;
      }

      setJobs((prev) => prev.filter((job) => job.id !== id));
      toast.success("Job deleted successfully ✅");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting ❌");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
            <p className="text-gray-600 mt-2">Manage all job postings in one place</p>
          </div>
          <Link
            href="/admin/jobs/add"
            className="mt-4 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors shadow-md"
          >
            Add New Job
          </Link>
        </div>

        <JobTable jobs={jobs} onDelete={handleDelete} />
      </div>
    </div>
  );
}
