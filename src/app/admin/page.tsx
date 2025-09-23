"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string; // could be dd/mm/yyyy OR ISO
};

// ✅ Parse either dd/mm/yyyy OR ISO → Date object
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date(0);

  // If ISO (contains T), let Date handle it
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  // If dd/mm/yyyy
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  return new Date(0);
};

// ✅ Format Date → "14 Sep 2025"
const formatDate = (dateStr: string) => {
  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        // ✅ Sort newest → oldest by parsed date
        const sorted = [...data].sort(
          (a, b) =>
            parseDate(b.postedDate).getTime() -
            parseDate(a.postedDate).getTime()
        );
        setJobs(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  const totalJobs = jobs.length;
  const lastPosted = jobs[0]; // newest after sorting

  return (
    <div className="p-6 h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold">Total Jobs</h2>
          <p className="text-3xl font-bold mt-2">{totalJobs}</p>
        </div>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold">Last Posted</h2>
          {lastPosted ? (
            <p className="mt-2">
              <span className="font-bold">{lastPosted.title}</span> at{" "}
              {lastPosted.company} <br />
              <span className="text-sm text-gray-500">
                {formatDate(lastPosted.postedDate)}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-gray-500">No jobs yet</p>
          )}
        </div>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-3 space-y-2">
            <Link
              href="/admin/jobs/add"
              className="block bg-blue-600 text-white text-center py-2 rounded"
            >
              + Add Job
            </Link>
            <Link
              href="/admin/jobs"
              className="block bg-gray-700 text-white text-center py-2 rounded"
            >
              View Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Recent jobs */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available</p>
        ) : (
          <ul className="space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <li
                key={job.id}
                className="border-b border-gray-300 last:border-none pb-2 flex justify-between"
              >
                <span>
                  {job.title}{" "}
                  <span className="text-gray-500">({job.company})</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {formatDate(job.postedDate)}
                  </span>
                </span>
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
