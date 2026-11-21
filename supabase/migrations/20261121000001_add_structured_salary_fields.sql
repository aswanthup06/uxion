-- Migration: Add structured salary fields to jobs table & backfill existing data
-- Date: 2026-11-21

-- 1. Add structured salary columns to public.jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS salary_min NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS salary_max NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS salary_period TEXT NOT NULL DEFAULT 'YEAR',
  ADD COLUMN IF NOT EXISTS salary_is_disclosed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add performance indexes for efficient range and disclosed filtering
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min ON public.jobs (salary_min);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_max ON public.jobs (salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_disclosed ON public.jobs (salary_is_disclosed);

-- 3. Normalize all undisclosed, blank, or placeholder salaries
UPDATE public.jobs
SET 
  salary_is_disclosed = FALSE,
  salary = 'Not Disclosed',
  salary_min = NULL,
  salary_max = NULL,
  salary_currency = 'INR',
  salary_period = 'YEAR'
WHERE salary IS NULL 
   OR salary ILIKE '%not disclosed%' 
   OR salary ILIKE '%not specified%' 
   OR salary ILIKE '%undisclosed%' 
   OR salary ILIKE '%tbd%' 
   OR salary ILIKE '%n/a%' 
   OR salary = '-' 
   OR salary = '--'
   OR TRIM(salary) = '';

-- 4. Backfill LPA (Lakhs Per Annum) format (e.g. '₹22–32 LPA', '18-24 LPA', '12 LPA')
UPDATE public.jobs
SET 
  salary_is_disclosed = TRUE,
  salary_currency = 'INR',
  salary_period = 'YEAR',
  salary_min = (regexp_match(salary, '(\d+(?:\.\d+)?)\s*(?:[-–to]\s*(\d+(?:\.\d+)?))?\s*lpa', 'i'))[1]::NUMERIC * 100000,
  salary_max = COALESCE(
    (regexp_match(salary, '(\d+(?:\.\d+)?)\s*[-–to]\s*(\d+(?:\.\d+)?))?\s*lpa', 'i'))[2]::NUMERIC * 100000,
    (regexp_match(salary, '(\d+(?:\.\d+)?)\s*(?:[-–to]\s*(\d+(?:\.\d+)?))?\s*lpa', 'i'))[1]::NUMERIC * 100000
  )
WHERE salary_is_disclosed = FALSE 
  AND salary ~* 'lpa';

-- 5. Backfill Monthly format with 'k' shorthand (e.g. 'Up to ₹25k/month', '3k – 7k/M')
UPDATE public.jobs
SET 
  salary_is_disclosed = TRUE,
  salary_currency = 'INR',
  salary_period = 'MONTH',
  salary_min = COALESCE(
    (regexp_match(salary, '(\d+(?:\.\d+)?)\s*k\s*[-–to]\s*(\d+(?:\.\d+)?)\s*k', 'i'))[1]::NUMERIC * 1000,
    0
  ),
  salary_max = COALESCE(
    (regexp_match(salary, '(\d+(?:\.\d+)?)\s*k\s*[-–to]\s*(\d+(?:\.\d+)?)\s*k', 'i'))[2]::NUMERIC * 1000,
    (regexp_match(salary, '(\d+(?:\.\d+)?)\s*k', 'i'))[1]::NUMERIC * 1000
  )
WHERE salary_is_disclosed = FALSE 
  AND (salary ~* '/month' OR salary ~* '/m' OR salary ~* 'per month')
  AND salary ~* '\d+k';

-- 6. Backfill Monthly format with numbers (e.g. '₹35,000–50,000/month', '₹25,000/month')
UPDATE public.jobs
SET 
  salary_is_disclosed = TRUE,
  salary_currency = 'INR',
  salary_period = 'MONTH',
  salary_min = (regexp_replace(COALESCE((regexp_match(salary, '(\d{1,3}(?:,\d{3})+|\d{4,})\s*[-–to]\s*(\d{1,3}(?:,\d{3})+|\d{4,})', 'i'))[1], (regexp_match(salary, '(\d{1,3}(?:,\d{3})+|\d{4,})', 'i'))[1]), ',', '', 'g'))::NUMERIC,
  salary_max = (regexp_replace(COALESCE((regexp_match(salary, '(\d{1,3}(?:,\d{3})+|\d{4,})\s*[-–to]\s*(\d{1,3}(?:,\d{3})+|\d{4,})', 'i'))[2], (regexp_match(salary, '(\d{1,3}(?:,\d{3})+|\d{4,})', 'i'))[1]), ',', '', 'g'))::NUMERIC
WHERE salary_is_disclosed = FALSE 
  AND (salary ~* '/month' OR salary ~* '/m' OR salary ~* 'per month')
  AND salary ~ '\d{4,}';

-- 7. Catch-all for any other disclosed custom string: keep disclosed as TRUE
UPDATE public.jobs
SET salary_is_disclosed = TRUE
WHERE salary IS NOT NULL 
  AND salary != 'Not Disclosed'
  AND salary_is_disclosed = FALSE;
