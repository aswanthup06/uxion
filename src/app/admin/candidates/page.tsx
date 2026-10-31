"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  MapPin,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { CandidateProfile } from "@/context/AuthContext";
import LoadingSpinner from "../comp/LoadingSpinner";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/candidates", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load candidate profiles");
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load candidates";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filteredCandidates = candidates.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.full_name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.headline?.toLowerCase().includes(query) ||
      c.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border-default pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                Admin Center
              </p>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Registered Candidates
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              View and review candidates who registered via Google OAuth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchCandidates(true)}
              disabled={refreshing}
              className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-default bg-surface-card px-3.5 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-brand" : ""} />
              Refresh
            </button>
            <Link
              href="/admin"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse transition hover:bg-brand-hover"
            >
              Dashboard <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-control border border-border-default bg-surface-card py-2 pl-9 pr-4 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
          </div>
          <p className="text-xs font-medium text-text-muted">
            Showing <span className="font-semibold text-text-primary">{filteredCandidates.length}</span> candidates
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-card border border-status-error/30 bg-status-error-bg/30 p-6 text-center text-status-error">
            <AlertCircle className="mx-auto mb-2 h-6 w-6" />
            <p className="font-semibold text-sm">{error}</p>
            <p className="mt-1 text-xs text-text-muted">
              Make sure the profiles table is created in Supabase.
            </p>
            <button
              onClick={() => fetchCandidates()}
              className="mt-4 rounded-control bg-brand px-4 py-2 text-xs font-semibold text-text-inverse"
            >
              Try Again
            </button>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-default bg-surface-card p-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Users size={22} />
            </div>
            <h3 className="text-base font-semibold text-text-primary">No candidates found</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-text-muted">
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different keyword.`
                : "No candidates have signed up yet. Once users log in with Google, they will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border-default bg-surface-card shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border-default bg-surface-subtle text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role / Headline</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Resume</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="transition hover:bg-surface-subtle/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {candidate.avatar_url ? (
                            <img
                              src={candidate.avatar_url}
                              alt={candidate.full_name || "Avatar"}
                              className="h-8 w-8 rounded-full object-cover border border-border-default"
                            />
                          ) : (
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                              {(candidate.full_name || candidate.email || "C").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-primary">
                              {candidate.full_name || "Unnamed Candidate"}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                              <CheckCircle2 size={10} className="text-brand" /> Google verified
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        <a
                          href={`mailto:${candidate.email}`}
                          className="hover:text-brand hover:underline inline-flex items-center gap-1"
                        >
                          <Mail size={12} className="text-text-muted" />
                          {candidate.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {candidate.headline || <span className="text-text-muted italic">Not specified</span>}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {candidate.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="text-text-muted" />
                            {candidate.location}
                          </span>
                        ) : (
                          <span className="text-text-muted italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {candidate.resume_url ? (
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand font-medium hover:underline"
                          >
                            <FileText size={13} /> View PDF
                          </a>
                        ) : (
                          <span className="text-text-muted text-[11px]">No resume</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/candidate-profile/view?id=${candidate.id}`}
                          className="inline-flex items-center gap-1 rounded-control border border-border-default bg-surface-base px-2.5 py-1.5 text-[11px] font-semibold text-text-primary transition hover:border-brand hover:bg-brand-soft hover:text-brand"
                        >
                          View Profile <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
