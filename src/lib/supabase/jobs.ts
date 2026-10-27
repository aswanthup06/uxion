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

    // Global structured location fields
    primaryCity: row.primary_city || undefined,
    primaryState: row.primary_state || undefined,
    primaryStateCode: row.primary_state_code || undefined,
    primaryCountry: row.primary_country || undefined,
    primaryCountryCode: row.primary_country_code || undefined,
    locality: row.locality || undefined,
    postalCode: row.postal_code || undefined,
    isMultiLocation: Boolean(row.is_multi_location),
    remoteEligibilityType: (row.remote_eligibility_type as Job["remoteEligibilityType"]) || undefined,
    remoteEligibilityCountries: row.remote_eligibility_countries || undefined,
    remoteEligibilityRegions: row.remote_eligibility_regions || undefined,
    remoteEligibilityCities: row.remote_eligibility_cities || undefined,
    hqLocationId: row.hq_location_id || undefined,
    rawLocation: row.raw_location || undefined,
    workModeNotes: row.work_mode_notes || undefined,
    requiresReview: Boolean(row.requires_review),
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

  // Global structured location fields
  if (job.primaryCity !== undefined) insert.primary_city = job.primaryCity;
  if (job.primaryState !== undefined) insert.primary_state = job.primaryState;
  if (job.primaryStateCode !== undefined) insert.primary_state_code = job.primaryStateCode;
  if (job.primaryCountry !== undefined) insert.primary_country = job.primaryCountry;
  if (job.primaryCountryCode !== undefined) insert.primary_country_code = job.primaryCountryCode;
  if (job.locality !== undefined) insert.locality = job.locality;
  if (job.postalCode !== undefined) insert.postal_code = job.postalCode;
  if (job.isMultiLocation !== undefined) insert.is_multi_location = job.isMultiLocation;
  if (job.remoteEligibilityType !== undefined) insert.remote_eligibility_type = job.remoteEligibilityType;
  if (job.remoteEligibilityCountries !== undefined) insert.remote_eligibility_countries = job.remoteEligibilityCountries;
  if (job.remoteEligibilityRegions !== undefined) insert.remote_eligibility_regions = job.remoteEligibilityRegions;
  if (job.remoteEligibilityCities !== undefined) insert.remote_eligibility_cities = job.remoteEligibilityCities;
  if (job.hqLocationId !== undefined) insert.hq_location_id = job.hqLocationId;
  if (job.rawLocation !== undefined) insert.raw_location = job.rawLocation;
  if (job.workModeNotes !== undefined) insert.work_mode_notes = job.workModeNotes;
  if (job.requiresReview !== undefined) insert.requires_review = job.requiresReview;

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
 * Gracefully falls back to core columns if newer structured columns haven't been migrated yet in Supabase.
 */
export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const supabase = getServiceSupabase();
  const dbPayload = mapJobToDbInsert(jobData);

  // Newly published jobs receive today's date automatically on the server
  dbPayload.posted_date = new Date().toISOString();
  // Email-only applications
  dbPayload.apply = "";

  let { data, error } = await supabase
    .from("jobs")
    .insert(dbPayload)
    .select("*")
    .single();

  // If a column is missing from Supabase schema cache (migration not run yet), retry with core legacy columns
  if (error && (error.message.includes("schema cache") || error.message.includes("does not exist"))) {
    console.warn(`createJob: database schema cache warning (${error.message}). Retrying with core columns...`);

    const corePayload: Record<string, unknown> = {
      title: dbPayload.title,
      company: dbPayload.company,
      location: dbPayload.location,
      description: dbPayload.description,
      salary: dbPayload.salary || "Not Disclosed",
      mail: dbPayload.mail || "",
      company_link: dbPayload.company_link || "",
      apply: "",
      posted_date: dbPayload.posted_date,
      experience: dbPayload.experience || "Fresher",
      work_mode: dbPayload.work_mode,
      employment_type: dbPayload.employment_type,
    };
    if (dbPayload.id) corePayload.id = dbPayload.id;
    if (dbPayload.is_test_data !== undefined) corePayload.is_test_data = dbPayload.is_test_data;

    const retry = await supabase
      .from("jobs")
      .insert(corePayload)
      .select("*")
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Failed to create job in Supabase: ${error.message}`);
  }

  return mapDbJobToJob(data as DbJob);
}

/**
 * Update an existing job record using privileged server credentials.
 * Gracefully falls back to core columns if newer structured columns haven't been migrated yet in Supabase.
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

  // Structured location fields
  if (jobData.primaryCity !== undefined) dbPayload.primary_city = jobData.primaryCity;
  if (jobData.primaryState !== undefined) dbPayload.primary_state = jobData.primaryState;
  if (jobData.primaryStateCode !== undefined) dbPayload.primary_state_code = jobData.primaryStateCode;
  if (jobData.primaryCountry !== undefined) dbPayload.primary_country = jobData.primaryCountry;
  if (jobData.primaryCountryCode !== undefined) dbPayload.primary_country_code = jobData.primaryCountryCode;
  if (jobData.locality !== undefined) dbPayload.locality = jobData.locality;
  if (jobData.postalCode !== undefined) dbPayload.postal_code = jobData.postalCode;
  if (jobData.isMultiLocation !== undefined) dbPayload.is_multi_location = jobData.isMultiLocation;
  if (jobData.remoteEligibilityType !== undefined) dbPayload.remote_eligibility_type = jobData.remoteEligibilityType;
  if (jobData.remoteEligibilityCountries !== undefined) dbPayload.remote_eligibility_countries = jobData.remoteEligibilityCountries;
  if (jobData.remoteEligibilityRegions !== undefined) {
    dbPayload.remote_eligibility_regions = Array.isArray(jobData.remoteEligibilityRegions)
      ? jobData.remoteEligibilityRegions
      : [];
  }
  if (jobData.remoteEligibilityCities !== undefined) dbPayload.remote_eligibility_cities = jobData.remoteEligibilityCities;
  if (jobData.hqLocationId !== undefined) dbPayload.hq_location_id = jobData.hqLocationId;
  if (jobData.rawLocation !== undefined) dbPayload.raw_location = jobData.rawLocation;
  if (jobData.workModeNotes !== undefined) dbPayload.work_mode_notes = jobData.workModeNotes;
  if (jobData.requiresReview !== undefined) dbPayload.requires_review = jobData.requiresReview;

  let { data, error } = await supabase
    .from("jobs")
    .update(dbPayload)
    .eq("id", id)
    .select("*")
    .single();

  // If a column is missing from Supabase schema cache (migration not run yet), retry with core legacy columns
  if (error && (error.message.includes("schema cache") || error.message.includes("does not exist"))) {
    console.warn(`updateJob: database schema cache warning (${error.message}). Retrying with core columns...`);

    const coreUpdate: Record<string, unknown> = {};
    if (dbPayload.title !== undefined) coreUpdate.title = dbPayload.title;
    if (dbPayload.company !== undefined) coreUpdate.company = dbPayload.company;
    if (dbPayload.location !== undefined) coreUpdate.location = dbPayload.location;
    if (dbPayload.experience !== undefined) coreUpdate.experience = dbPayload.experience;
    if (dbPayload.posted_date !== undefined) coreUpdate.posted_date = dbPayload.posted_date;
    if (dbPayload.salary !== undefined) coreUpdate.salary = dbPayload.salary;
    if (dbPayload.mail !== undefined) coreUpdate.mail = dbPayload.mail;
    if (dbPayload.company_link !== undefined) coreUpdate.company_link = dbPayload.company_link;
    if (dbPayload.description !== undefined) coreUpdate.description = dbPayload.description;
    if (dbPayload.work_mode !== undefined) coreUpdate.work_mode = dbPayload.work_mode;
    if (dbPayload.employment_type !== undefined) coreUpdate.employment_type = dbPayload.employment_type;

    const retry = await supabase
      .from("jobs")
      .update(coreUpdate)
      .eq("id", id)
      .select("*")
      .single();

    data = retry.data;
    error = retry.error;
  }

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
