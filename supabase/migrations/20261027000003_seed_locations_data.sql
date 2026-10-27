-- Zenoway Supabase Migration: Seed Canonical Locations Reference Dataset
-- Preconfigures all 36 Indian States/UTs, major Indian tech hubs, and international tech hubs with search aliases.

INSERT INTO public.locations (id, country_code, country, state_code, state, city, aliases, is_state_wide, is_active)
VALUES
  -- =========================================================================
  -- 1. All 28 Indian States & 8 Union Territories (State-wide entries)
  -- =========================================================================
  ('in-an', 'IN', 'India', 'AN', 'Andaman and Nicobar Islands', NULL, ARRAY['Andaman'], TRUE, TRUE),
  ('in-ap', 'IN', 'India', 'AP', 'Andhra Pradesh', NULL, '{}', TRUE, TRUE),
  ('in-ar', 'IN', 'India', 'AR', 'Arunachal Pradesh', NULL, '{}', TRUE, TRUE),
  ('in-as', 'IN', 'India', 'AS', 'Assam', NULL, '{}', TRUE, TRUE),
  ('in-br', 'IN', 'India', 'BR', 'Bihar', NULL, '{}', TRUE, TRUE),
  ('in-ch', 'IN', 'India', 'CH', 'Chandigarh', NULL, '{}', TRUE, TRUE),
  ('in-ct', 'IN', 'India', 'CT', 'Chhattisgarh', NULL, '{}', TRUE, TRUE),
  ('in-dh', 'IN', 'India', 'DH', 'Dadra and Nagar Haveli and Daman and Diu', NULL, '{}', TRUE, TRUE),
  ('in-dl', 'IN', 'India', 'DL', 'Delhi', NULL, ARRAY['NCT of Delhi', 'National Capital Territory of Delhi'], TRUE, TRUE),
  ('in-ga', 'IN', 'India', 'GA', 'Goa', NULL, '{}', TRUE, TRUE),
  ('in-gj', 'IN', 'India', 'GJ', 'Gujarat', NULL, '{}', TRUE, TRUE),
  ('in-hr', 'IN', 'India', 'HR', 'Haryana', NULL, '{}', TRUE, TRUE),
  ('in-hp', 'IN', 'India', 'HP', 'Himachal Pradesh', NULL, '{}', TRUE, TRUE),
  ('in-jk', 'IN', 'India', 'JK', 'Jammu and Kashmir', NULL, '{}', TRUE, TRUE),
  ('in-jh', 'IN', 'India', 'JH', 'Jharkhand', NULL, '{}', TRUE, TRUE),
  ('in-ka', 'IN', 'India', 'KA', 'Karnataka', NULL, '{}', TRUE, TRUE),
  ('in-kl', 'IN', 'India', 'KL', 'Kerala', NULL, '{}', TRUE, TRUE),
  ('in-la', 'IN', 'India', 'LA', 'Ladakh', NULL, '{}', TRUE, TRUE),
  ('in-ld', 'IN', 'India', 'LD', 'Lakshadweep', NULL, '{}', TRUE, TRUE),
  ('in-mp', 'IN', 'India', 'MP', 'Madhya Pradesh', NULL, '{}', TRUE, TRUE),
  ('in-mh', 'IN', 'India', 'MH', 'Maharashtra', NULL, '{}', TRUE, TRUE),
  ('in-mn', 'IN', 'India', 'MN', 'Manipur', NULL, '{}', TRUE, TRUE),
  ('in-ml', 'IN', 'India', 'ML', 'Meghalaya', NULL, '{}', TRUE, TRUE),
  ('in-mz', 'IN', 'India', 'MZ', 'Mizoram', NULL, '{}', TRUE, TRUE),
  ('in-nl', 'IN', 'India', 'NL', 'Nagaland', NULL, '{}', TRUE, TRUE),
  ('in-or', 'IN', 'India', 'OR', 'Odisha', NULL, ARRAY['Orissa'], TRUE, TRUE),
  ('in-py', 'IN', 'India', 'PY', 'Puducherry', NULL, ARRAY['Pondicherry'], TRUE, TRUE),
  ('in-pb', 'IN', 'India', 'PB', 'Punjab', NULL, '{}', TRUE, TRUE),
  ('in-rj', 'IN', 'India', 'RJ', 'Rajasthan', NULL, '{}', TRUE, TRUE),
  ('in-sk', 'IN', 'India', 'SK', 'Sikkim', NULL, '{}', TRUE, TRUE),
  ('in-tn', 'IN', 'India', 'TN', 'Tamil Nadu', NULL, '{}', TRUE, TRUE),
  ('in-ts', 'IN', 'India', 'TS', 'Telangana', NULL, '{}', TRUE, TRUE),
  ('in-tr', 'IN', 'India', 'TR', 'Tripura', NULL, '{}', TRUE, TRUE),
  ('in-up', 'IN', 'India', 'UP', 'Uttar Pradesh', NULL, '{}', TRUE, TRUE),
  ('in-uk', 'IN', 'India', 'UK', 'Uttarakhand', NULL, ARRAY['Uttaranchal'], TRUE, TRUE),
  ('in-wb', 'IN', 'India', 'WB', 'West Bengal', NULL, '{}', TRUE, TRUE),

  -- =========================================================================
  -- 2. Major Indian Cities & Tech Hubs with Canonical Aliases
  -- =========================================================================
  -- Karnataka
  ('in-ka-bengaluru', 'IN', 'India', 'KA', 'Karnataka', 'Bengaluru', ARRAY['Bangalore', 'BLR'], FALSE, TRUE),
  ('in-ka-mysuru', 'IN', 'India', 'KA', 'Karnataka', 'Mysuru', ARRAY['Mysore'], FALSE, TRUE),
  ('in-ka-mangaluru', 'IN', 'India', 'KA', 'Karnataka', 'Mangaluru', ARRAY['Mangalore'], FALSE, TRUE),
  ('in-ka-hubballi', 'IN', 'India', 'KA', 'Karnataka', 'Hubballi', ARRAY['Hubli'], FALSE, TRUE),

  -- Kerala
  ('in-kl-kochi', 'IN', 'India', 'KL', 'Kerala', 'Kochi', ARRAY['Cochin', 'Ernakulam'], FALSE, TRUE),
  ('in-kl-thiruvananthapuram', 'IN', 'India', 'KL', 'Kerala', 'Thiruvananthapuram', ARRAY['Trivandrum', 'TVM'], FALSE, TRUE),
  ('in-kl-kozhikode', 'IN', 'India', 'KL', 'Kerala', 'Kozhikode', ARRAY['Calicut'], FALSE, TRUE),
  ('in-kl-thrissur', 'IN', 'India', 'KL', 'Kerala', 'Thrissur', ARRAY['Trichur'], FALSE, TRUE),
  ('in-kl-kollam', 'IN', 'India', 'KL', 'Kerala', 'Kollam', ARRAY['Quilon'], FALSE, TRUE),
  ('in-kl-kannur', 'IN', 'India', 'KL', 'Kerala', 'Kannur', ARRAY['Cannanore'], FALSE, TRUE),
  ('in-kl-kottayam', 'IN', 'India', 'KL', 'Kerala', 'Kottayam', '{}', FALSE, TRUE),
  ('in-kl-palakkad', 'IN', 'India', 'KL', 'Kerala', 'Palakkad', ARRAY['Palghat'], FALSE, TRUE),
  ('in-kl-alappuzha', 'IN', 'India', 'KL', 'Kerala', 'Alappuzha', ARRAY['Alleppey'], FALSE, TRUE),

  -- Tamil Nadu
  ('in-tn-chennai', 'IN', 'India', 'TN', 'Tamil Nadu', 'Chennai', ARRAY['Madras'], FALSE, TRUE),
  ('in-tn-coimbatore', 'IN', 'India', 'TN', 'Tamil Nadu', 'Coimbatore', ARRAY['Kovai'], FALSE, TRUE),
  ('in-tn-madurai', 'IN', 'India', 'TN', 'Tamil Nadu', 'Madurai', '{}', FALSE, TRUE),
  ('in-tn-tiruchirappalli', 'IN', 'India', 'TN', 'Tamil Nadu', 'Tiruchirappalli', ARRAY['Trichy'], FALSE, TRUE),
  ('in-tn-salem', 'IN', 'India', 'TN', 'Tamil Nadu', 'Salem', '{}', FALSE, TRUE),

  -- Telangana & Andhra Pradesh
  ('in-ts-hyderabad', 'IN', 'India', 'TS', 'Telangana', 'Hyderabad', ARRAY['Secunderabad', 'Cyberabad'], FALSE, TRUE),
  ('in-ts-warangal', 'IN', 'India', 'TS', 'Telangana', 'Warangal', '{}', FALSE, TRUE),
  ('in-ap-visakhapatnam', 'IN', 'India', 'AP', 'Andhra Pradesh', 'Visakhapatnam', ARRAY['Vizag'], FALSE, TRUE),
  ('in-ap-vijayawada', 'IN', 'India', 'AP', 'Andhra Pradesh', 'Vijayawada', '{}', FALSE, TRUE),

  -- Maharashtra
  ('in-mh-mumbai', 'IN', 'India', 'MH', 'Maharashtra', 'Mumbai', ARRAY['Bombay', 'Navi Mumbai', 'Thane'], FALSE, TRUE),
  ('in-mh-pune', 'IN', 'India', 'MH', 'Maharashtra', 'Pune', ARRAY['Poona'], FALSE, TRUE),
  ('in-mh-nagpur', 'IN', 'India', 'MH', 'Maharashtra', 'Nagpur', '{}', FALSE, TRUE),
  ('in-mh-nashik', 'IN', 'India', 'MH', 'Maharashtra', 'Nashik', '{}', FALSE, TRUE),

  -- NCR & Northern India
  ('in-dl-delhi', 'IN', 'India', 'DL', 'Delhi', 'New Delhi', ARRAY['Delhi', 'NCT', 'New Delhi'], FALSE, TRUE),
  ('in-hr-gurugram', 'IN', 'India', 'HR', 'Haryana', 'Gurugram', ARRAY['Gurgaon'], FALSE, TRUE),
  ('in-hr-faridabad', 'IN', 'India', 'HR', 'Haryana', 'Faridabad', '{}', FALSE, TRUE),
  ('in-up-noida', 'IN', 'India', 'UP', 'Uttar Pradesh', 'Noida', ARRAY['Greater Noida'], FALSE, TRUE),
  ('in-up-lucknow', 'IN', 'India', 'UP', 'Uttar Pradesh', 'Lucknow', '{}', FALSE, TRUE),
  ('in-up-kanpur', 'IN', 'India', 'UP', 'Uttar Pradesh', 'Kanpur', '{}', FALSE, TRUE),
  ('in-pb-mohali', 'IN', 'India', 'PB', 'Punjab', 'Mohali', ARRAY['SAS Nagar', 'Sahibzada Ajit Singh Nagar'], FALSE, TRUE),
  ('in-pb-ludhiana', 'IN', 'India', 'PB', 'Punjab', 'Ludhiana', '{}', FALSE, TRUE),
  ('in-ch-chandigarh', 'IN', 'India', 'CH', 'Chandigarh', 'Chandigarh', '{}', FALSE, TRUE),

  -- Gujarat & Central India
  ('in-gj-ahmedabad', 'IN', 'India', 'GJ', 'Gujarat', 'Ahmedabad', ARRAY['Amdavad'], FALSE, TRUE),
  ('in-gj-surat', 'IN', 'India', 'GJ', 'Gujarat', 'Surat', '{}', FALSE, TRUE),
  ('in-gj-vadodara', 'IN', 'India', 'GJ', 'Gujarat', 'Vadodara', ARRAY['Baroda'], FALSE, TRUE),
  ('in-gj-gandhinagar', 'IN', 'India', 'GJ', 'Gujarat', 'Gandhinagar', ARRAY['GIFT City'], FALSE, TRUE),
  ('in-mp-indore', 'IN', 'India', 'MP', 'Madhya Pradesh', 'Indore', '{}', FALSE, TRUE),
  ('in-mp-bhopal', 'IN', 'India', 'MP', 'Madhya Pradesh', 'Bhopal', '{}', FALSE, TRUE),

  -- Eastern India & Rajasthan
  ('in-wb-kolkata', 'IN', 'India', 'WB', 'West Bengal', 'Kolkata', ARRAY['Calcutta'], FALSE, TRUE),
  ('in-or-bhubaneswar', 'IN', 'India', 'OR', 'Odisha', 'Bhubaneswar', '{}', FALSE, TRUE),
  ('in-rj-jaipur', 'IN', 'India', 'RJ', 'Rajasthan', 'Jaipur', '{}', FALSE, TRUE),

  -- =========================================================================
  -- 3. Global Technology & Design Hubs (International Extensibility)
  -- =========================================================================
  ('us-ca-san-francisco', 'US', 'United States', 'CA', 'California', 'San Francisco', ARRAY['SF', 'Bay Area', 'Silicon Valley'], FALSE, TRUE),
  ('us-ny-new-york', 'US', 'United States', 'NY', 'New York', 'New York', ARRAY['NYC'], FALSE, TRUE),
  ('us-wa-seattle', 'US', 'United States', 'WA', 'Washington', 'Seattle', '{}', FALSE, TRUE),
  ('gb-eng-london', 'GB', 'United Kingdom', 'ENG', 'England', 'London', '{}', FALSE, TRUE),
  ('ae-du-dubai', 'AE', 'United Arab Emirates', 'DU', 'Dubai', 'Dubai', '{}', FALSE, TRUE),
  ('ae-az-abu-dhabi', 'AE', 'United Arab Emirates', 'AZ', 'Abu Dhabi', 'Abu Dhabi', '{}', FALSE, TRUE),
  ('sg-sg-singapore', 'SG', 'Singapore', 'SG', 'Singapore', 'Singapore', '{}', FALSE, TRUE),
  ('de-be-berlin', 'DE', 'Germany', 'BE', 'Berlin', 'Berlin', '{}', FALSE, TRUE),
  ('ca-on-toronto', 'CA', 'Canada', 'ON', 'Ontario', 'Toronto', '{}', FALSE, TRUE),
  ('au-nsw-sydney', 'AU', 'Australia', 'NSW', 'New South Wales', 'Sydney', '{}', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  state_code = EXCLUDED.state_code,
  country = EXCLUDED.country,
  country_code = EXCLUDED.country_code,
  aliases = EXCLUDED.aliases,
  is_state_wide = EXCLUDED.is_state_wide,
  is_active = EXCLUDED.is_active;
