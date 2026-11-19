-- Migration: Create unlocked_job_emails table for ₹5 email unlock feature
-- Run this in your Supabase SQL Editor if you are not using Supabase CLI migrations.

CREATE TABLE IF NOT EXISTS public.unlocked_job_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 500, -- Amount in paise (500 paise = ₹5 INR)
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_job_paid UNIQUE (user_id, job_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_unlocked_user_job_status ON public.unlocked_job_emails(user_id, job_id, status);
CREATE INDEX IF NOT EXISTS idx_unlocked_user_id ON public.unlocked_job_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_job_id ON public.unlocked_job_emails(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.unlocked_job_emails ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own unlocked jobs
CREATE POLICY "Users can view their own unlocked jobs"
  ON public.unlocked_job_emails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Privileged inserts and updates occur server-side with SUPABASE_SERVICE_ROLE_KEY
