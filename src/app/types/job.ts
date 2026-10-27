// src/app/types/job.ts

export type RemoteEligibilityType =
  | "WORLDWIDE"
  | "COUNTRIES"
  | "REGIONS"
  | "CITIES"
  | "UNSPECIFIED";

export interface JobLocation {
  id?: string;
  locationId?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  locality?: string;
  postalCode?: string;
  isPrimary?: boolean;
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  apply: string;
  description: string;
  views: number;
  applicantCountry?: string;
  validThrough?: string;
  employmentType?: string;
  workMode?: string;
  isTestData?: boolean;

  // Global structured location fields
  primaryCity?: string;
  primaryState?: string;
  primaryStateCode?: string;
  primaryCountry?: string;
  primaryCountryCode?: string;
  locality?: string;
  postalCode?: string;
  isMultiLocation?: boolean;
  physicalLocations?: JobLocation[];

  // Remote applicant eligibility (decoupled from office location)
  remoteEligibilityType?: RemoteEligibilityType;
  remoteEligibilityCountries?: string[];
  remoteEligibilityRegions?: Array<{ countryCode: string; region: string; regionCode?: string }>;
  remoteEligibilityCities?: Array<{ countryCode: string; region: string; city: string }>;

  // Headquarters / Office reference
  hqLocationId?: string;

  // Audit and review flags
  rawLocation?: string;
  workModeNotes?: string;
  requiresReview?: boolean;
};

