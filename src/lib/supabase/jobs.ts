// src/lib/supabase/jobs.ts
// Database access layer for Job entities using Supabase PostgreSQL.

import type { Job } from "@/app/types/job";
import { getServerSupabase, getServiceSupabase, isSupabaseConfigured } from "./server";
import type { DbJob, DbJobInsert, DbJobUpdate } from "./types";

/**
 * Maps a database row (snake_case) to the application Job type (camelCase).
 */
export function mapDbJobToJob(row: DbJob): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    experience: row.experience || "Fresher",
    postedDate: row.posted_date || new Date().toISOString(),
    salary: row.salary || "Not Disclosed",
    mail: row.mail || "",
    companyLink: row.company_link || "",
    apply: row.apply || "",
    description: row.description || "",
    views: typeof row.views === "number" ? row.views : 0,
    applicantCountry: row.applicant_country || "IN",
    validThrough: row.valid_through || undefined,
    employmentType: row.employment_type || "FULL_TIME",
    workMode: row.work_mode || "Onsite",
    isTestData: Boolean(row.is_test_data),
  };
}

/**
 * Normalize date strings (supports DD/MM/YYYY, YYYY-MM-DD, or ISO strings) to clean ISO format.
 */
export function normalizeToIso(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  const trimmed = dateStr.trim();
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const d = new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

/**
 * Maps application Job fields to database row format for inserts/updates.
 */
export function mapJobToDbInsert(job: Partial<Job>): DbJobInsert {
  const insert: DbJobInsert = {
    title: job.title || "",
    company: job.company || "",
    location: job.location || "",
    description: job.description || "",
  };

  if (job.id) insert.id = job.id;
  if (job.experience) insert.experience = job.experience;
  if (job.postedDate) insert.posted_date = normalizeToIso(job.postedDate);
  if (job.salary) insert.salary = job.salary;
  if (job.mail !== undefined) insert.mail = job.mail;
  if (job.companyLink !== undefined) insert.company_link = job.companyLink;
  if (job.apply !== undefined) insert.apply = job.apply;
  if (job.views !== undefined) insert.views = job.views;
  if (job.employmentType) insert.employment_type = job.employmentType;
  if (job.workMode) insert.work_mode = job.workMode;
  if (job.applicantCountry) insert.applicant_country = job.applicantCountry;
  if (job.validThrough) insert.valid_through = normalizeToIso(job.validThrough);
  if (job.isTestData !== undefined) insert.is_test_data = job.isTestData;

  return insert;
}

/**
 * Fetch all published jobs sorted by posted_date descending.
 * Supports optional pagination (page, limit) while safely retrieving all rows in chunks
 * to avoid any server-side PostgREST row limits.
 */
export async function getAllJobs(options?: { page?: number; limit?: number }): Promise<Job[]> {
  if (!isSupabaseConfigured()) {
    console.warn("getAllJobs: Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local.");
    return [];
  }

  try {
    const supabase = getServerSupabase();

    // If explicit pagination requested (e.g. ?page=1&limit=20)
    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error querying Supabase jobs:", error.message);
        return [];
      }

      return (data as DbJob[]).map(mapDbJobToJob);
    }

    // Otherwise retrieve all rows safely in chunks (guards against default PostgREST row limits)
    const CHUNK_SIZE = 500;
    let allRows: DbJob[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false })
        .range(from, from + CHUNK_SIZE - 1);

      if (error) {
        console.error("Error querying Supabase jobs:", error.message);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allRows = allRows.concat(data as DbJob[]);
        if (data.length < CHUNK_SIZE) {
          hasMore = false;
        } else {
          from += CHUNK_SIZE;
        }
      }
    }

    return allRows.map(mapDbJobToJob);
  } catch (error) {
    console.error("Failed to fetch jobs from Supabase:", error);
    return [];
  }
}

/**
 * Fetch a single job by its ID.
 */
export async function getJobById(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) {
    console.warn(`getJobById(${id}): Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local.`);
    return null;
  }

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbJobToJob(data as DbJob);
  } catch (error) {
    console.error(`Failed to fetch job with ID ${id}:`, error);
    return null;
  }
}

/**
 * Insert a new job record using privileged server credentials.
 */
export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const supabase = getServiceSupabase();
  const dbPayload = mapJobToDbInsert(jobData);

  // Newly published jobs receive today's date automatically on the server
  dbPayload.posted_date = new Date().toISOString();
  // Email-only applications
  dbPayload.apply = "";

  const { data, error } = await supabase
    .from("jobs")
    .insert(dbPayload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create job in Supabase: ${error.message}`);
  }

  return mapDbJobToJob(data as DbJob);
}

/**
 * Update an existing job record using privileged server credentials.
 */
export async function updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
  const supabase = getServiceSupabase();
  const dbPayload: DbJobUpdate = {};

  if (jobData.title !== undefined) dbPayload.title = jobData.title;
  if (jobData.company !== undefined) dbPayload.company = jobData.company;
  if (jobData.location !== undefined) dbPayload.location = jobData.location;
  if (jobData.experience !== undefined) dbPayload.experience = jobData.experience;
  if (jobData.postedDate !== undefined) dbPayload.posted_date = normalizeToIso(jobData.postedDate);
  if (jobData.salary !== undefined) dbPayload.salary = jobData.salary;
  if (jobData.mail !== undefined) dbPayload.mail = jobData.mail;
  if (jobData.companyLink !== undefined) dbPayload.company_link = jobData.companyLink;
  dbPayload.apply = "";
  if (jobData.description !== undefined) dbPayload.description = jobData.description;
  if (jobData.views !== undefined) dbPayload.views = jobData.views;
  if (jobData.employmentType !== undefined) dbPayload.employment_type = jobData.employmentType;
  if (jobData.workMode !== undefined) dbPayload.work_mode = jobData.workMode;
  if (jobData.validThrough !== undefined) dbPayload.valid_through = normalizeToIso(jobData.validThrough);
  if (jobData.isTestData !== undefined) dbPayload.is_test_data = jobData.isTestData;

  const { data, error } = await supabase
    .from("jobs")
    .update(dbPayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update job ${id} in Supabase: ${error.message}`);
  }

  return mapDbJobToJob(data as DbJob);
}

/**
 * Delete a job record by ID using privileged server credentials.
 */
export async function deleteJob(id: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete job ${id} in Supabase: ${error.message}`);
  }

  return true;
}

/**
 * Increment job view count.
 */
export async function incrementJobViews(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getServiceSupabase();
    // Fetch current views and increment
    const { data } = await supabase
      .from("jobs")
      .select("views")
      .eq("id", id)
      .single();

    const currentViews = data?.views ?? 0;
    await supabase
      .from("jobs")
      .update({ views: currentViews + 1 })
      .eq("id", id);
  } catch (error) {
    console.error(`Failed to increment views for job ${id}:`, error);
  }
}
