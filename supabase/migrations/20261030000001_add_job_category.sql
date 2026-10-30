-- 20261030000001_add_job_category.sql
-- Add category column to jobs table for standardized job filtering and search.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'UI/UX & Product Design';

-- Create index for high-performance category filtering
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

