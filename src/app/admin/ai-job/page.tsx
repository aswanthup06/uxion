"use client";


import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Clock,
  Award,
  DollarSign,
  Tag,
  Mail,
  FileText,
  Wrench,
  ListChecks,
  CheckSquare,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";

type FieldProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
};

const Field = ({ icon: Icon, label, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
      <Icon className="w-4 h-4 text-text-muted" />
      {label}
    </label>
    {children}
  </div>
);

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
    email: "",
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
        email: json.email || json.mail || "",
        description: json.description || "",
        skills: (json.skills || []).join(", "),
        responsibilities: (json.responsibilities || []).join("\n"),
        requirements: (json.requirements || []).join("\n"),
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-page p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand rounded-panel shadow-card">
              <Sparkles className="w-8 h-8 text-text-inverse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-text-primary">
                AI Job Generator
              </h1>
              <p className="text-text-muted mt-1">
                Generate structured job posts from raw descriptions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
            AI Ready
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-4">
            <div className="bg-surface-card rounded-panel shadow-card border border-border-subtle p-6 hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand" />
                  Paste Job Description
                </h2>
                <span className="text-xs text-text-muted bg-surface-subtle px-3 py-1 rounded-full">
                  {rawJob.length} characters
                </span>
              </div>

              <textarea
                className="w-full h-[500px] border-0 bg-surface-subtle rounded-control p-5 focus:ring-2 focus:ring-brand-soft focus:bg-surface-base transition-all duration-200 resize-none text-text-primary placeholder:text-text-muted"
                placeholder="Paste the raw job description here... The AI will extract all relevant information and structure it for you."
                value={rawJob}
                onChange={(e) => setRawJob(e.target.value)}
              />

              <button
                onClick={generateJob}
                disabled={loading || !rawJob.trim()}
                className="w-full mt-5 bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3.5 rounded-control shadow-subtle hover:shadow-card-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="bg-surface-card rounded-panel shadow-card border border-border-subtle p-6 hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand" />
                  Structured Job Data
                </h2>
                <button className="text-xs text-brand hover:text-brand-hover font-medium">
                  Fill from AI
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <Field icon={Briefcase} label="Job Title">
                  <input
                    className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                    placeholder="e.g. Senior Software Engineer"
                    value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={Building2} label="Company">
                    <input
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                      placeholder="Company name"
                      value={job.company}
                      onChange={(e) =>
                        setJob({ ...job, company: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Globe} label="Website">
                    <input
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
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
                    className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
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
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                      placeholder="Full-time, Part-time, etc."
                      value={job.employmentType}
                      onChange={(e) =>
                        setJob({ ...job, employmentType: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Award} label="Experience Level">
                    <input
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
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
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                      placeholder="$80,000 - $100,000"
                      value={job.salary}
                      onChange={(e) =>
                        setJob({ ...job, salary: e.target.value })
                      }
                    />
                  </Field>
                  <Field icon={Tag} label="Category">
                    <input
                      className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                      placeholder="Engineering, Design, etc."
                      value={job.category}
                      onChange={(e) =>
                        setJob({ ...job, category: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field icon={Mail} label="Application Email">
                  <input
                    type="email"
                    className="w-full border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
                    placeholder="careers@company.com"
                    value={job.email}
                    onChange={(e) =>
                      setJob({ ...job, email: e.target.value })
                    }
                  />
                </Field>

                <Field icon={FileText} label="Description">
                  <textarea
                    ref={(el) => {
                      if (el) autoResize(el);
                    }}
                    className="w-full resize-none border border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
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
                    className="w-full border h-fit border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base resize-y outline-none"
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
                    className="w-full border resize-none border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base outline-none"
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
                    className="w-full border h-fit border-border-default rounded-control px-4 py-3 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-soft focus:border-brand transition-all duration-200 bg-surface-subtle hover:bg-surface-base resize-y outline-none"
                    placeholder="• 5+ years experience&#10;• BS in Computer Science"
                    value={job.requirements}
                    onChange={(e) =>
                      setJob({ ...job, requirements: e.target.value })
                    }
                    rows={Math.max(5, job.requirements.split("\n").length)}
                  />
                </Field>

                <button className="w-full cursor-pointer bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3.5 rounded-control shadow-subtle hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2">
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
