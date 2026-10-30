// src/lib/supabase/types.ts
// Supabase database row definition and conversion types for Zenoway.

export type RemoteEligibilityType =
  | "WORLDWIDE"
  | "COUNTRIES"
  | "REGIONS"
  | "CITIES"
  | "UNSPECIFIED";

export interface DbLocation {
  id: string;
  country_code: string;
  country: string;
  state_code: string | null;
  state: string;
  city: string | null;
  aliases: string[];
  is_state_wide: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DbJobLocation {
  id: string;
  job_id: string;
  location_id: string | null;
  city: string | null;
  state: string | null;
  country_code: string;
  locality: string | null;
  postal_code: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface DbJob {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  posted_date: string;
  salary: string | null;
  mail: string | null;
  company_link: string | null;
  apply: string | null;
  description: string;
  views: number;
  employment_type: string | null;
  work_mode: string | null;
  category: string | null;
  applicant_country: string | null;
  valid_through: string | null;
  is_test_data: boolean;
  status: "published" | "draft" | "archived";

  // Global structured location fields
  primary_city?: string | null;
  primary_state?: string | null;
  primary_state_code?: string | null;
  primary_country?: string | null;
  primary_country_code?: string | null;
  locality?: string | null;
  postal_code?: string | null;
  is_multi_location?: boolean;

  // Remote applicant eligibility (decoupled from office location)
  remote_eligibility_type?: RemoteEligibilityType | null;
  remote_eligibility_countries?: string[] | null;
  remote_eligibility_regions?: Array<{ countryCode: string; region: string; regionCode?: string }> | null;
  remote_eligibility_cities?: Array<{ countryCode: string; region: string; city: string }> | null;

  // Headquarters / Office reference
  hq_location_id?: string | null;

  // Audit and review flags
  raw_location?: string | null;
  work_mode_notes?: string | null;
  requires_review?: boolean;

  created_at: string;
  updated_at: string;
}

export type DbJobInsert = Partial<Omit<DbJob, "created_at" | "updated_at">> & {
  title: string;
  company: string;
  location: string;
  description: string;
};

export type DbJobUpdate = Partial<Omit<DbJob, "id" | "created_at" | "updated_at">>;
