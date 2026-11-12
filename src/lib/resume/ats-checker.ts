import type { ResumeData, ResumeSectionKey } from "./types";
import {
  hasCertificationContent,
  hasEducationContent,
  hasExperienceContent,
  hasOptionalSectionContent,
  hasProjectContent,
  isEndBeforeStart,
  isValidEmail,
  normalizeResumeUrl,
  parseResumeDate,
} from "./validation";

export type AtsCheckSeverity = "error" | "warning" | "pass";

export interface AtsCheckItem {
  id: string;
  severity: AtsCheckSeverity;
  category:
    | "Contact Details"
    | "Standard Sections"
    | "Entry Completeness"
    | "Dates & Chronology"
    | "Formatting & Parsing"
    | "Readability & Impact"
    | "Job Keywords";
  title: string;
  explanation: string;
  howToFix: string;
  section?: "personal" | ResumeSectionKey;
}

export interface AtsKeywordAnalysis {
  hasJobDescription: boolean;
  extractedKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
}

export interface AtsAnalysisResult {
  checks: AtsCheckItem[];
  counts: {
    errors: number;
    warnings: number;
    passes: number;
  };
  wordCount: number;
  keywordAnalysis: AtsKeywordAnalysis;
  disclaimer: string;
}

export const ATS_DISCLAIMER =
  "This transparent, rule-based check verifies common structural, formatting, date, and keyword practices. It does not reproduce any specific employer's ATS software or guarantee a score, shortlist, or interview.";

const EMOJI_OR_DECORATIVE_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2713\u2714\u2716\u25CF\u25AA\u25AB\u25C6]/u;

const PLACEHOLDER_RE =
  /\b(lorem ipsum|tbd|to be decided|insert here|your name|company name|example\.com)\b|\[(?:insert|add|your|company|metric|x%)[^\]]*\]/i;

const WEAK_STARTER_RE =
  /^(responsible for|duties included|worked on|helped with|assisted with|tasked with)\b/i;

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
      title: "Full name is incomplete",
      explanation:
        "ATS parsers look for your first and last name at the very top of the document to index your candidate record.",
      howToFix: "Enter both your first name and last name in Personal Details.",
      section: "personal",
    });
  }

  if (!data.personal.email.trim()) {
    checks.push({
      id: "contact-email-missing",
      severity: "error",
      category: "Contact Details",
      title: "Email address is missing",
      explanation:
        "Recruiters and ATS systems rely on a reachable email address as your primary contact identifier.",
      howToFix: "Add a professional email address in Personal Details.",
      section: "personal",
    });
  } else if (!isValidEmail(data.personal.email)) {
    checks.push({
      id: "contact-email-invalid",
      severity: "error",
      category: "Contact Details",
      title: "Email address format looks invalid",
      explanation:
        "A malformed email address can fail automated ATS contact extraction or prevent recruiters from reaching you.",
      howToFix: "Check for typos or extra spaces in your email address.",
      section: "personal",
    });
  }

  if (!data.personal.phone.trim()) {
    checks.push({
      id: "contact-phone",
      severity: "warning",
      category: "Contact Details",
      title: "Phone number is missing",
      explanation:
        "Many recruiters call candidates directly for initial screening and some ATS forms validate for a phone number.",
      howToFix: "Add a phone number with country/area code in Personal Details.",
      section: "personal",
    });
  }

  if (!data.personal.city.trim()) {
    checks.push({
      id: "contact-city",
      severity: "warning",
      category: "Contact Details",
      title: "City / location is missing",
      explanation:
        "Employers often filter candidate searches by city, state, or willingness to work in a region.",
      howToFix:
        "Add your city (e.g., Bengaluru, India) without including sensitive street addresses.",
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
      title: "One or more professional links are incomplete or invalid",
      explanation:
        "Broken or unlabeled URLs may not be clickable in exported PDFs or parsed cleanly by recruiters.",
      howToFix:
        "Ensure each link has both a clear label (such as LinkedIn or GitHub) and a valid https:// URL.",
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
      title: "Core contact details are complete",
      explanation:
        "Your name, email, phone number, and city are present in plain selectable text without icon replacements.",
      howToFix: "No action needed.",
      section: "personal",
    });
  }

  // --- 2. Standard Sections ---
  const activeExperiences = data.experience.filter(hasExperienceContent);
  const activeEducation = data.education.filter(hasEducationContent);
  const activeProjects = data.projects.filter(hasProjectContent);
  const activeCertifications = data.certifications.filter(hasCertificationContent);
  const allSkillItems = data.skills.flatMap((g) => g.items.map((s) => s.trim()).filter(Boolean));

  if (!data.summary.trim()) {
    checks.push({
      id: "section-summary",
      severity: "warning",
      category: "Standard Sections",
      title: "Professional summary is empty",
      explanation:
        "A brief 2–4 sentence summary helps recruiters and keyword search quickly understand your role focus and core background.",
      howToFix:
        "Add a concise summary stating your role, years/focus areas, and primary strengths.",
      section: "summary",
    });
  }

  if (activeExperiences.length === 0 && activeProjects.length === 0) {
    checks.push({
      id: "section-exp-or-proj",
      severity: "error",
      category: "Standard Sections",
      title: "No work experience or projects added",
      explanation:
        "Employers look for practical evidence of your skills through either work history or hands-on projects.",
      howToFix:
        "Add relevant work experience entries, or if you are a student/fresher, add projects demonstrating your work.",
      section: "experience",
    });
  }

  if (activeEducation.length === 0) {
    checks.push({
      id: "section-education",
      severity: "warning",
      category: "Standard Sections",
      title: "Education section is empty",
      explanation:
        "Most ATS parsers expect a standard Education heading for degree and graduation verification.",
      howToFix: "Add your highest qualification, degree, or relevant coursework.",
      section: "education",
    });
  }

  if (allSkillItems.length === 0) {
    checks.push({
      id: "section-skills",
      severity: "error",
      category: "Standard Sections",
      title: "Skills section is empty",
      explanation:
        "Recruiters and ATS search queries heavily index explicit skill keywords in a dedicated Skills section.",
      howToFix:
        "Add your actual technical tools, languages, frameworks, and domain competencies.",
      section: "skills",
    });
  } else if (allSkillItems.length < 4) {
    checks.push({
      id: "section-skills-sparse",
      severity: "warning",
      category: "Standard Sections",
      title: "Only a few skills listed",
      explanation:
        "Listing fewer than 4 skills may leave out relevant tools or methods you genuinely use.",
      howToFix:
        "Consider adding any additional verified tools, platforms, or methodologies from your experience.",
      section: "skills",
    });
  }

  if (
    data.summary.trim() &&
    (activeExperiences.length > 0 || activeProjects.length > 0) &&
    activeEducation.length > 0 &&
    allSkillItems.length >= 4
  ) {
    checks.push({
      id: "sections-standard-pass",
      severity: "pass",
      category: "Standard Sections",
      title: "Standard ATS sections are present",
      explanation:
        "Summary, experience/projects, education, and skills are all populated with conventional headings.",
      howToFix: "No action needed.",
    });
  }

  // --- 3. Incomplete Entries ---
  activeExperiences.forEach((exp, idx) => {
    const label = exp.jobTitle.trim() || exp.company.trim() || `Experience #${idx + 1}`;
    const nonEmptyBullets = exp.bullets.map((b) => b.trim()).filter(Boolean);
    if (!exp.jobTitle.trim() || !exp.company.trim()) {
      checks.push({
        id: `exp-incomplete-${exp.id}`,
        severity: "error",
        category: "Entry Completeness",
        title: `Incomplete experience entry (${label})`,
        explanation:
          "ATS role extraction expects both a job title and an employer/company name for every experience entry.",
        howToFix: "Fill in both Job Title and Company for this entry, or remove it if unused.",
        section: "experience",
      });
    } else if (nonEmptyBullets.length === 0) {
      checks.push({
        id: `exp-no-bullets-${exp.id}`,
        severity: "warning",
        category: "Entry Completeness",
        title: `No achievement bullets under ${label}`,
        explanation:
          "An experience entry with only a title and dates provides no context about your responsibilities, tools, or impact.",
        howToFix: "Add 2–5 concise bullet points describing what you built, delivered, or improved.",
        section: "experience",
      });
    }
  });

  activeEducation.forEach((edu, idx) => {
    const label = edu.degree.trim() || edu.institution.trim() || `Education #${idx + 1}`;
    if (!edu.degree.trim() || !edu.institution.trim()) {
      checks.push({
        id: `edu-incomplete-${edu.id}`,
        severity: "error",
        category: "Entry Completeness",
        title: `Incomplete education entry (${label})`,
        explanation:
          "Education parsers pair each degree/qualification with an institution name.",
        howToFix: "Enter both the Degree/Qualification and Institution name.",
        section: "education",
      });
    }
  });

  // --- 4. Dates & Chronology ---
  const expDatePrecisions = new Set<string>();
  const expSortKeys: Array<{ label: string; sortKey: number }> = [];
  let hasDateError = false;

  activeExperiences.forEach((exp, idx) => {
    const label = exp.jobTitle.trim() || exp.company.trim() || `Experience #${idx + 1}`;
    const startParsed = parseResumeDate(exp.startDate);
    const endParsed = parseResumeDate(exp.endDate);

    if (!exp.startDate.trim() || (!exp.isCurrent && !exp.endDate.trim())) {
      hasDateError = true;
      checks.push({
        id: `date-missing-${exp.id}`,
        severity: "error",
        category: "Dates & Chronology",
        title: `Missing start or end date for ${label}`,
        explanation:
          "Missing dates prevent ATS timelines from calculating tenure accurately.",
        howToFix: "Provide a start date and either an end date or mark as current role.",
        section: "experience",
      });
    } else if (!startParsed.valid || (!exp.isCurrent && !endParsed.valid)) {
      hasDateError = true;
      checks.push({
        id: `date-invalid-${exp.id}`,
        severity: "error",
        category: "Dates & Chronology",
        title: `Invalid date format in ${label}`,
        explanation:
          "Non-standard date text can fail ATS date parsing.",
        howToFix: "Use YYYY-MM (e.g., 2024-03) or YYYY (e.g., 2024).",
        section: "experience",
      });
    } else {
      if (startParsed.precision) expDatePrecisions.add(startParsed.precision);
      if (!exp.isCurrent && endParsed.precision) expDatePrecisions.add(endParsed.precision);

      if (isEndBeforeStart(exp.startDate, exp.endDate, exp.isCurrent)) {
        hasDateError = true;
        checks.push({
          id: `date-order-${exp.id}`,
          severity: "error",
          category: "Dates & Chronology",
          title: `End date is earlier than start date in ${label}`,
          explanation:
            "Inverted date ranges confuse timeline calculation and look like an entry error.",
          howToFix: "Update the start or end date so the end date is not earlier than the start date.",
          section: "experience",
        });
      }

      const effectiveEnd = exp.isCurrent
        ? 999999
        : endParsed.sortKey ?? startParsed.sortKey ?? 0;
      expSortKeys.push({ label, sortKey: effectiveEnd });
    }
  });

  if (expDatePrecisions.size > 1) {
    checks.push({
      id: "date-inconsistent-precision",
      severity: "warning",
      category: "Dates & Chronology",
      title: "Inconsistent date formats in Work Experience",
      explanation:
        "Some experience entries use month-year (YYYY-MM) while others use year-only (YYYY). Consistent month-year formatting is clearer for recruiters and ATS timelines.",
      howToFix: "Use YYYY-MM consistently across your Work Experience entries.",
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
      title: "Work experience is not in reverse-chronological order",
      explanation:
        "Recruiters and ATS interfaces expect your most recent or current role at the top.",
      howToFix: "Use the Move Up / Move Down buttons to put the newest roles first.",
      section: "experience",
    });
  }

  if (
    activeExperiences.length > 0 &&
    !hasDateError &&
    expDatePrecisions.size <= 1 &&
    !outOfOrder
  ) {
    checks.push({
      id: "dates-pass",
      severity: "pass",
      category: "Dates & Chronology",
      title: "Dates are consistent and reverse-chronological",
      explanation:
        "All experience entries have valid, consistent dates ordered from newest to oldest.",
      howToFix: "No action needed.",
      section: "experience",
    });
  }

  // --- 5. Formatting & Parsing Hazards ---
  if (EMOJI_OR_DECORATIVE_RE.test(fullText)) {
    checks.push({
      id: "format-decorative-symbols",
      severity: "warning",
      category: "Formatting & Parsing",
      title: "Emojis or decorative symbols detected",
      explanation:
        "Emojis and special icon glyphs often turn into garbled characters or unreadable boxes during ATS text extraction and standard PDF encoding.",
      howToFix: "Replace emojis or star/check icons with plain text.",
    });
  }

  const allTextFields = [
    data.summary,
    ...activeExperiences.flatMap((e) => e.bullets),
    ...activeProjects.flatMap((p) => [p.description, ...p.highlights]),
    ...activeOptionalText(data),
  ];

  if (allTextFields.some((t) => /\|[^\n]+\|/.test(t) || /\t/.test(t))) {
    checks.push({
      id: "format-pipe-table",
      severity: "warning",
      category: "Formatting & Parsing",
      title: "Pipe-delimited or tabbed text detected inside content",
      explanation:
        "Using ASCII tables or tab-aligned columns inside descriptions can scramble reading order when parsed.",
      howToFix: "Use standard single-column sentences or bullet points instead of inline tables.",
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
      howToFix: "Replace or remove any placeholder text before downloading or applying.",
    });
  }

  // --- 6. Readability & Impact ---
  const summaryWords = data.summary.trim()
    ? data.summary.trim().split(/\s+/).length
    : 0;
  if (summaryWords > 110) {
    checks.push({
      id: "readability-long-summary",
      severity: "warning",
      category: "Readability & Impact",
      title: "Professional summary is quite long",
      explanation: `Your summary is ${summaryWords} words. Dense introductory blocks are harder for recruiters to scan in 6–10 seconds.`,
      howToFix: "Tighten your summary to 40–85 words (around 2–4 clear sentences).",
      section: "summary",
    });
  }

  const longBullets = activeExperiences.flatMap((e) =>
    e.bullets.filter((b) => b.trim().split(/\s+/).length > 45)
  );
  if (longBullets.length > 0) {
    checks.push({
      id: "readability-long-bullets",
      severity: "warning",
      category: "Readability & Impact",
      title: `${longBullets.length} experience bullet${longBullets.length > 1 ? "s exceed" : " exceeds"} 45 words`,
      explanation:
        "Overly long bullet points read like dense paragraphs and bury key achievements.",
      howToFix: "Split long bullets or condense each point to 1–2 concise lines (~15–35 words).",
      section: "experience",
    });
  }

  const weakBullets = activeExperiences.flatMap((e) =>
    e.bullets.filter((b) => WEAK_STARTER_RE.test(b.trim()))
  );
  if (weakBullets.length > 0) {
    checks.push({
      id: "readability-weak-starters",
      severity: "warning",
      category: "Readability & Impact",
      title: `${weakBullets.length} bullet${weakBullets.length > 1 ? "s start" : " starts"} with passive duty phrasing`,
      explanation:
        "Phrases like 'Responsible for' or 'Worked on' focus on duties rather than what you delivered.",
      howToFix:
        "Start bullets with strong action verbs (e.g., Built, Designed, Reduced, Led, Implemented) and describe real outcomes.",
      section: "experience",
    });
  }

  if (wordCount > 0 && wordCount < 100) {
    checks.push({
      id: "readability-short",
      severity: "warning",
      category: "Readability & Impact",
      title: `Resume content is very brief (${wordCount} words)`,
      explanation:
        "Very short resumes often lack enough context about projects, tools, and contributions for recruiters or keyword search.",
      howToFix:
        "Expand your relevant experience bullets, projects, or skills with accurate details.",
    });
  } else if (wordCount > 1150) {
    checks.push({
      id: "readability-dense",
      severity: "warning",
      category: "Readability & Impact",
      title: `Resume is quite dense (${wordCount} words)`,
      explanation:
        "Resumes above ~1,100 words typically spill across 3+ pages and dilute focus from your strongest work.",
      howToFix:
        "Trim older or redundant bullets to keep the resume crisp (typically 1–2 A4 pages).",
    });
  }

  // --- 7. Keyword Comparison with Optional Job Description ---
  const extractedKeywords = extractJobKeywords(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of extractedKeywords) {
    if (containsTerm(fullLower, kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const hasJobDescription = Boolean(jobDescription.trim());
  const matchPercentage =
    extractedKeywords.length > 0
      ? Math.round((matchedKeywords.length / extractedKeywords.length) * 100)
      : 0;

  if (hasJobDescription && extractedKeywords.length > 0) {
    if (missingKeywords.length > 0) {
      checks.push({
        id: "jd-keywords-missing",
        severity: matchedKeywords.length === 0 ? "error" : "warning",
        category: "Job Keywords",
        title: `${matchedKeywords.length} of ${extractedKeywords.length} job description terms matched`,
        explanation: `Terms found in the job description that do not appear in your resume: ${missingKeywords
          .slice(0, 10)
          .join(", ")}${missingKeywords.length > 10 ? ", …" : ""}.`,
        howToFix:
          "Only add missing terms if you genuinely have experience with them—for example, using the exact terminology in your Skills or Experience bullets.",
        section: "skills",
      });
    } else {
      checks.push({
        id: "jd-keywords-matched",
        severity: "pass",
        category: "Job Keywords",
        title: `All ${extractedKeywords.length} extracted job keywords appear in your resume`,
        explanation:
          "Your resume already includes the key domain and technical terms detected in the supplied job description.",
        howToFix: "Review your bullets to verify each keyword is backed by real context.",
      });
    }
  }

  // Check certification / optional validity warnings
  if (
    activeCertifications.some((c) => c.credentialUrl.trim() && !normalizeResumeUrl(c.credentialUrl))
  ) {
    checks.push({
      id: "cert-url-invalid",
      severity: "warning",
      category: "Formatting & Parsing",
      title: "Invalid certification credential URL",
      explanation: "One of your certification links is not a valid web URL.",
      howToFix: "Enter a full URL starting with https:// or clear the URL field.",
      section: "certifications",
    });
  }

  const errors = checks.filter((c) => c.severity === "error").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;
  const passes = checks.filter((c) => c.severity === "pass").length;

  return {
    checks,
    counts: { errors, warnings, passes },
    wordCount,
    keywordAnalysis: {
      hasJobDescription,
      extractedKeywords,
      matchedKeywords,
      missingKeywords,
      matchPercentage,
    },
    disclaimer: ATS_DISCLAIMER,
  };
}

function activeOptionalText(data: ResumeData): string[] {
  return data.optionalSections
    .filter(hasOptionalSectionContent)
    .flatMap((o) => [o.title, ...o.items]);
}

