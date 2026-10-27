-- Zenoway Supabase Migration: Safe, Idempotent Backfill for All 58 Existing Production Jobs
-- Strictly preserves original values in 'raw_location', standardizes casing and structure,
-- creates junction entries for multi-office listings, and flags ambiguous records for review.

DO $$
BEGIN
  -- 1. Archive original location strings to raw_location if not already populated
  UPDATE public.jobs
  SET raw_location = location
  WHERE raw_location IS NULL OR raw_location = '';

  -- 2. Normalize work_mode casing
  UPDATE public.jobs
  SET work_mode = 'Remote'
  WHERE LOWER(work_mode) = 'remote';

  UPDATE public.jobs
  SET work_mode = 'Onsite'
  WHERE LOWER(work_mode) = 'onsite';

  UPDATE public.jobs
  SET work_mode = 'Hybrid'
  WHERE LOWER(work_mode) = 'hybrid';

  -- =========================================================================
  -- 3. City-Only Records -> Add verified State and Country
  -- =========================================================================
  -- Chennai, Tamil Nadu
  UPDATE public.jobs
  SET primary_city = 'Chennai',
      primary_state = 'Tamil Nadu',
      primary_state_code = 'TN',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Chennai, Tamil Nadu'
  WHERE id IN ('JOB1008', 'JOB1019', 'JOB1020', 'JOB1057');

  -- Bengaluru, Karnataka
  UPDATE public.jobs
  SET primary_city = 'Bengaluru',
      primary_state = 'Karnataka',
      primary_state_code = 'KA',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Bengaluru, Karnataka'
  WHERE id IN ('JOB1004', 'JOB1028', 'JOB1029', 'JOB1034', 'JOB1041');

  -- Mumbai, Maharashtra
  UPDATE public.jobs
  SET primary_city = 'Mumbai',
      primary_state = 'Maharashtra',
      primary_state_code = 'MH',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Mumbai, Maharashtra'
  WHERE id IN ('JOB1010', 'JOB1027');

  -- Pune, Maharashtra
  UPDATE public.jobs
  SET primary_city = 'Pune',
      primary_state = 'Maharashtra',
      primary_state_code = 'MH',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Pune, Maharashtra'
  WHERE id = 'JOB1043';

  -- Hyderabad, Telangana
  UPDATE public.jobs
  SET primary_city = 'Hyderabad',
      primary_state = 'Telangana',
      primary_state_code = 'TS',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Hyderabad, Telangana'
  WHERE id IN ('JOB1013', 'JOB1018');

  -- Kochi, Kerala
  UPDATE public.jobs
  SET primary_city = 'Kochi',
      primary_state = 'Kerala',
      primary_state_code = 'KL',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Kochi, Kerala'
  WHERE id IN ('JOB1014', 'JOB1023', 'JOB1033');

  -- Noida, Uttar Pradesh
  UPDATE public.jobs
  SET primary_city = 'Noida',
      primary_state = 'Uttar Pradesh',
      primary_state_code = 'UP',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Noida, Uttar Pradesh'
  WHERE id IN ('JOB1015', 'JOB1025');

  -- Gurugram, Haryana (including legacy "Gurgaon")
  UPDATE public.jobs
  SET primary_city = 'Gurugram',
      primary_state = 'Haryana',
      primary_state_code = 'HR',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Gurugram, Haryana'
  WHERE id IN ('JOB1001', 'JOB1016', 'JOB1017');

  -- Delhi (NCT)
  UPDATE public.jobs
  SET primary_city = 'New Delhi',
      primary_state = 'Delhi',
      primary_state_code = 'DL',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'New Delhi, Delhi'
  WHERE id = 'JOB1022';

  -- Mohali, Punjab
  UPDATE public.jobs
  SET primary_city = 'Mohali',
      primary_state = 'Punjab',
      primary_state_code = 'PB',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Mohali, Punjab'
  WHERE id IN ('JOB1031', 'JOB1035');

  -- Indore, Madhya Pradesh
  UPDATE public.jobs
  SET primary_city = 'Indore',
      primary_state = 'Madhya Pradesh',
      primary_state_code = 'MP',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Indore, Madhya Pradesh'
  WHERE id IN ('JOB1038', 'JOB1045', 'JOB1046');

  -- Ahmedabad, Gujarat
  UPDATE public.jobs
  SET primary_city = 'Ahmedabad',
      primary_state = 'Gujarat',
      primary_state_code = 'GJ',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Ahmedabad, Gujarat'
  WHERE id = 'JOB1002';

  -- Surat, Gujarat
  UPDATE public.jobs
  SET primary_city = 'Surat',
      primary_state = 'Gujarat',
      primary_state_code = 'GJ',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Surat, Gujarat'
  WHERE id = 'JOB1006';

  -- Mysuru, Karnataka (legacy "Mysore")
  UPDATE public.jobs
  SET primary_city = 'Mysuru',
      primary_state = 'Karnataka',
      primary_state_code = 'KA',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Mysuru, Karnataka'
  WHERE id = 'JOB1030';

  -- =========================================================================
  -- 4. Locality Extraction Records
  -- =========================================================================
  -- Okhla, New Delhi
  UPDATE public.jobs
  SET locality = 'Okhla',
      primary_city = 'New Delhi',
      primary_state = 'Delhi',
      primary_state_code = 'DL',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Okhla, New Delhi'
  WHERE id = 'JOB1003';

  -- Sector-58, Noida
  UPDATE public.jobs
  SET locality = 'Sector-58',
      primary_city = 'Noida',
      primary_state = 'Uttar Pradesh',
      primary_state_code = 'UP',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Sector-58, Noida, Uttar Pradesh'
  WHERE id = 'JOB1032';

  -- Phase 8B, Mohali (Punjab)
  UPDATE public.jobs
  SET locality = 'Phase 8B',
      primary_city = 'Mohali',
      primary_state = 'Punjab',
      primary_state_code = 'PB',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Phase 8B, Mohali, Punjab'
  WHERE id = 'JOB1039';

  -- =========================================================================
  -- 5. State-Only Record: JOB1036 (Kerala) - Do NOT fabricate a city!
  -- =========================================================================
  UPDATE public.jobs
  SET primary_city = NULL,
      primary_state = 'Kerala',
      primary_state_code = 'KL',
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Kerala, India',
      requires_review = FALSE
  WHERE id = 'JOB1036';

  -- =========================================================================
  -- 6. Multi-Location Physical Records (Junction Table Population)
  -- =========================================================================
  -- JOB1044: KoinBX (Madurai / Bangalore)
  UPDATE public.jobs
  SET primary_city = 'Madurai',
      primary_state = 'Tamil Nadu',
      primary_state_code = 'TN',
      primary_country = 'India',
      primary_country_code = 'IN',
      is_multi_location = TRUE,
      requires_review = TRUE,
      work_mode_notes = 'Dual office posting: Madurai (Tamil Nadu) and Bengaluru (Karnataka). Review whether role is available at both or either.',
      location = 'Madurai / Bengaluru'
  WHERE id = 'JOB1044';

  DELETE FROM public.job_locations WHERE job_id = 'JOB1044';
  INSERT INTO public.job_locations (job_id, location_id, city, state, country_code, is_primary, display_order)
  VALUES
    ('JOB1044', 'in-tn-madurai', 'Madurai', 'Tamil Nadu', 'IN', TRUE, 1),
    ('JOB1044', 'in-ka-bengaluru', 'Bengaluru', 'Karnataka', 'IN', FALSE, 2);

  -- JOB1051: Techversant (Trivandrum / Cochin)
  UPDATE public.jobs
  SET primary_city = 'Thiruvananthapuram',
      primary_state = 'Kerala',
      primary_state_code = 'KL',
      primary_country = 'India',
      primary_country_code = 'IN',
      is_multi_location = TRUE,
      requires_review = TRUE,
      work_mode_notes = 'Dual office posting: Thiruvananthapuram and Kochi (Kerala). Review whether role is available at both or either.',
      location = 'Thiruvananthapuram / Kochi'
  WHERE id = 'JOB1051';

  DELETE FROM public.job_locations WHERE job_id = 'JOB1051';
  INSERT INTO public.job_locations (job_id, location_id, city, state, country_code, is_primary, display_order)
  VALUES
    ('JOB1051', 'in-kl-thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', 'IN', TRUE, 1),
    ('JOB1051', 'in-kl-kochi', 'Kochi', 'Kerala', 'IN', FALSE, 2);

  -- =========================================================================
  -- 7. Ambiguous Remote/Office Record: JOB1037 (Remote / Ludhiana)
  -- =========================================================================
  -- Preserve Remote work mode without guessing Hybrid; record Ludhiana office and flag for review
  UPDATE public.jobs
  SET work_mode = 'Remote',
      hq_location_id = 'in-pb-ludhiana',
      remote_eligibility_type = 'UNSPECIFIED',
      requires_review = TRUE,
      work_mode_notes = 'Listing specifies Remote / Ludhiana (Work from Office). Awaiting confirmation if Hybrid or Remote with Ludhiana requirement.',
      location = 'Remote (Ludhiana, Punjab)'
  WHERE id = 'JOB1037';

  -- =========================================================================
  -- 8. Remote Jobs (20 Total)
  -- =========================================================================
  -- JOB1009 explicitly states "Pan India" in title
  UPDATE public.jobs
  SET work_mode = 'Remote',
      remote_eligibility_type = 'COUNTRIES',
      remote_eligibility_countries = ARRAY['IN'],
      primary_country = 'India',
      primary_country_code = 'IN',
      location = 'Remote · India'
  WHERE id = 'JOB1009';

  -- Remaining 19 remote listings: Mark as UNSPECIFIED eligibility and flag for review
  UPDATE public.jobs
  SET work_mode = 'Remote',
      remote_eligibility_type = 'UNSPECIFIED',
      remote_eligibility_countries = '{}',
      requires_review = TRUE,
      work_mode_notes = 'Legacy remote listing: explicit geographic eligibility (Worldwide vs India vs Regional) not configured.',
      location = 'Remote'
  WHERE id IN (
    'JOB1000', 'JOB1005', 'JOB1007', 'JOB1011', 'JOB1012',
    'JOB1021', 'JOB1024', 'JOB1026', 'JOB1040', 'JOB1042',
    'JOB1047', 'JOB1048', 'JOB1049', 'JOB1050', 'JOB1052',
    'JOB1053', 'JOB1054', 'JOB1055', 'JOB1056'
  );

END $$;
