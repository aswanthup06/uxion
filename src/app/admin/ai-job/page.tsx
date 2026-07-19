"use client";

import { useState } from "react";
import {
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Clock,
  Award,
  DollarSign,
  Tag,
  Link2,
  FileText,
  Wrench,
  ListChecks,
  CheckSquare,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";

const autoResize = (el: HTMLTextAreaElement) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

export default function AIJobPage() {
  const [rawJob, setRawJob] = useState("");
  const [loading, setLoading] = useState(false);

  const [job, setJob] = useState({
    title: "",
    company: "",
    website: "",
    location: "",
    employmentType: "",
    experience: "",
    salary: "",
    category: "",
    applyLink: "",
    description: "",
    skills: "",
    responsibilities: "",
    requirements: "",
  });

  const generateJob = async () => {
    setLoading(true);

    const res = await fetch("/api/ai-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job: rawJob,
      }),
    });

    const data = await res.json();

    if (data.success) {
      const json =
        typeof data.data === "string" ? JSON.parse(data.data) : data.data;

      setJob({
        title: json.title || "",
        company: json.company || "",
        website: json.website || "",
        location: json.location || "",
        employmentType: json.employmentType || "",
        experience: json.experience || "",
        salary: json.salary || "",
        category: json.category || "",
        applyLink: json.applyLink || "",
        description: json.description || "",
        skills: (json.skills || []).join(", "),
        responsibilities: (json.responsibilities || []).join("\n"),
        requirements: (json.requirements || []).join("\n"),
      });
    }

    setLoading(false);
  };

  const Field = ({ icon: Icon, label, children }: any) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4 text-gray-500" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Job Generator
              </h1>
              <p className="text-gray-500 mt-1">
                Generate structured job posts from raw descriptions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            AI Ready
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Paste Job Description
                </h2>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  {rawJob.length} characters
                </span>
              </div>

              <textarea
                className="w-full h-[500px] border-0 bg-gray-50 rounded-xl p-5 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none text-gray-700 placeholder:text-gray-400"
                placeholder="Paste the raw job description here... The AI will extract all relevant information and structure it for you."
                value={rawJob}
                onChange={(e) => setRawJob(e.target.value)}
              />

              <button
                onClick={generateJob}
                disabled={loading || !rawJob.trim()}
                className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Job Post
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Structured Job Data
                </h2>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Fill from AI
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <Field icon={Briefcase} label="Job Title">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="e.g. Senior Software Engineer"
                    value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={Building2} label="Company">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Company name"
                      value={job.company}
                      onChange={(e) =>
                        setJob({ ...job, company: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Globe} label="Website">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="https://..."
                      value={job.website}
                      onChange={(e) =>
                        setJob({ ...job, website: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field icon={MapPin} label="Location">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="City, Country or Remote"
                    value={job.location}
                    onChange={(e) =>
                      setJob({ ...job, location: e.target.value })
                    }
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={Clock} label="Employment Type">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Full-time, Part-time, etc."
                      value={job.employmentType}
                      onChange={(e) =>
                        setJob({ ...job, employmentType: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Award} label="Experience Level">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Senior, Junior, etc."
                      value={job.experience}
                      onChange={(e) =>
                        setJob({ ...job, experience: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={DollarSign} label="Salary">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="$80,000 - $100,000"
                      value={job.salary}
                      onChange={(e) =>
                        setJob({ ...job, salary: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Tag} label="Category">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Engineering, Design, etc."
                      value={job.category}
                      onChange={(e) =>
                        setJob({ ...job, category: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field icon={Link2} label="Application URL">
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="https://..."
                    value={job.applyLink}
                    onChange={(e) =>
                      setJob({ ...job, applyLink: e.target.value })
                    }
                  />
                </Field>

                <Field icon={FileText} label="Description">
                  <textarea
                    ref={(el) => {
                      if (el) autoResize(el);
                    }}
                    className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Job description..."
                    value={job.description}
                    onChange={(e) =>
                      setJob({ ...job, description: e.target.value })
                    }
                    rows={Math.max(4, job.description.split("\n").length)}
                  />
                </Field>

                <Field icon={Wrench} label="Skills">
                  <textarea
                    className="w-full border h-fit border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-y"
                    placeholder="React, TypeScript, AWS, ..."
                    value={job.skills}
                    onChange={(e) => setJob({ ...job, skills: e.target.value })}
                    rows={Math.max(3, job.skills.split(",").length)}
                  />
                </Field>

                <Field icon={ListChecks} label="Responsibilities">
                  <textarea
                   ref={(el) => {
                      if (el) autoResize(el);
                    }}
                    className="w-full border resize-none border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="• Build and maintain features&#10;• Write clean code"
                    value={job.responsibilities}
                    onChange={(e) =>
                      setJob({ ...job, responsibilities: e.target.value })
                    }
                    rows={Math.max(5, job.responsibilities.split("\n").length)}
                  />
                </Field>

                <Field icon={CheckSquare} label="Requirements">
                  <textarea
                    className="w-full border h-fit border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-y"
                    placeholder="• 5+ years experience&#10;• BS in Computer Science"
                    value={job.requirements}
                    onChange={(e) =>
                      setJob({ ...job, requirements: e.target.value })
                    }
                    rows={Math.max(5, job.requirements.split("\n").length)}
                  />
                </Field>

                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Job Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
