import type { Job } from "@/app/types/job";
import type { RemoteEligibilityType } from "@/lib/supabase/locations-data";

export type CandidatePreference =
  | "COMPANY_STATE"
  | "ALL_INDIA"
  | "EXACT_LOCATION"
  | "SPECIFIC_LOCATION"
  | "WORLDWIDE";

export interface OfficeLocation {
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

export interface PreferredTarget {
  name: string;
  type: "city" | "state";
  state?: string;
}

export type SalaryPeriod = "YEAR" | "MONTH" | "HOUR";
export type SalaryType = "RANGE" | "FIXED" | "UP_TO";

export interface JobFormState {
  title: string;
  company: string;
  category?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN" | "OTHER";
  workMode: "Onsite" | "Hybrid" | "Remote";
  location: string;
  selectedOffices: OfficeLocation[];
  candidatePreference: CandidatePreference;
  preferredTargets: PreferredTarget[];
  remoteEligibilityType: RemoteEligibilityType;
  remoteEligibilityCountries: string[];
  hqLocation: string;
  experienceMin: string;
  experienceMax: string;
  postedDate: string;
  salary: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
  salaryType?: SalaryType;
  salaryIsDisclosed?: boolean;
  mail: string;
  companyLink: string;
  description: string;
}

export interface JobFormWizardProps {
  mode: "create" | "edit" | "public";
  jobId?: string;
  initialJob?: Job | null;
}
