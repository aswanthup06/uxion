-- 20261112000001_add_job_email_copy_count.sql
-- Add email_copy_count column to jobs table to track Copy Email button clicks on job detail pages.

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS email_copy_count INTEGER NOT NULL DEFAULT 0;

