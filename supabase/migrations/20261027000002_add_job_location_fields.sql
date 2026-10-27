-- Zenoway Supabase Migration: Add Structured Location and Remote Eligibility Fields to Jobs Table
-- Strictly additive and non-destructive. Existing 'location' column is completely preserved.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS primary_city TEXT,
  ADD COLUMN IF NOT EXISTS primary_state TEXT,
  ADD COLUMN IF NOT EXISTS primary_state_code TEXT,
  ADD COLUMN IF NOT EXISTS primary_country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS primary_country_code VARCHAR(2) DEFAULT 'IN',
  ADD COLUMN IF NOT EXISTS locality TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS is_multi_location BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Remote applicant eligibility (decoupled from office location)
  ADD COLUMN IF NOT EXISTS remote_eligibility_type TEXT DEFAULT 'UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS remote_eligibility_countries TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS remote_eligibility_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS remote_eligibility_cities JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Office/Headquarters reference (distinct from remote eligibility)
  ADD COLUMN IF NOT EXISTS hq_location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  
  -- Audit and review flags
  ADD COLUMN IF NOT EXISTS raw_location TEXT,
  ADD COLUMN IF NOT EXISTS work_mode_notes TEXT,
  ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure constraint on remote_eligibility_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_jobs_remote_eligibility_type'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT chk_jobs_remote_eligibility_type
      CHECK (remote_eligibility_type IN ('WORLDWIDE', 'COUNTRIES', 'REGIONS', 'CITIES', 'UNSPECIFIED'));
  END IF;
END $$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_primary_city ON public.jobs (primary_city);
CREATE INDEX IF NOT EXISTS idx_jobs_primary_state ON public.jobs (primary_state);
CREATE INDEX IF NOT EXISTS idx_jobs_primary_country_code ON public.jobs (primary_country_code);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_eligibility_type ON public.jobs (remote_eligibility_type);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_eligibility_countries ON public.jobs USING GIN (remote_eligibility_countries);
CREATE INDEX IF NOT EXISTS idx_jobs_requires_review ON public.jobs (requires_review);
CREATE INDEX IF NOT EXISTS idx_jobs_is_multi_location ON public.jobs (is_multi_location);
