export type ResumeSectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "optional";

export type ResumeTemplateId = "classic-ats";

export type ResumeFontFamily = "helvetica" | "times";

export interface ResumeFontOption {
  id: ResumeFontFamily;
  name: string;
  label: string;
  category: "Sans-Serif" | "Serif";
  cssFamily: string;
  description: string;
}

export const RESUME_FONT_OPTIONS: ResumeFontOption[] = [
  {
    id: "helvetica",
    name: "Helvetica / Arial",
    label: "Modern Clean (Helvetica)",
    category: "Sans-Serif",
    cssFamily: 'Arial, Helvetica, "Liberation Sans", sans-serif',
    description: "Clean, balanced, modern standard. Recommended for Tech, Product, Design, and Startups.",
  },
  {
    id: "times",
    name: "Times New Roman",
    label: "Classic Serif (Times)",
    category: "Serif",
    cssFamily: '"Times New Roman", Times, Georgia, serif',
    description: "Prestigious, traditional serif. Recommended for Finance, Law, Academia, and Consulting.",
  },
];

export interface ResumeLink {
  id: string;
  label: string;
  url: string;
}

export interface ResumePersonalDetails {
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  links: ResumeLink[];
}

export interface ResumeExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface ResumeEducationItem {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  grade: string;
  highlights: string;
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  role: string;
  link: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export interface ResumeOptionalSection {
  id: string;
  title: string;
  items: string[];
}

export interface ResumeData {
  fontFamily?: ResumeFontFamily;
  personal: ResumePersonalDetails;
  summary: string;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  skills: ResumeSkillGroup[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  optionalSections: ResumeOptionalSection[];
  sectionOrder: ResumeSectionKey[];
}

export interface SavedResumeRecord {
  id: string;
  userId: string;
  title: string;
  template: ResumeTemplateId;
  data: ResumeData;
  targetJobDescription: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "optional",
];

export const FRESHER_SECTION_ORDER: ResumeSectionKey[] = [
  "summary",
  "education",
  "projects",
  "skills",
  "experience",
  "certifications",
  "optional",
];

export const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  optional: "Additional Sections",
};

export function createId(prefix = "item"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyResumeData(): ResumeData {
  return {
    fontFamily: "helvetica",
    personal: {
      firstName: "",
      lastName: "",
      headline: "",
      email: "",
      phone: "",
      city: "",
      links: [],
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    optionalSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export function createBlankExperience(): ResumeExperienceItem {
  return {
    id: createId("exp"),
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    bullets: [""],
  };
}

export function createBlankEducation(): ResumeEducationItem {
  return {
    id: createId("edu"),
    degree: "",
    fieldOfStudy: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    grade: "",
    highlights: "",
  };
}

export function createBlankSkillGroup(category = ""): ResumeSkillGroup {
  return {
    id: createId("skill"),
    category,
    items: [],
  };
}

export function createBlankProject(): ResumeProjectItem {
  return {
    id: createId("proj"),
    name: "",
    role: "",
    link: "",
    startDate: "",
    endDate: "",
    description: "",
    highlights: [],
  };
}

export function createBlankCertification(): ResumeCertificationItem {
  return {
    id: createId("cert"),
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  };
}

export function createBlankOptionalSection(title = ""): ResumeOptionalSection {
  return {
    id: createId("opt"),
    title,
    items: [""],
  };
}

