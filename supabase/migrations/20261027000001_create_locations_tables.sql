-- Zenoway Supabase Migration: Create Canonical Locations and Multi-Location Junction Tables
-- Globally extensible architecture supporting countries, states/provinces, cities, and search aliases.

-- 1. Create canonical locations reference table
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY, -- Slug format: 'in-ka-bengaluru', 'us-ca-san-francisco', 'ae-du-dubai'
  country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2: 'IN', 'US', 'GB', 'AE', 'SG', etc.
  country TEXT NOT NULL,
  state_code TEXT, -- ISO 3166-2: 'KA', 'KL', 'CA', 'NY', etc.
  state TEXT NOT NULL,
  city TEXT, -- Nullable for state/province-wide entries (e.g. 'in-kl')
  aliases TEXT[] NOT NULL DEFAULT '{}', -- e.g. ARRAY['Bangalore'] for Bengaluru
  is_state_wide BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes for search and alias resolution
CREATE INDEX IF NOT EXISTS idx_locations_country_code ON public.locations (country_code);
CREATE INDEX IF NOT EXISTS idx_locations_state ON public.locations (state);
CREATE INDEX IF NOT EXISTS idx_locations_state_code ON public.locations (state_code);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations (city);
CREATE INDEX IF NOT EXISTS idx_locations_aliases ON public.locations USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON public.locations (is_active);

-- 2. Create multi-location junction table for positions available in multiple physical offices
CREATE TABLE IF NOT EXISTS public.job_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  city TEXT,
  state TEXT,
  country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
  locality TEXT,
  postal_code TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_locations_job_id ON public.job_locations (job_id);
CREATE INDEX IF NOT EXISTS idx_job_locations_location_id ON public.job_locations (location_id);
CREATE INDEX IF NOT EXISTS idx_job_locations_city ON public.job_locations (city);
CREATE INDEX IF NOT EXISTS idx_job_locations_state ON public.job_locations (state);

-- 3. Row Level Security Configuration
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active locations
DROP POLICY IF EXISTS "Public users can view active locations" ON public.locations;
CREATE POLICY "Public users can view active locations"
ON public.locations
FOR SELECT
USING (is_active = TRUE);

-- Policy: Allow public read access to job locations for published jobs
DROP POLICY IF EXISTS "Public users can view job locations" ON public.job_locations;
CREATE POLICY "Public users can view job locations"
ON public.job_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE public.jobs.id = public.job_locations.job_id
      AND public.jobs.status = 'published'
  )
);
