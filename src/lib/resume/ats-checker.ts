import type { ResumeData, ResumePersonalDetails, ResumeSectionKey } from "./types";
import {
  hasEducationContent,
  hasExperienceContent,
  hasProjectContent,
  isEndBeforeStart,
  isValidEmail,
  normalizeResumeUrl,
  parseResumeDate,
} from "./validation";
import { layoutResumeDocument } from "./document-layout";

export type AtsCheckSeverity = "error" | "warning" | "pass";

export type AtsCheckCategory =
  | "Spelling & Grammar"
  | "Experience & Impact"
  | "Dates & Chronology"
  | "Job Keywords"
  | "Formatting & Parsing"
  | "Layout & Page Budget"
  | "Contact Details"
  | "Standard Sections"
  | "Entry Completeness";

export interface AtsCheckAction {
  type: "replace-text" | "jump-to-section" | "add-skill";
  label: string;
  fieldPath?: string;
  currentText?: string;
  replacementText?: string;
  originalToken?: string;
  replacementToken?: string;
  section: "personal" | ResumeSectionKey;
}

export interface AtsCheckItem {
  id: string;
  severity: AtsCheckSeverity;
  category: AtsCheckCategory;
  title: string;
  location?: string;
  explanation: string;
  whyItMatters: string;
  howToFix: string;
  suggestedCorrection?: string;
  action?: AtsCheckAction;
  section?: "personal" | ResumeSectionKey;
  canAutoFix?: boolean;
}

export interface RecruiterScorecard {
  contentQuality: {
    status: "Passed" | "Needs review";
    scorePercent: number;
    issuesCount: number;
    summary: string;
  };
  experienceImpact: {
    status: "Passed" | "Needs review";
    strongVerbsCount: number;
    metricsCount: number;
    issuesCount: number;
    summary: string;
  };
  jobMatch: {
    status: "Passed" | "Needs review" | "Not checked";
    matchPercentage: number;
    matchedCount: number;
    missingCount: number;
    summary: string;
  };
  pdfReadiness: {
    status: "Passed" | "Needs review";
    pageCount: number;
    isSparseOverflow: boolean;
    validLinksCount: number;
    summary: string;
  };
}

export interface AtsKeywordAnalysis {
  hasJobDescription: boolean;
  extractedKeywords: string[];
  matchedKeywords: string[];
  transferableKeywords: string[];
  missingKeywords: string[];
  skillsNeedingEvidence: string[];
  matchPercentage: number;
  matchScoreExplanation: string;
  sectionImprovementIdeas: string[];
}

export interface AtsAnalysisResult {
  checks: AtsCheckItem[];
  counts: {
    errors: number;
    warnings: number;
    passes: number;
  };
  scorecard: RecruiterScorecard;
  wordCount: number;
  keywordAnalysis: AtsKeywordAnalysis;
  disclaimer: string;
  overallScore: number;
  readinessLabel: string;
}

export const ATS_DISCLAIMER =
  "This transparent, rule-based audit evaluates structural, content, formatting, date, and keyword practices. It does not simulate proprietary ATS ranking algorithms or guarantee selection.";

const EMOJI_OR_DECORATIVE_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2713\u2714\u2716\u25CF\u25AA\u25AB\u25C6]/u;

const PLACEHOLDER_RE =
  /\b(lorem ipsum|tbd|to be decided|insert here|your name|company name|example\.com)\b|\[(?:insert|add|your|company|metric|x%)[^\]]*\]/i;

const KNOWN_VALID_WORDS = new Set([
  "design",
  "designs",
  "designer",
  "designers",
  "designing",
  "architect",
  "architects",
  "architecture",
  "architectural",
  "streamline",
  "streamlines",
  "streamlining",
  "streamlined",
  "engineer",
  "engineers",
  "engineering",
  "engineered",
  "develop",
  "developer",
  "developers",
  "developing",
  "development",
  "developed",
  "sales",
  "connect",
  "removing",
  "present",
  "lead",
  "leader",
  "leaders",
  "leading",
  "leadership",
  "manage",
  "manager",
  "managers",
  "managing",
  "management",
  "coordinate",
  "coordinates",
  "coordinating",
  "coordinated",
  "coordination",
  "maintain",
  "maintains",
  "maintaining",
  "maintained",
  "maintenance",
  "integrate",
  "integrates",
  "integrating",
  "integrated",
  "integration",
  "collaborate",
  "collaborates",
  "collaborating",
  "collaborated",
  "collaboration",
  "optimize",
  "optimizes",
  "optimizing",
  "optimized",
  "optimization",
  "implement",
  "implements",
  "implementing",
  "implemented",
  "implementation",
  "responsive",
  "interface",
  "interfaces",
  "component",
  "components",
  "system",
  "systems",
  "product",
  "products",
  "production",
  "frontend",
  "backend",
  "fullstack",
  "graphic",
  "graphics",
  "prototype",
  "prototypes",
  "prototyping",
  "wireframe",
  "wireframes",
  "wireframing",
  "user",
  "users",
  "experience",
  "experiences",
]);

const WEAK_STARTER_MAP: Record<string, string> = {
  "responsible for": "Delivered",
  "duties included": "Executed",
  "worked on": "Built",
  "helped with": "Contributed to",
  "assisted with": "Partnered on",
  "tasked with": "Led",
  "participated in": "Spearheaded",
  "involved in": "Delivered",
  handled: "Managed",
  did: "Engineered",
};

function preserveCase(original: string, target: string): string {
  if (!original || !target) return target;
  if (original === original.toUpperCase()) return target.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}

const COMMON_TYPOS: Record<string, string> = {
  // General English misspellings
  teh: "the",
  recieve: "receive",
  recieved: "received",
  recieving: "receiving",
  seperate: "separate",
  seperated: "separated",
  seperating: "separating",
  experiance: "experience",
  experianced: "experienced",
  managment: "management",
  maneger: "manager",
  manger: "manager",
  mangers: "managers",
  maneging: "managing",
  develepor: "developer",
  develepors: "developers",
  reponsible: "responsible",
  enviroment: "environment",
  enviroments: "environments",
  flatform: "platform",
  databse: "database",
  databses: "databases",
  sucessful: "successful",
  sucessfully: "successfully",
  achievment: "achievement",
  achievments: "achievements",
  maintainance: "maintenance",
  maintenence: "maintenance",
  compatability: "compatibility",
  occured: "occurred",
  refered: "referred",
  calender: "calendar",
  oppurtunity: "opportunity",
  independant: "independent",
  profesional: "professional",
  profesionals: "professionals",
  responisbilities: "responsibilities",
  responisbility: "responsibility",
  analitics: "analytics",
  convinient: "convenient",
  accross: "across",
  begining: "beginning",
  frontned: "frontend",
  backned: "backend",
  showinf: "showing",

  // Design, UI/UX & Frontend terms
  desigd: "designed",
  designd: "designed",
  desing: "design",
  desinged: "designed",
  desinger: "designer",
  desingers: "designers",
  desiging: "designing",
  desings: "designs",
  responisve: "responsive",
  resposive: "responsive",
  responsiv: "responsive",
  componet: "component",
  componets: "components",
  componant: "component",
  componants: "components",
  interfaes: "interfaces",
  interfce: "interface",
  interfces: "interfaces",
  resuable: "reusable",
  reusible: "reusable",
  prototpe: "prototype",
  prototpes: "prototypes",
  wirefame: "wireframe",
  wirefames: "wireframes",
  wireframng: "wireframing",
  typograhy: "typography",
  illusrator: "illustrator",
  aniamtion: "animation",
  aniamtions: "animations",

  // Engineering & Action Verbs
  devlop: "develop",
  devloped: "developed",
  devloping: "developing",
  devloper: "developer",
  devlopers: "developers",
  devlopment: "development",
  develped: "developed",
  developped: "developed",
  enginered: "engineered",
  enginred: "engineered",
  enginerd: "engineered",
  engneer: "engineer",
  engneers: "engineers",
  engneering: "engineering",
  enginering: "engineering",
  enginer: "engineer",
  enginier: "engineer",
  enginner: "engineer",
  enginnering: "engineering",
  enginnered: "engineered",
  enginneered: "engineered",
  impliment: "implement",
  implimented: "implemented",
  implimenting: "implementing",
  implimentation: "implementation",
  implemntation: "implementation",
  implemnted: "implemented",
  maintan: "maintain",
  maintaned: "maintained",
  maintaning: "maintaining",
  maintened: "maintained",
  mainteined: "maintained",
  optmize: "optimize",
  optmized: "optimized",
  optmizd: "optimized",
  optmizing: "optimizing",
  optmization: "optimization",
  optimiztion: "optimization",
  colaborate: "collaborate",
  colaborated: "collaborated",
  colaborating: "collaborating",
  colaberated: "collaborated",
  collaobrate: "collaborate",
  collaobrated: "collaborated",
  collaobration: "collaboration",
  delivr: "deliver",
  delivred: "delivered",
  deliverd: "delivered",
  delivring: "delivering",
  integart: "integrate",
  integarted: "integrated",
  intigrated: "integrated",
  integreted: "integrated",
  integartion: "integration",
  intigration: "integration",
  architecd: "architected",
  archited: "architected",
  architeced: "architected",
  architectd: "architected",
  architeched: "architected",
  architecht: "architect",
  architechtured: "architected",
  archtected: "architected",
  architecure: "architecture",
  archtecture: "architecture",
  spearhed: "spearhead",
  spearheded: "spearheaded",
  spearheadd: "spearheaded",
  spearheadde: "spearheaded",
  cordinate: "coordinate",
  cordinated: "coordinated",
  cordinating: "coordinating",
  coordiante: "coordinate",
  coordianted: "coordinated",
  faciliated: "facilitated",
  faciltated: "facilitated",
  orchestred: "orchestrated",
  orchesterated: "orchestrated",
  supervized: "supervised",
  automed: "automated",
  automted: "automated",
  automatted: "automated",
  configurd: "configured",
  configered: "configured",
  deplyed: "deployed",
  creatd: "created",
  analyzd: "analyzed",
  monitered: "monitored",
  troubleshooted: "troubleshot",
  refactred: "refactored",
  refactord: "refactored",
  migrted: "migrated",
  reducde: "reduced",
  increasde: "increased",
  enhancd: "enhanced",
  partenered: "partnered",
  standarized: "standardized",
  standerdized: "standardized",
  streamlind: "streamlined",
  streamlinned: "streamlined",
  streamling: "streamlining",
  producde: "produced",
  executd: "executed",
  directd: "directed",
  direced: "directed",
  generatd: "generated",

  // Architecture, Infrastructure & Systems
  prodct: "product",
  prodcts: "products",
  framwork: "framework",
  framworks: "frameworks",
  libary: "library",
  libaries: "libraries",
  librery: "library",
  servise: "service",
  servises: "services",
  aplication: "application",
  aplications: "applications",
  soluton: "solution",
  solutons: "solutions",
  requriment: "requirement",
  requriments: "requirements",
  requirment: "requirement",
  requirments: "requirements",
  algoritm: "algorithm",
  algoritms: "algorithms",
  infrastucture: "infrastructure",
  infrasturcture: "infrastructure",
  efficency: "efficiency",
  effecient: "efficient",
  scallable: "scalable",
  scalibilty: "scalability",
  realiability: "reliability",
  reliablity: "reliability",
  relible: "reliable",
  authenication: "authentication",
  authntication: "authentication",
  authoriztion: "authorization",
  securty: "security",
  secutiry: "security",
  performence: "performance",
  perfomance: "performance",
  dashbaord: "dashboard",
  dashbord: "dashboard",
  dashbords: "dashboards",
  repositary: "repository",
  repositry: "repository",
  documantation: "documentation",
  documenation: "documentation",
  commiting: "committing",
  dependancy: "dependency",
  dependancies: "dependencies",
  asychronous: "asynchronous",
  synchonous: "synchronous",
  proccess: "process",
  proccessing: "processing",
  enhansement: "enhancement",
  enhansements: "enhancements",
  configration: "configuration",
  configrations: "configurations",
  deplyment: "deployment",
  distrubuted: "distributed",
  concurrancy: "concurrency",
  concurrant: "concurrent",
  paralell: "parallel",
  parrallel: "parallel",
  knowlege: "knowledge",
  technolgy: "technology",
  technolgies: "technologies",
  leadreship: "leadership",
  comunication: "communication",
  buisness: "business",
  busines: "business",
  custmer: "customer",
  custmers: "customers",
  stakeholer: "stakeholder",
  stakeholers: "stakeholders",
  worklow: "workflow",
  worklows: "workflows",
  timline: "timeline",
  timlines: "timelines",
  scheduele: "schedule",
  consistant: "consistent",
  compatable: "compatible",
  flexable: "flexible",
  accessable: "accessible",
  availble: "available",
  relevent: "relevant",
  comprehenisve: "comprehensive",
  thourough: "thorough",
  reccomend: "recommend",
  recomended: "recommended",
};

const BRAND_CASING_CORRECTIONS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  reactjs: "React",
  "react.js": "React",
  nextjs: "Next.js",
  "next.js": "Next.js",
  github: "GitHub",
  gitlab: "GitLab",
  nodejs: "Node.js",
  "node.js": "Node.js",
  html5: "HTML5",
  css3: "CSS3",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  docker: "Docker",
  kubernetes: "Kubernetes",
  graphql: "GraphQL",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  aws: "AWS",
  gcp: "Google Cloud (GCP)",
  azure: "Azure",
  jira: "Jira",
  confluence: "Confluence",
  storybook: "Storybook",
  redux: "Redux",
  zustand: "Zustand",
  webpack: "Webpack",
  vite: "Vite",
  vitest: "Vitest",
  jest: "Jest",
  playwright: "Playwright",
  cypress: "Cypress",
};

const KNOWN_PHRASES = [
  "Next.js",
  "React",
  "React.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "GraphQL",
  "REST API",
  "RESTful APIs",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Supabase",
  "Firebase",
  "AWS",
  "Google Cloud",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "GitHub",
  "Figma",
  "Adobe XD",
  "Sketch",
  "UI/UX",
  "UX Research",
  "Design Systems",
  "Wireframing",
  "Prototyping",
  "User Testing",
  "Accessibility",
  "WCAG",
  "HTML",
  "CSS",
  "Python",
  "Java",
  "Go",
  "Redux",
  "Zustand",
  "Playwright",
  "Cypress",
  "Jest",
  "Vitest",
  "Agile",
  "Scrum",
  "SEO",
  "Performance Optimization",
  "Responsive Design",
  "Product Design",
  "Full Stack",
  "Frontend",
  "Backend",
  "Machine Learning",
  "Data Analysis",
  "SQL",
  "NoSQL",
  "Linux",
  "Terraform",
  "Microservices",
];

const STOP_WORDS = new Set([
  "about", "above", "across", "after", "again", "against", "all", "also", "always",
  "among", "and", "another", "any", "applicant", "applicants", "apply", "applying",
  "are", "around", "as", "at", "available", "based", "be", "because", "been",
  "before", "being", "below", "benefits", "best", "better", "between", "both",
  "build", "building", "built", "business", "but", "by", "can", "candidate",
  "candidates", "career", "collaborate", "collaboration", "communication",
  "company", "competitive", "core", "culture", "current", "day", "days",
  "deliver", "demonstrated", "description", "detail", "develop", "developing",
  "development", "different", "directly", "diverse", "driven", "during", "each",
  "email", "employee", "employees", "employer", "employment", "enable", "end",
  "ensure", "environment", "equal", "etc", "every", "excellent", "existing",
  "experience", "experienced", "familiar", "fast", "features", "field", "find",
  "first", "focus", "focused", "following", "for", "from", "full", "function",
  "good", "great", "grow", "growth", "have", "having", "help", "high", "highly",
  "hire", "hiring", "hybrid", "ideal", "impact", "implement", "improve",
  "including", "inclusive", "india", "industry", "innovative", "into", "join",
  "joining", "key", "knowledge", "large", "lead", "leading", "learn", "least",
  "level", "like", "looking", "maintain", "make", "making", "manage", "management",
  "many", "may", "members", "minimum", "mission", "modern", "month", "months",
  "more", "most", "much", "must", "need", "needs", "new", "next", "nice", "not",
  "now", "office", "often", "one", "only", "onsite", "open", "opportunities",
  "opportunity", "optimize", "other", "our", "out", "over", "own", "part",
  "passionate", "people", "per", "perform", "plus", "position", "preferred",
  "problem", "process", "product", "products", "professional", "proficiency",
  "proficient", "project", "projects", "proven", "provide", "qualifications",
  "qualified", "quality", "real", "related", "relevant", "remote", "required",
  "requirements", "responsibilities", "responsibility", "resume", "right", "role",
  "roles", "salary", "same", "scale", "scalable", "search", "see", "seeking",
  "self", "senior", "share", "should", "similar", "skills", "solid", "solution",
  "solutions", "some", "someone", "solving", "stack", "start", "startup", "strong",
  "such", "support", "system", "systems", "take", "talent", "team", "teams",
  "technical", "technologies", "technology", "than", "that", "the", "their",
  "them", "then", "there", "these", "they", "things", "think", "this", "those",
  "through", "time", "together", "tools", "track", "two", "under", "understand",
  "understanding", "unique", "until", "use", "used", "using", "various", "very",
  "want", "way", "well", "what", "when", "where", "which", "while", "who", "will",
  "with", "within", "without", "work", "working", "world", "would", "write",
  "writing", "year", "years", "you", "your", "yourself",
]);

function flattenResumeText(data: ResumeData): string {
  const parts: string[] = [
    data.personal.firstName,
    data.personal.lastName,
    data.personal.headline,
    data.personal.email,
    data.personal.phone,
    data.personal.city,
    ...data.personal.links.flatMap((l) => [l.label, l.url]),
    data.summary,
    ...data.experience.flatMap((e) => [
      e.jobTitle,
      e.company,
      e.location,
      ...e.bullets,
    ]),
    ...data.education.flatMap((ed) => [
      ed.degree,
      ed.fieldOfStudy,
      ed.institution,
      ed.location,
      ed.grade,
      ed.highlights,
    ]),
    ...data.skills.flatMap((sg) => [sg.category, ...sg.items]),
    ...data.projects.flatMap((p) => [
      p.name,
      p.role,
      p.link,
      p.description,
      ...p.highlights,
    ]),
    ...data.certifications.flatMap((c) => [c.name, c.issuer, c.credentialUrl]),
    ...data.optionalSections.flatMap((o) => [o.title, ...o.items]),
  ];
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(haystackLower: string, term: string): boolean {
  const clean = term.toLowerCase().trim();
  if (!clean) return false;
  if (/[^a-z0-9\s]/i.test(clean)) {
    return haystackLower.includes(clean);
  }
  const pattern = new RegExp(`\\b${escapeRegExp(clean)}\\b`, "i");
  return pattern.test(haystackLower);
}

export function extractJobKeywords(jobDescription: string): string[] {
  const trimmed = jobDescription.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const selected: string[] = [];
  const seenLower = new Set<string>();

  // 1. Match known domain multi-word / symbol-containing keywords first
  const coveredTokens = new Set<string>();
  for (const phrase of KNOWN_PHRASES) {
    if (containsTerm(lower, phrase) && !seenLower.has(phrase.toLowerCase())) {
      seenLower.add(phrase.toLowerCase());
      selected.push(phrase);
      for (const part of phrase.toLowerCase().split(/\s+/)) {
        coveredTokens.add(part);
      }
    }
  }

  // 2. Frequency-ranked unigram technical/domain words from JD
  const freq = new Map<string, { display: string; count: number }>();
  const tokens = trimmed.match(/[A-Za-z][A-Za-z0-9+#./-]{1,28}/g) || [];
  for (const rawTok of tokens) {
    const cleanTok = rawTok.replace(/^[./-]+|[.,:;!?/-]+$/g, "");
    const tokLower = cleanTok.toLowerCase();
    if (cleanTok.length < 3) continue;
    if (STOP_WORDS.has(tokLower) || coveredTokens.has(tokLower)) continue;
    if (/^\d+$/.test(cleanTok)) continue;
    const existing = freq.get(tokLower);
    if (existing) {
      existing.count += 1;
    } else {
      freq.set(tokLower, { display: cleanTok, count: 1 });
    }
  }

  const rankedTokens = Array.from(freq.entries())
    .sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return a[0].localeCompare(b[0]);
    })
    .map(([, v]) => v.display);

  for (const tok of rankedTokens) {
    if (selected.length >= 24) break;
    const tokLower = tok.toLowerCase();
    if (!seenLower.has(tokLower)) {
      seenLower.add(tokLower);
      selected.push(tok);
    }
  }

  return selected.slice(0, 24);
}

function applyTextReplacement(current: string, action: AtsCheckAction): string {
  if (action.originalToken && action.replacementToken !== undefined) {
    if (action.originalToken === "•" || action.originalToken === "-" || action.originalToken === "*") {
      return current.replace(/^[•\-\*]\s*/, action.replacementToken);
    }
    const regex = new RegExp(`\\b${escapeRegExp(action.originalToken)}\\b`, "i");
    if (regex.test(current)) {
      return current.replace(regex, action.replacementToken);
    }
    if (current.includes(action.originalToken)) {
      return current.replace(action.originalToken, action.replacementToken);
    }
  }
  return action.replacementText ?? current;
}

export function applyAtsCorrectionToResume(
  prev: ResumeData,
  action: AtsCheckAction
): ResumeData {
  if (!action.fieldPath || action.replacementText === undefined) return prev;
  const parts = action.fieldPath.split(".");

  if (parts[0] === "personal" && parts[1]) {
    const key = parts[1] as keyof ResumePersonalDetails;
    if (key === "headline") {
      return {
        ...prev,
        personal: {
          ...prev.personal,
          headline: applyTextReplacement(prev.personal.headline, action),
        },
      };
    }
  }

  if (parts[0] === "summary") {
    return {
      ...prev,
      summary: applyTextReplacement(prev.summary, action),
    };
  }

  if (parts[0] === "experience" && parts[1]) {
    const expId = parts[1];
    return {
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        if (parts[2] === "bullets" && parts[3] !== undefined) {
          const bIdx = Number(parts[3]);
          const newBullets = [...exp.bullets];
          newBullets[bIdx] = applyTextReplacement(exp.bullets[bIdx] ?? "", action);
          return { ...exp, bullets: newBullets };
        }
        if (parts[2] === "jobTitle") {
          return {
            ...exp,
            jobTitle: applyTextReplacement(exp.jobTitle, action),
          };
        }
        return exp;
      }),
    };
  }

  if (parts[0] === "projects" && parts[1]) {
    const projId = parts[1];
    return {
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projId) return proj;
        if (parts[2] === "highlights" && parts[3] !== undefined) {
          const hIdx = Number(parts[3]);
          const newHighlights = [...proj.highlights];
          newHighlights[hIdx] = applyTextReplacement(proj.highlights[hIdx] ?? "", action);
          return { ...proj, highlights: newHighlights };
        }
        if (parts[2] === "description") {
          return {
            ...proj,
            description: applyTextReplacement(proj.description, action),
          };
        }
        return proj;
      }),
    };
  }

  if (parts[0] === "skills" && parts[1]) {
    const skillGroupId = parts[1];
    return {
      ...prev,
      skills: prev.skills.map((grp) => {
        if (grp.id !== skillGroupId) return grp;
        if (parts[2] === "items" && parts[3] !== undefined) {
          const itemIdx = Number(parts[3]);
          const newItems = [...grp.items];
          newItems[itemIdx] = applyTextReplacement(grp.items[itemIdx] ?? "", action);
          return { ...grp, items: newItems };
        }
        return grp;
      }),
    };
  }

  return prev;
}

/**
 * Applies all auto-fixable replacement actions (e.g. typos, brand casing, redundant bullets)
 * in a single atomic pass, returning the updated ResumeData and the count of applied fixes.
 */
export function applyAllAtsFixes(
  data: ResumeData,
  checks: AtsCheckItem[]
): { updatedData: ResumeData; appliedCount: number } {
  let current = data;
  let appliedCount = 0;

  for (const check of checks) {
    if (
      check.action?.type === "replace-text" &&
      typeof check.action.replacementText === "string"
    ) {
      current = applyAtsCorrectionToResume(current, check.action);
      appliedCount += 1;
    }
  }

  return { updatedData: current, appliedCount };
}

export function analyzeResumeForAts(
  data: ResumeData,
  jobDescription = ""
): AtsAnalysisResult {
  const checks: AtsCheckItem[] = [];
  const fullText = flattenResumeText(data);
  const fullLower = fullText.toLowerCase();
  const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;

  // --- 1. Contact Details ---
  const hasFullName = Boolean(
    data.personal.firstName.trim() && data.personal.lastName.trim()
  );
  if (!hasFullName) {
    checks.push({
      id: "contact-name",
      severity: "error",
      category: "Contact Details",
      location: "Personal Details · First & Last Name",
      title: "Full name is incomplete",
      explanation:
        "ATS parsers look for your first and last name at the very top of the document to index your candidate record.",
      whyItMatters:
        "Recruiters cannot file or shortlist a candidate whose profile is missing a primary first or last name.",
      howToFix: "Enter both your first name and last name in Personal Details.",
      suggestedCorrection: "Provide your legal or preferred first and last name.",
      action: {
        type: "jump-to-section",
        label: "Edit Name in Personal Details",
        section: "personal",
      },
      section: "personal",
    });
  }

  if (!data.personal.email.trim()) {
    checks.push({
      id: "contact-email-missing",
      severity: "error",
      category: "Contact Details",
      location: "Personal Details · Email Address",
      title: "Email address is missing",
      explanation:
        "Recruiters and ATS systems rely on a reachable email address as your primary contact identifier.",
      whyItMatters:
        "Without an email address, automated scheduling links and recruiter interview invitations cannot reach you.",
      howToFix: "Add a professional email address in Personal Details.",
      suggestedCorrection: "e.g., yourname@domain.com",
      action: {
        type: "jump-to-section",
        label: "Add Email in Personal Details",
        section: "personal",
      },
      section: "personal",
    });
  } else if (!isValidEmail(data.personal.email)) {
    checks.push({
      id: "contact-email-invalid",
      severity: "error",
      category: "Contact Details",
      location: "Personal Details · Email Address",
      title: "Email address format looks invalid",
      explanation:
        "A malformed email address can fail automated ATS contact extraction or prevent recruiters from reaching you.",
      whyItMatters:
        "Automated ATS parsing may discard unparseable email strings or mark the candidate profile uncontactable.",
      howToFix: "Check for typos, spaces, or missing @domain in your email address.",
      suggestedCorrection: data.personal.email.replace(/\s+/g, "").toLowerCase(),
      action: {
        type: "jump-to-section",
        label: "Fix Email Address",
        section: "personal",
      },
      section: "personal",
    });
  }

  if (!data.personal.phone.trim()) {
    checks.push({
      id: "contact-phone",
      severity: "warning",
      category: "Contact Details",
      location: "Personal Details · Phone Number",
      title: "Phone number is missing",
      explanation:
        "Many recruiters call candidates directly for initial screening and some ATS forms validate for a phone number.",
      whyItMatters:
        "Phone screening is often the fastest route to an interview; missing phone numbers slow down recruiter outreach.",
      howToFix: "Add a phone number with country/area code in Personal Details.",
      suggestedCorrection: "+91 98765 43210 or your regional mobile number",
      action: {
        type: "jump-to-section",
        label: "Add Phone Number",
        section: "personal",
      },
      section: "personal",
    });
  }

  if (!data.personal.city.trim()) {
    checks.push({
      id: "contact-city",
      severity: "warning",
      category: "Contact Details",
      location: "Personal Details · Location",
      title: "City / location is missing",
      explanation:
        "Employers often filter candidate searches by city, state, or willingness to work in a region.",
      whyItMatters:
        "Hiring managers filter candidates by regional hub or time zone overlap before scheduling rounds.",
      howToFix: "Add your city and country (e.g., Bengaluru, India or Kozhikode, Kerala).",
      suggestedCorrection: "City, State/Country",
      action: {
        type: "jump-to-section",
        label: "Add City in Personal Details",
        section: "personal",
      },
      section: "personal",
    });
  }

  const invalidLinks = data.personal.links.filter(
    (l) => (l.label.trim() || l.url.trim()) && (!l.label.trim() || !normalizeResumeUrl(l.url))
  );
  if (invalidLinks.length > 0) {
    checks.push({
      id: "contact-links-invalid",
      severity: "warning",
      category: "Contact Details",
      location: "Personal Details · Web Links",
      title: "One or more professional links are incomplete or invalid",
      explanation:
        "Broken or unlabeled URLs may not be clickable in exported PDFs or parsed cleanly by recruiters.",
      whyItMatters:
        "Recruiters verifying code, portfolios, or LinkedIn profiles expect live, working links without copy-paste hurdles.",
      howToFix: "Ensure each link has both a label (e.g. LinkedIn, GitHub) and a valid https:// URL.",
      suggestedCorrection: "Provide standard https:// links for all public profiles.",
      action: {
        type: "jump-to-section",
        label: "Review Links in Personal Details",
        section: "personal",
      },
      section: "personal",
    });
  }

  if (
    hasFullName &&
    isValidEmail(data.personal.email) &&
    data.personal.phone.trim() &&
    data.personal.city.trim() &&
    invalidLinks.length === 0
  ) {
    checks.push({
      id: "contact-complete",
      severity: "pass",
      category: "Contact Details",
      location: "Personal Details",
      title: "Core contact details are complete",
      explanation:
        "Your name, email, phone number, and city are present in plain selectable text.",
      whyItMatters: "Recruiters have immediate access to contact channels.",
      howToFix: "No action needed.",
      section: "personal",
    });
  }

  // --- 2. Standard Sections Presence ---
  const activeExperiences = data.experience.filter(hasExperienceContent);
  const activeEducation = data.education.filter(hasEducationContent);
  const activeProjects = data.projects.filter(hasProjectContent);
  const allSkillItems = data.skills.flatMap((g) => g.items.map((s) => s.trim()).filter(Boolean));

  if (!data.summary.trim()) {
    checks.push({
      id: "section-summary",
      severity: "warning",
      category: "Standard Sections",
      location: "Professional Summary",
      title: "Professional summary is empty",
      explanation:
        "A brief 2–4 sentence summary helps recruiters and keyword search quickly understand your role focus and core background.",
      whyItMatters:
        "In a 6-second scan, hiring managers look for a crisp positioning statement that matches the target role.",
      howToFix:
        "Add a concise summary stating your role, years/focus areas, and primary strengths.",
      suggestedCorrection:
        "e.g., UI/UX Designer and UI Developer with 3+ years of experience taking web applications from Figma to production in React, Next.js, and Tailwind CSS.",
      action: {
        type: "jump-to-section",
        label: "Write Professional Summary",
        section: "summary",
      },
      section: "summary",
    });
  }

  if (activeExperiences.length === 0 && activeProjects.length === 0) {
    checks.push({
      id: "section-exp-or-proj",
      severity: "error",
      category: "Standard Sections",
      location: "Work Experience / Projects",
      title: "No work experience or projects added",
      explanation:
        "Employers look for practical evidence of your skills through either work history or hands-on projects.",
      whyItMatters:
        "A resume without experience or projects lacks demonstrable evidence of capability.",
      howToFix:
        "Add relevant work experience entries, or if you are a student/fresher, add projects demonstrating your work.",
      action: {
        type: "jump-to-section",
        label: "Add Work Experience",
        section: "experience",
      },
      section: "experience",
    });
  }

  if (activeEducation.length === 0) {
    checks.push({
      id: "section-education",
      severity: "warning",
      category: "Standard Sections",
      location: "Education",
      title: "Education section is empty",
      explanation:
        "Most ATS parsers expect a standard Education heading for degree and graduation verification.",
      whyItMatters:
        "Recruiters cross-check minimum degree requirements specified by client company mandates.",
      howToFix: "Add your highest qualification, degree, or relevant coursework.",
      action: {
        type: "jump-to-section",
        label: "Add Education",
        section: "education",
      },
      section: "education",
    });
  }

  if (allSkillItems.length === 0) {
    checks.push({
      id: "section-skills",
      severity: "error",
      category: "Standard Sections",
      location: "Skills",
      title: "Skills section is empty",
      explanation:
        "Recruiters and ATS search queries heavily index explicit skill keywords in a dedicated Skills section.",
      whyItMatters:
        "Recruiter searches use boolean queries (e.g., 'React AND Next.js AND Figma'); missing a skills list hurts discoverability.",
      howToFix:
        "Add your actual technical tools, languages, frameworks, and domain competencies.",
      action: {
        type: "jump-to-section",
        label: "Add Skills",
        section: "skills",
      },
      section: "skills",
    });
  }

  // --- 3. Intelligent Spelling, Grammar & Punctuation Checker ---
  let spellingIssuesCount = 0;

  // Helper scanner for any content text
  const inspectTextForLanguageErrors = (
    text: string,
    fieldLocation: string,
    fieldPath: string,
    section: "personal" | ResumeSectionKey
  ) => {
    if (!text.trim()) return;

    const seenTypoKeys = new Set<string>();

    // Check 1: Typos from comprehensive verified dictionary with case preservation
    for (const [typo, replacement] of Object.entries(COMMON_TYPOS)) {
      if (typo.toLowerCase() === replacement.toLowerCase()) continue;
      const typoRegex = new RegExp(`\\b${escapeRegExp(typo)}\\b`, "i");
      const match = typoRegex.exec(text);
      if (match) {
        const originalWord = match[0];
        if (KNOWN_VALID_WORDS.has(originalWord.toLowerCase())) continue;
        if (originalWord.toLowerCase() === replacement.toLowerCase()) continue;
        const casedReplacement = preserveCase(originalWord, replacement);
        if (originalWord === casedReplacement) continue;
        seenTypoKeys.add(typo.toLowerCase());
        spellingIssuesCount++;
        const fixedText = text.replace(typoRegex, casedReplacement);
        checks.push({
          id: `typo-${fieldPath}-${typo}`,
          severity: "error",
          category: "Spelling & Grammar",
          location: fieldLocation,
          title: `Spelling error: "${originalWord}"`,
          explanation: `The word "${originalWord}" appears misspelled in your resume.`,
          whyItMatters:
            "Spelling errors in developer and designer resumes indicate a lack of attention to detail and polish.",
          howToFix: `Change "${originalWord}" to "${casedReplacement}".`,
          suggestedCorrection: casedReplacement,
          canAutoFix: true,
          action: {
            type: "replace-text",
            label: `Fix spelling to "${casedReplacement}"`,
            fieldPath,
            currentText: text,
            replacementText: fixedText,
            originalToken: originalWord,
            replacementToken: casedReplacement,
            section,
          },
          section,
        });
      }
    }

    // Check 2: Brand casing corrections
    for (const [lowerBrand, properBrand] of Object.entries(BRAND_CASING_CORRECTIONS)) {
      // Look for exact lowercase token or non-canonical casing
      const brandRegex = new RegExp(`\\b${escapeRegExp(lowerBrand)}\\b`, "g");
      const match = brandRegex.exec(text);
      if (match && match[0] !== properBrand) {
        spellingIssuesCount++;
        const fixedText = text.replace(brandRegex, properBrand);
        checks.push({
          id: `brand-casing-${fieldPath}-${lowerBrand}`,
          severity: "warning",
          category: "Spelling & Grammar",
          location: fieldLocation,
          title: `Inconsistent brand casing: "${match[0]}"`,
          explanation: `Standard professional capitalization for this technology is "${properBrand}".`,
          whyItMatters:
            "Technical recruiters and engineering managers evaluate candidate familiarity with modern stacks by accurate tool capitalization.",
          howToFix: `Update "${match[0]}" to "${properBrand}".`,
          suggestedCorrection: properBrand,
          action: {
            type: "replace-text",
            label: `Format as "${properBrand}"`,
            fieldPath,
            currentText: text,
            replacementText: fixedText,
            originalToken: match[0],
            replacementToken: properBrand,
            section,
          },
          section,
        });
      }
    }

    // Check 3: Repeated adjacent duplicate words (e.g. "the the", "in in")
    const duplicateWordMatch = /\b([a-zA-Z]{2,})\s+\1\b/i.exec(text);
    if (duplicateWordMatch) {
      spellingIssuesCount++;
      const dupWord = duplicateWordMatch[1];
      const fixedText = text.replace(new RegExp(`\\b${dupWord}\\s+${dupWord}\\b`, "i"), dupWord);
      checks.push({
        id: `dup-word-${fieldPath}`,
        severity: "error",
        category: "Spelling & Grammar",
        location: fieldLocation,
        title: `Repeated word: "${dupWord} ${dupWord}"`,
        explanation: `The word "${dupWord}" appears twice consecutively in this sentence.`,
        whyItMatters:
          "Duplicate words are clear proofreading misses that distract the recruiter.",
        howToFix: `Remove the duplicate word "${dupWord}".`,
        suggestedCorrection: dupWord,
        action: {
          type: "replace-text",
          label: `Remove duplicate "${dupWord}"`,
          fieldPath,
          currentText: text,
          replacementText: fixedText,
          originalToken: duplicateWordMatch[0],
          replacementToken: dupWord,
          section,
        },
        section,
      });
    }

    // Check 4: Unclosed parentheses, brackets, or braces
    const openParen = (text.match(/\(/g) || []).length;
    const closeParen = (text.match(/\)/g) || []).length;
    const openBracket = (text.match(/\[/g) || []).length;
    const closeBracket = (text.match(/\]/g) || []).length;
    const quoteCount = (text.match(/"/g) || []).length;

    if (openParen !== closeParen || openBracket !== closeBracket || quoteCount % 2 !== 0) {
      spellingIssuesCount++;
      checks.push({
        id: `unclosed-punct-${fieldPath}`,
        severity: "error",
        category: "Spelling & Grammar",
        location: fieldLocation,
        title: "Unclosed punctuation detected",
        explanation:
          "This statement contains an unmatched parenthesis, bracket, or quotation mark.",
        whyItMatters:
          "Broken or unclosed punctuation looks like truncated text or incomplete sentences to a reviewer.",
        howToFix: "Balance the opening and closing parentheses, brackets, or quotes.",
        suggestedCorrection: text.endsWith("(") || text.endsWith("[") ? text.slice(0, -1).trim() : `${text})`,
        action: {
          type: "jump-to-section",
          label: "Edit Statement to Balance Punctuation",
          section,
        },
        section,
      });
    }

    // Check 5: Dangling conjunctions / prepositions at the end of a bullet point
    const danglingMatch = /\s+(and|or|with|to|for|in|the|a|an|by)\s*[.,;]?$/i.exec(text.trim());
    if (danglingMatch) {
      spellingIssuesCount++;
      const trailingWord = danglingMatch[1];
      const cleaned = text.trim().replace(/\s+(and|or|with|to|for|in|the|a|an|by)\s*[.,;]?$/i, ".");
      checks.push({
        id: `dangling-ending-${fieldPath}`,
        severity: "error",
        category: "Spelling & Grammar",
        location: fieldLocation,
        title: `Incomplete statement ending with "${trailingWord}"`,
        explanation: `This statement cuts off mid-thought with the trailing word "${trailingWord}".`,
        whyItMatters:
          "Incomplete sentences appear as if part of your achievement was accidentally deleted or lost in export.",
        howToFix: "Complete the thought or remove the trailing connecting word.",
        suggestedCorrection: cleaned,
        action: {
          type: "replace-text",
          label: `Trim trailing "${trailingWord}"`,
          fieldPath,
          currentText: text,
          replacementText: cleaned,
          section,
        },
        section,
      });
    }

    // Check 6: Unsupported / unearned buzzwords
    const buzzwordMatch = /\b(guru|rockstar|ninja|wizard|world-class|genius|perfectionist)\b/i.exec(text);
    if (buzzwordMatch) {
      checks.push({
        id: `buzzword-${fieldPath}-${buzzwordMatch[1]}`,
        severity: "warning",
        category: "Experience & Impact",
        location: fieldLocation,
        title: `Subjective buzzword: "${buzzwordMatch[1]}"`,
        explanation: `Self-congratulatory buzzwords like "${buzzwordMatch[1]}" read as generic fluff to technical recruiters.`,
        whyItMatters:
          "Senior recruiters and hiring managers prefer concrete architectural accomplishments over subjective self-praise.",
        howToFix: `Replace "${buzzwordMatch[1]}" with verified technical competencies or specific deliverables.`,
        suggestedCorrection: "Focus on technologies used and quantifiable results achieved.",
        action: {
          type: "jump-to-section",
          label: "Replace Buzzword with Concrete Deliverable",
          section,
        },
        section,
      });
    }
  };

  // Inspect Headline & Summary
  inspectTextForLanguageErrors(
    data.personal.headline,
    "Personal Details · Headline",
    "personal.headline",
    "personal"
  );
  inspectTextForLanguageErrors(
    data.summary,
    "Professional Summary",
    "summary",
    "summary"
  );

  // Inspect Experience Bullets & Job Titles
  let strongVerbsCount = 0;
  let metricsCount = 0;
  const seenBulletTexts = new Map<string, string>();

  activeExperiences.forEach((exp) => {
    const roleLabel = exp.jobTitle.trim() || exp.company.trim() || "Experience Entry";
    inspectTextForLanguageErrors(
      exp.jobTitle,
      `Work Experience · ${roleLabel} · Job Title`,
      `experience.${exp.id}.jobTitle`,
      "experience"
    );

    exp.bullets.forEach((b, bIdx) => {
      const cleanB = b.trim();
      if (!cleanB) return;
      const bLocation = `Work Experience · ${roleLabel} · Bullet ${bIdx + 1}`;
      const fieldPath = `experience.${exp.id}.bullets.${bIdx}`;

      inspectTextForLanguageErrors(cleanB, bLocation, fieldPath, "experience");

      // Check redundant leading bullet symbols (e.g. "•", "-", "*") pasted from external docs
      const bulletSymbolMatch = /^[•\-\*]\s*/.exec(cleanB);
      if (bulletSymbolMatch) {
        const symbol = bulletSymbolMatch[0].trim();
        const stripped = cleanB.replace(/^[•\-\*]\s*/, "");
        checks.push({
          id: `redundant-bullet-${exp.id}-${bIdx}`,
          severity: "warning",
          category: "Formatting & Parsing",
          location: bLocation,
          title: `Redundant bullet symbol: "${symbol}"`,
          explanation:
            "Bullet symbols pasted from external documents create duplicate dots in the preview and exported PDF.",
          whyItMatters:
            "Zenoway formats bullet points automatically. Pasting a literal bullet symbol causes awkward double-bullets (• •).",
          howToFix: `Remove the leading "${symbol}" symbol.`,
          suggestedCorrection: stripped,
          action: {
            type: "replace-text",
            label: "Remove leading bullet symbol",
            fieldPath,
            currentText: cleanB,
            replacementText: stripped,
            originalToken: symbol,
            replacementToken: "",
            section: "experience",
          },
          section: "experience",
        });
      }

      const effectiveText = cleanB.replace(/^[•\-\*]\s*/, "");

      // Check duplicate bullets across roles
      const normalizedB = effectiveText.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalizedB.length > 20) {
        if (seenBulletTexts.has(normalizedB)) {
          checks.push({
            id: `dup-bullet-${exp.id}-${bIdx}`,
            severity: "warning",
            category: "Experience & Impact",
            location: bLocation,
            title: "Duplicate bullet point detected",
            explanation: `This achievement statement is nearly identical to one listed under ${seenBulletTexts.get(
              normalizedB
            )}.`,
            whyItMatters:
              "Duplicate bullet points suggest copied job descriptions rather than tailored accomplishments for that specific role.",
            howToFix: "Tailor this point to the specific projects, clients, or technologies of this role.",
            section: "experience",
          });
        } else {
          seenBulletTexts.set(normalizedB, roleLabel);
        }
      }

      // Check weak starters
      for (const [weakStarter, strongVerb] of Object.entries(WEAK_STARTER_MAP)) {
        const weakRegex = new RegExp(`^${weakStarter}\\b`, "i");
        if (weakRegex.test(effectiveText)) {
          const replacement = cleanB.replace(weakRegex, strongVerb);
          checks.push({
            id: `weak-starter-${exp.id}-${bIdx}`,
            severity: "warning",
            category: "Experience & Impact",
            location: bLocation,
            title: `Passive duty phrasing: "${weakStarter}"`,
            explanation: `Opening with "${weakStarter}" describes passive assigned duties rather than candidate ownership.`,
            whyItMatters:
              "Hiring managers evaluate initiative and ownership. Starting with strong action verbs (e.g., Built, Designed, Delivered) immediately conveys high impact.",
            howToFix: `Start with an active verb like "${strongVerb}" and describe the concrete outcome.`,
            suggestedCorrection: replacement,
            action: {
              type: "replace-text",
              label: `Replace "${weakStarter}" with "${strongVerb}"`,
              fieldPath,
              currentText: cleanB,
              replacementText: replacement,
              section: "experience",
            },
            section: "experience",
          });
          break;
        }
      }

      // Check for strong action verbs
      if (
        /^(built|designed|architected|engineered|spearheaded|delivered|accelerated|optimized|streamlined|implemented|developed|launched|mentored|created|scaled|reduced|increased)\b/i.test(
          effectiveText
        )
      ) {
        strongVerbsCount++;
      }

      // Check for quantifiable metrics
      if (/\b(\d+[%kKmMbB]?|\$\d+|\b[1-9]\d*\+?\s*(users|clients|engineers|screens|ms|x|hours|days|sprints))\b/.test(effectiveText)) {
        metricsCount++;
      }
    });
  });

  // Inspect Project Highlights
  activeProjects.forEach((proj) => {
    const projLabel = proj.name.trim() || "Project Entry";
    inspectTextForLanguageErrors(
      proj.description,
      `Projects · ${projLabel} · Description`,
      `projects.${proj.id}.description`,
      "projects"
    );
    proj.highlights.forEach((h, hIdx) => {
      inspectTextForLanguageErrors(
        h,
        `Projects · ${projLabel} · Highlight ${hIdx + 1}`,
        `projects.${proj.id}.highlights.${hIdx}`,
        "projects"
      );
    });
  });

  // Inspect Skills for duplicate items across categories
  const seenSkillsMap = new Map<string, string>();
  data.skills.forEach((g) => {
    const catLabel = g.category.trim() || "Uncategorized Skills";
    g.items.forEach((item, itemIdx) => {
      const cleanItem = item.trim();
      if (!cleanItem) return;
      const lower = cleanItem.toLowerCase();
      if (seenSkillsMap.has(lower)) {
        checks.push({
          id: `dup-skill-${g.id}-${itemIdx}`,
          severity: "warning",
          category: "Spelling & Grammar",
          location: `Skills · ${catLabel}`,
          title: `Duplicate skill: "${cleanItem}"`,
          explanation: `"${cleanItem}" is already listed under "${seenSkillsMap.get(lower)}".`,
          whyItMatters:
            "Listing the same skill in multiple categories wastes valuable vertical space on the resume.",
          howToFix: `Remove "${cleanItem}" from ${catLabel} or combine categories.`,
          section: "skills",
        });
      } else {
        seenSkillsMap.set(lower, catLabel);
      }

      // Check brand casing in skills
      inspectTextForLanguageErrors(
        cleanItem,
        `Skills · ${catLabel}`,
        `skills.${g.id}.items.${itemIdx}`,
        "skills"
      );
    });
  });

  // --- 4. Dates & Chronology & Employment Overlaps ---
  const expDatePrecisions = new Set<string>();
  const expSortKeys: Array<{ label: string; sortKey: number }> = [];

  interface RoleDateWindow {
    roleLabel: string;
    company: string;
    startKey: number;
    endKey: number;
    isCurrent: boolean;
    isContractOrIntern: boolean;
  }
  const roleWindows: RoleDateWindow[] = [];

  activeExperiences.forEach((exp, idx) => {
    const label = exp.jobTitle.trim() || exp.company.trim() || `Experience #${idx + 1}`;
    const startParsed = parseResumeDate(exp.startDate);
    const endParsed = parseResumeDate(exp.endDate);

    const isContractOrIntern = /\b(intern|internship|contract|freelance|part-time|consultant|advisor)\b/i.test(
      `${exp.jobTitle} ${exp.company}`
    );

    if (!exp.startDate.trim() || (!exp.isCurrent && !exp.endDate.trim())) {
      checks.push({
        id: `date-missing-${exp.id}`,
        severity: "error",
        category: "Dates & Chronology",
        location: `Work Experience · ${label}`,
        title: `Missing start or end date for ${label}`,
        explanation: "Missing dates prevent ATS timelines from calculating tenure accurately.",
        whyItMatters:
          "Recruiters need chronological dates to determine years of relevant experience.",
        howToFix: "Provide a start date and either an end date or mark as current role.",
        section: "experience",
      });
    } else if (!startParsed.valid || (!exp.isCurrent && !endParsed.valid)) {
      checks.push({
        id: `date-invalid-${exp.id}`,
        severity: "error",
        category: "Dates & Chronology",
        location: `Work Experience · ${label}`,
        title: `Invalid date format in ${label}`,
        explanation: "Non-standard date text can fail ATS date parsing.",
        whyItMatters:
          "Automated parsers drop unparseable dates or assign 0 months of experience.",
        howToFix: "Use YYYY-MM (e.g., 2024-03) or YYYY (e.g., 2024).",
        section: "experience",
      });
    } else {
      if (startParsed.precision) expDatePrecisions.add(startParsed.precision);
      if (!exp.isCurrent && endParsed.precision) expDatePrecisions.add(endParsed.precision);

      if (isEndBeforeStart(exp.startDate, exp.endDate, exp.isCurrent)) {
        checks.push({
          id: `date-order-${exp.id}`,
          severity: "error",
          category: "Dates & Chronology",
          location: `Work Experience · ${label}`,
          title: `End date is earlier than start date in ${label}`,
          explanation: "Inverted date ranges confuse timeline calculation and look like an entry error.",
          whyItMatters:
            "Inverted dates immediately signal a typographical error in your employment timeline.",
          howToFix: "Update the start or end date so the end date is not earlier than the start date.",
          section: "experience",
        });
      }

      const effectiveEnd = exp.isCurrent
        ? 999999
        : endParsed.sortKey ?? startParsed.sortKey ?? 0;
      expSortKeys.push({ label, sortKey: effectiveEnd });

      if (startParsed.sortKey) {
        roleWindows.push({
          roleLabel: exp.jobTitle.trim(),
          company: exp.company.trim(),
          startKey: startParsed.sortKey,
          endKey: effectiveEnd,
          isCurrent: exp.isCurrent,
          isContractOrIntern,
        });
      }
    }
  });

  // Detect Employment Overlaps between full-time roles
  for (let i = 0; i < roleWindows.length; i++) {
    for (let j = i + 1; j < roleWindows.length; j++) {
      const rA = roleWindows[i];
      const rB = roleWindows[j];
      if (rA.isContractOrIntern || rB.isContractOrIntern) continue;

      // Overlap occurs if max(start) < min(end)
      const overlapStart = Math.max(rA.startKey, rB.startKey);
      const overlapEnd = Math.min(rA.endKey, rB.endKey);

      // Overlap of 2+ months
      if (overlapEnd - overlapStart >= 2) {
        checks.push({
          id: `date-overlap-${rA.company}-${rB.company}`,
          severity: "warning",
          category: "Dates & Chronology",
          location: `Work Experience · ${rA.company} & ${rB.company}`,
          title: `Overlapping employment dates: ${rA.company} and ${rB.company}`,
          explanation: `Your dates indicate concurrent full-time employment between ${rA.company} and ${rB.company}.`,
          whyItMatters:
            "Recruiters scrutinize overlapping full-time positions. If one position was contract, freelance, or consulting, explicitly clarify that in the role title.",
          howToFix:
            "If one role was freelance or contract, add '(Contract)' or '(Freelance)' to the job title.",
          suggestedCorrection: `e.g., "${rB.roleLabel} (Contract)" at ${rB.company}`,
          action: {
            type: "jump-to-section",
            label: "Clarify Role Type in Experience",
            section: "experience",
          },
          section: "experience",
        });
      }
    }
  }

  if (expDatePrecisions.size > 1) {
    checks.push({
      id: "date-inconsistent-precision",
      severity: "warning",
      category: "Dates & Chronology",
      location: "Work Experience",
      title: "Inconsistent date formats in Work Experience",
      explanation:
        "Some experience entries use month-year (YYYY-MM) while others use year-only (YYYY).",
      whyItMatters:
        "Consistent month-year precision allows recruiters to compute accurate total tenure.",
      howToFix: "Use YYYY-MM consistently across all Work Experience entries.",
      section: "experience",
    });
  }

  let outOfOrder = false;
  for (let i = 1; i < expSortKeys.length; i++) {
    if (expSortKeys[i].sortKey > expSortKeys[i - 1].sortKey) {
      outOfOrder = true;
      break;
    }
  }
  if (outOfOrder) {
    checks.push({
      id: "date-reverse-chronological",
      severity: "warning",
      category: "Dates & Chronology",
      location: "Work Experience",
      title: "Work experience is not in reverse-chronological order",
      explanation: "Recruiters and ATS interfaces expect your most recent or current role at the top.",
      whyItMatters:
        "Screeners expect to see your current seniority and latest achievements within the top third of the page.",
      howToFix: "Use the Move Up / Move Down buttons to put the newest roles first.",
      section: "experience",
    });
  }

  // --- 5. Formatting & Layout Budget ---
  if (EMOJI_OR_DECORATIVE_RE.test(fullText)) {
    checks.push({
      id: "format-decorative-symbols",
      severity: "warning",
      category: "Formatting & Parsing",
      title: "Emojis or decorative symbols detected",
      explanation:
        "Emojis and special icon glyphs often turn into garbled characters or unreadable boxes during ATS text extraction.",
      whyItMatters:
        "Corrupted glyphs in PDF extraction can fail parsing parsers or appear as '?' question marks.",
      howToFix: "Replace emojis or decorative icons with plain text.",
    });
  }

  if (PLACEHOLDER_RE.test(fullText)) {
    checks.push({
      id: "format-placeholder-text",
      severity: "error",
      category: "Formatting & Parsing",
      title: "Placeholder text detected",
      explanation:
        "Words like 'Lorem ipsum', 'TBD', or bracketed placeholders indicate unfinished content.",
      whyItMatters:
        "Submitting placeholder text looks completely unprofessional and causes immediate resume disqualification.",
      howToFix: "Replace or remove any placeholder text before downloading or applying.",
    });
  }

  // Page Budget & Sparse Second Page Check
  const layout = layoutResumeDocument(data);
  let isSparseOverflow = false;
  if (layout.pages.length === 2) {
    const page2 = layout.pages[1];
    const page2Height = page2.blocks.reduce((sum, b) => sum + b.heightPt, 0);
    // If page 2 has fewer than 150pt of content (< 20% of an A4 page)
    if (page2Height < 150) {
      isSparseOverflow = true;
      checks.push({
        id: "layout-sparse-overflow",
        severity: "warning",
        category: "Layout & Page Budget",
        location: "Page 2 Layout",
        title: "Awkward sparse second page (only a few lines spilling over)",
        explanation: `Your resume currently spills onto page 2 with only ${page2.blocks.length} block(s) (~${Math.round(
          (page2Height / 750) * 100
        )}% filled).`,
        whyItMatters:
          "Recruiters strongly dislike almost-empty second pages. Either tighten content to fit cleanly onto 1 page, or expand achievements to create a balanced 2-page document.",
        howToFix:
          "Trim 2–3 older bullet points to fit neatly on 1 page, or expand your project and experience highlights to comfortably fill 2 pages.",
      });
    }
  }

  // --- 6. Job Description Match Analysis ---
  const extractedKeywords = extractJobKeywords(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const transferableKeywords: string[] = [];
  const skillsNeedingEvidence: string[] = [];

  for (const kw of extractedKeywords) {
    if (containsTerm(fullLower, kw)) {
      matchedKeywords.push(kw);
    } else {
      // Check if transferable related concept exists
      const kwLower = kw.toLowerCase();
      if (
        (kwLower.includes("react") && fullLower.includes("next.js")) ||
        (kwLower.includes("sql") && fullLower.includes("postgresql")) ||
        (kwLower.includes("aws") && fullLower.includes("cloud")) ||
        (kwLower.includes("figma") && fullLower.includes("ui/ux"))
      ) {
        transferableKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }
  }

  // Check for skills listed in the Skills section that lack applied evidence in bullets
  const experienceAndProjectText = [
    ...activeExperiences.flatMap((e) => e.bullets),
    ...activeProjects.flatMap((p) => [p.description, ...p.highlights]),
  ]
    .join(" ")
    .toLowerCase();

  allSkillItems.forEach((skill) => {
    if (skill.length >= 4 && !containsTerm(experienceAndProjectText, skill)) {
      skillsNeedingEvidence.push(skill);
    }
  });

  const hasJobDescription = Boolean(jobDescription.trim());
  const matchPercentage =
    extractedKeywords.length > 0
      ? Math.round((matchedKeywords.length / extractedKeywords.length) * 100)
      : 0;

  const matchScoreExplanation =
    "Estimated keyword coverage based on detected requirements in your provided job description. This is a transparent rule-based estimate, not an official ATS vendor score.";

  const sectionImprovementIdeas: string[] = [];
  if (hasJobDescription) {
    if (missingKeywords.length > 0) {
      sectionImprovementIdeas.push(
        `Consider incorporating verified keywords like ${missingKeywords.slice(0, 4).join(", ")} into your Skills or Experience bullets if you have real experience with them.`
      );
    }
    if (skillsNeedingEvidence.length > 0) {
      sectionImprovementIdeas.push(
        `Provide applied evidence in experience bullets for: ${skillsNeedingEvidence.slice(0, 3).join(", ")}.`
      );
    }
    if (!data.summary.trim()) {
      sectionImprovementIdeas.push(
        "Add a targeted professional summary highlighting core strengths aligned with the target job title."
      );
    }
  }

  if (hasJobDescription && extractedKeywords.length > 0) {
    if (missingKeywords.length > 0) {
      checks.push({
        id: "jd-keywords-missing",
        severity: matchedKeywords.length === 0 ? "error" : "warning",
        category: "Job Keywords",
        location: "Job Description Match",
        title: `${matchedKeywords.length} of ${extractedKeywords.length} job keywords matched (${matchPercentage}%)`,
        explanation: `Key terms found in the job description that do not appear in your resume: ${missingKeywords
          .slice(0, 8)
          .join(", ")}${missingKeywords.length > 8 ? ", …" : ""}.`,
        whyItMatters:
          "ATS candidate search queries and recruiter screeners filter by explicit keywords from the job description.",
        howToFix:
          "Only add missing terms if you genuinely have hands-on experience with them—never invent skills to manipulate match scores.",
        section: "skills",
      });
    } else {
      checks.push({
        id: "jd-keywords-matched",
        severity: "pass",
        category: "Job Keywords",
        location: "Job Description Match",
        title: `All ${extractedKeywords.length} detected job keywords appear in your resume`,
        explanation: "Your resume includes the primary domain terms detected in the target job posting.",
        whyItMatters: "High alignment with job description priorities helps pass automated recruiter filters.",
        howToFix: "Review your bullets to verify each keyword is backed by real context.",
      });
    }
  }

  // --- 7. Recruiter Scorecard Compilation ---
  const errors = checks.filter((c) => c.severity === "error").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;
  const passes = checks.filter((c) => c.severity === "pass").length;

  const validLinksCount = [
    ...data.personal.links.filter((l) => l.url.trim()),
    ...data.projects.filter((p) => p.link.trim()),
  ].length;

  const scorecard: RecruiterScorecard = {
    contentQuality: {
      status: spellingIssuesCount === 0 ? "Passed" : "Needs review",
      scorePercent: Math.max(0, 100 - spellingIssuesCount * 15),
      issuesCount: spellingIssuesCount,
      summary:
        spellingIssuesCount === 0
          ? "No spelling, duplicate word, or unclosed punctuation errors found."
          : `${spellingIssuesCount} spelling, casing, or punctuation item(s) need attention.`,
    },
    experienceImpact: {
      status: weakBulletsCount(activeExperiences) === 0 ? "Passed" : "Needs review",
      strongVerbsCount,
      metricsCount,
      issuesCount: weakBulletsCount(activeExperiences),
      summary: `${strongVerbsCount} strong action verb(s) and ${metricsCount} measurable metric(s) detected across your experience.`,
    },
    jobMatch: {
      status: !hasJobDescription
        ? "Not checked"
        : matchPercentage >= 65
          ? "Passed"
          : "Needs review",
      matchPercentage,
      matchedCount: matchedKeywords.length,
      missingCount: missingKeywords.length,
      summary: !hasJobDescription
        ? "Paste a job description to evaluate keyword coverage against target requirements."
        : `${matchedKeywords.length} of ${extractedKeywords.length} detected job terms matched (${matchPercentage}% estimated coverage).`,
    },
    pdfReadiness: {
      status: !isSparseOverflow && errors === 0 ? "Passed" : "Needs review",
      pageCount: layout.pages.length,
      isSparseOverflow,
      validLinksCount,
      summary: `${layout.pages.length} page(s) · Single-column ATS layout · ${validLinksCount} verified clickable link(s).`,
    },
  };

  // Motivating ATS Readiness Score (0-100)
  let calculatedScore = 30; // base score for standard ATS formatting
  if (hasFullName && isValidEmail(data.personal.email)) calculatedScore += 20;
  if (data.personal.phone.trim() || data.personal.city.trim()) calculatedScore += 10;
  if (data.summary.trim()) calculatedScore += 10;
  if (activeExperiences.length > 0 || activeProjects.length > 0) calculatedScore += 15;
  if (allSkillItems.length > 0) calculatedScore += 10;
  if (activeEducation.length > 0) calculatedScore += 5;
  // Deduct for active typos/errors
  const penalty = errors * 4 + Math.min(10, warnings * 1);
  const overallScore = Math.max(15, Math.min(100, calculatedScore - penalty));

  let readinessLabel = "Draft in Progress";
  if (overallScore >= 85) readinessLabel = "ATS Ready (Excellent)";
  else if (overallScore >= 70) readinessLabel = "Strong Draft";
  else if (overallScore >= 50) readinessLabel = "Needs Contact & Sections";

  return {
    checks,
    counts: { errors, warnings, passes },
    scorecard,
    wordCount,
    keywordAnalysis: {
      hasJobDescription,
      extractedKeywords,
      matchedKeywords,
      transferableKeywords,
      missingKeywords,
      skillsNeedingEvidence,
      matchPercentage,
      matchScoreExplanation,
      sectionImprovementIdeas,
    },
    disclaimer: ATS_DISCLAIMER,
    overallScore,
    readinessLabel,
  };
}

function weakBulletsCount(experiences: ResumeData["experience"]): number {
  return experiences.flatMap((e) =>
    e.bullets.filter((b) => /^(responsible for|duties included|worked on|helped with|assisted with)\b/i.test(b.trim()))
  ).length;
}
