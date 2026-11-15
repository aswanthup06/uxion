-- 20261115000002_add_jobs_user_created_at_idx.sql
-- Composite index for fast counting of jobs per user within a rolling time window (daily limit & anti-spam)
CREATE INDEX IF NOT EXISTS idx_jobs_user_id_created_at ON public.jobs (user_id, created_at DESC);
