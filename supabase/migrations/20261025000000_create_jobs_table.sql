-- Zenoway Supabase Migration: Fresh Jobs Table & RLS Setup
-- This creates the jobs schema, sequence, indexes, triggers, and Row Level Security policies.

-- 1. Create custom sequence for sequential human-readable job IDs (JOB1000, JOB1001, etc.)
CREATE SEQUENCE IF NOT EXISTS public.job_id_seq START WITH 1000;

-- 2. Create the jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY DEFAULT ('JOB' || nextval('public.job_id_seq')::TEXT),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  experience TEXT NOT NULL DEFAULT 'Fresher',
  posted_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  salary TEXT DEFAULT 'Not Disclosed',
  mail TEXT DEFAULT '',
  company_link TEXT DEFAULT '',
  apply TEXT DEFAULT '',
  description TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,

  -- Structured data & SEO fields (Google Jobs compatibility)
  employment_type TEXT DEFAULT 'FULL_TIME',
  work_mode TEXT DEFAULT 'Onsite', -- 'Remote', 'Hybrid', 'Onsite'
  applicant_country TEXT DEFAULT 'IN',
  valid_through TIMESTAMPTZ,
  is_test_data BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published', -- 'published', 'draft', 'archived'

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON public.jobs (posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs (location);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs (company);
CREATE INDEX IF NOT EXISTS idx_jobs_is_test_data ON public.jobs (is_test_data);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published jobs
DROP POLICY IF EXISTS "Public users can view published jobs" ON public.jobs;
CREATE POLICY "Public users can view published jobs"
ON public.jobs
FOR SELECT
USING (status = 'published');

-- Policy: Allow service-role (privileged server-side operations) full access
-- Note: In Supabase, the service_role key automatically bypasses RLS.
-- Anonymous/public roles cannot INSERT, UPDATE, or DELETE directly.
