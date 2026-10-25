// src/lib/supabase/types.ts
// Supabase database row definition and conversion types for Zenoway.

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
  applicant_country: string | null;
  valid_through: string | null;
  is_test_data: boolean;
  status: "published" | "draft" | "archived";
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
