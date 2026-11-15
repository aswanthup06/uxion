-- 20261115000001_add_jobs_user_id.sql
-- Add user_id column to jobs table to record the creator/author of a job.
-- Existing posts and admin posts remain NULL, which indicates an official/admin-created job.

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for querying jobs created by a specific user (e.g., "My Posted Jobs" dashboard)
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs (user_id);
