import {
  createEmptyResumeData,
  DEFAULT_SECTION_ORDER,
  FRESHER_SECTION_ORDER,
} from "../src/lib/resume/types";
import { layoutResumeDocument } from "../src/lib/resume/document-layout";
import { generateResumePdfBytes } from "../src/lib/resume/pdf";
import {
  analyzeResumeForAts,
  applyAtsCorrectionToResume,
} from "../src/lib/resume/ats-checker";
import { sanitizeResumeData } from "../src/lib/resume/validation";
import { PDFDocument, PDFName, PDFDict } from "pdf-lib";

async function runAuditTests() {
  console.log("=== Starting ATS Resume Builder Audit & Verification Tests ===");

  // -------------------------------------------------------------
  // Test 1: Fresher Resume (Education & Projects prioritized, 0 Experience)
  // -------------------------------------------------------------
  console.log("\n[Test 1] Testing Fresher Resume...");
  const fresher = createEmptyResumeData();
  fresher.fontFamily = "helvetica";
  fresher.sectionOrder = [...FRESHER_SECTION_ORDER];
  fresher.personal = {
    firstName: "Aarav",
    lastName: "Sharma",
    headline: "Frontend Developer & CS Graduate",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    city: "Bengaluru, India",
    links: [
      { id: "l1", label: "GitHub", url: "https://github.com/aaravsharma" },
      { id: "l2", label: "LinkedIn", url: "https://linkedin.com/in/aaravsharma" },
    ],
  };
  fresher.summary =
    "Motivated Computer Science graduate with strong fundamentals in React, TypeScript, and modern web development. Built responsive full-stack applications and open-source tooling.";
  fresher.education = [
    {
      id: "edu1",
      degree: "B.Tech in Computer Science & Engineering",
      fieldOfStudy: "Computer Science",
      institution: "National Institute of Technology",
      location: "Bengaluru",
      startDate: "2020-08",
      endDate: "2024-05",
      isCurrent: false,
      grade: "8.8 CGPA",
      highlights: "Coursework: Data Structures, Algorithms, Distributed Systems, Database Management.",
    },
  ];
  fresher.projects = [
    {
      id: "p1",
      name: "JobPulse",
      role: "Lead Developer",
      link: "https://jobpulse.dev",
      startDate: "2023-09",
      endDate: "2024-02",
      description: "A real-time job aggregation dashboard with ATS scoring.",
      highlights: [
        "Architected with Next.js 14, Tailwind CSS, and PostgreSQL.",
        "Integrated AI job description keyword matcher with sub-100ms response times.",
      ],
    },
  ];
  fresher.skills = [
    { id: "s1", category: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
    { id: "s2", category: "Frameworks & Tools", items: ["React", "Next.js", "Tailwind CSS", "Git", "Docker"] },
  ];

  const fresherLayout = layoutResumeDocument(fresher);
  console.log(`- Fresher Page Count: ${fresherLayout.pages.length} (Expected: 1)`);
  if (fresherLayout.pages.length !== 1) throw new Error("Fresher resume should fit on 1 page!");

  // Verify section order in blocks
  const fresherHeadings = fresherLayout.pages[0].blocks
    .filter((b) => b.type === "section-heading")
    .map((b) => (b as { title: string }).title);
  console.log("- Fresher Headings Order:", fresherHeadings.join(" -> "));
  if (
    fresherHeadings[0] !== "PROFESSIONAL SUMMARY" ||
    fresherHeadings[1] !== "EDUCATION" ||
    fresherHeadings[2] !== "PROJECTS" ||
    fresherHeadings[3] !== "SKILLS"
  ) {
    throw new Error("Fresher section order mismatch!");
  }

  const fresherPdf = await generateResumePdfBytes(fresher);
  console.log(`- Fresher PDF generated successfully: ${fresherPdf.bytes.length} bytes`);

  // -------------------------------------------------------------
  // Test 2: Experienced Professional Resume (Skills & Experience upfront)
  // -------------------------------------------------------------
  console.log("\n[Test 2] Testing Experienced Professional Resume...");
  const experienced = createEmptyResumeData();
  experienced.fontFamily = "helvetica";
  experienced.sectionOrder = [...DEFAULT_SECTION_ORDER];
  experienced.personal = {
    firstName: "Priya",
    lastName: "Nair",
    headline: "Senior Product Designer",
    email: "priya.nair@example.com",
    phone: "+91 99887 76655",
    city: "Hyderabad, India",
    links: [
      { id: "l1", label: "Portfolio", url: "https://priyanair.design" },
      { id: "l2", label: "LinkedIn", url: "https://linkedin.com/in/priyanair" },
    ],
  };
  experienced.summary =
    "End-to-end Product Designer with 6+ years of experience leading design systems, enterprise SaaS products, and user-centric web applications. Proven track record increasing user engagement by 35%.";
  experienced.skills = [
    { id: "s1", category: "Design", items: ["Design Systems", "Wireframing", "Prototyping", "User Research", "Usability Testing"] },
    { id: "s2", category: "Tools", items: ["Figma", "FigJam", "Miro", "Principle", "Adobe CC"] },
    { id: "s3", category: "Technical", items: ["HTML/CSS", "Design Tokens", "Accessibility (WCAG 2.1 AA)", "Git"] },
  ];
  experienced.experience = [
    {
      id: "exp1",
      jobTitle: "Senior Product Designer",
      company: "Vistaways Tech",
      location: "Hyderabad",
      startDate: "2021-03",
      endDate: "",
      isCurrent: true,
      bullets: [
        "Owned end-to-end design lifecycle for core enterprise SaaS features across web and mobile platforms.",
        "Established multi-brand Design System adopted by 40+ engineers, cutting delivery time by 30%.",
        "Conducted 50+ qualitative user interviews and usability tests to reduce onboarding drop-off by 22%.",
      ],
    },
    {
      id: "exp2",
      jobTitle: "UI/UX Designer",
      company: "Innovate Labs",
      location: "Bengaluru",
      startDate: "2018-06",
      endDate: "2021-02",
      isCurrent: false,
      bullets: [
        "Designed responsive analytics dashboards and financial workflows for over 150,000 monthly active users.",
        "Partnered with cross-functional product teams to deliver 12 major feature releases on schedule.",
      ],
    },
  ];
  experienced.projects = [
    {
      id: "p1",
      name: "Zenoway Design System",
      role: "Lead Systems Designer",
      link: "https://design.zenoway.com",
      startDate: "2022-01",
      endDate: "2023-04",
      description: "An accessible, token-driven component library.",
      highlights: [
        "Engineered 120+ accessible Figma components synced with code tokens.",
      ],
    },
  ];
  experienced.education = [
    {
      id: "edu1",
      degree: "B.Des in Interaction Design",
      fieldOfStudy: "Interaction Design",
      institution: "National Institute of Design",
      location: "Ahmedabad",
      startDate: "2014-07",
      endDate: "2018-05",
      isCurrent: false,
      grade: "First Class with Distinction",
      highlights: "",
    },
  ];
  experienced.certifications = [
    {
      id: "c1",
      name: "NN/g UX Master Certified",
      issuer: "Nielsen Norman Group",
      issueDate: "2022-09",
      credentialUrl: "https://nngroup.com/cert/109283",
    },
  ];

  const expLayout = layoutResumeDocument(experienced);
  console.log(`- Experienced Page Count: ${expLayout.pages.length} (Expected: 1)`);
  const expHeadings = expLayout.pages[0].blocks
    .filter((b) => b.type === "section-heading")
    .map((b) => (b as { title: string }).title);
  console.log("- Experienced Headings Order:", expHeadings.join(" -> "));
  if (
    expHeadings[0] !== "PROFESSIONAL SUMMARY" ||
    expHeadings[1] !== "SKILLS" ||
    expHeadings[2] !== "WORK EXPERIENCE" ||
    expHeadings[3] !== "PROJECTS" ||
    expHeadings[4] !== "EDUCATION" ||
    expHeadings[5] !== "CERTIFICATIONS"
  ) {
    throw new Error("Experienced section order mismatch!");
  }

  const expPdf = await generateResumePdfBytes(experienced);
  console.log(`- Experienced PDF generated successfully: ${expPdf.bytes.length} bytes`);

  // -------------------------------------------------------------
  // Test 3: Resume with Missing Optional Sections
  // -------------------------------------------------------------
  console.log("\n[Test 3] Testing Resume with Missing Optional Sections...");
  const minimal = createEmptyResumeData();
  minimal.personal = {
    firstName: "Rohan",
    lastName: "Verma",
    headline: "Backend Engineer",
    email: "rohan@example.com",
    phone: "+91 91234 56789",
    city: "Pune, India",
    links: [],
  };
  minimal.summary = "Backend Engineer with 3 years building microservices in Go and Java.";
  minimal.skills = [
    { id: "s1", category: "Core", items: ["Go", "Java", "Docker", "PostgreSQL", "Kafka"] },
  ];
  minimal.experience = [
    {
      id: "exp1",
      jobTitle: "Software Engineer",
      company: "CloudScale",
      location: "Pune",
      startDate: "2021-08",
      endDate: "",
      isCurrent: true,
      bullets: ["Maintained 99.99% uptime for core payment ingestion microservices."],
    },
  ];
  minimal.education = [
    {
      id: "edu1",
      degree: "B.E. in Information Technology",
      fieldOfStudy: "Information Technology",
      institution: "Pune University",
      location: "Pune",
      startDate: "2017-08",
      endDate: "2021-06",
      isCurrent: false,
      grade: "",
      highlights: "",
    },
  ];
  // projects, certifications, and optionalSections are completely empty!

  const minLayout = layoutResumeDocument(minimal);
  const minHeadings = minLayout.pages[0].blocks
    .filter((b) => b.type === "section-heading")
    .map((b) => (b as { title: string }).title);
  console.log("- Minimal Headings present:", minHeadings.join(", "));
  if (minHeadings.includes("PROJECTS") || minHeadings.includes("CERTIFICATIONS") || minHeadings.includes("ADDITIONAL SECTIONS")) {
    throw new Error("Empty sections must NOT appear in output!");
  }
  const minPdf = await generateResumePdfBytes(minimal);
  console.log(`- Minimal PDF generated successfully: ${minPdf.bytes.length} bytes`);

  // -------------------------------------------------------------
  // Test 4: Long Resume Requiring Multiple Pages
  // -------------------------------------------------------------
  console.log("\n[Test 4] Testing Long Resume (Multi-Page Pagination & Headers)...");
  const longResume = { ...experienced };
  longResume.experience = [
    ...experienced.experience,
    {
      id: "exp3",
      jobTitle: "Junior Product Designer",
      company: "Creative Studio",
      location: "Mumbai",
      startDate: "2016-01",
      endDate: "2018-05",
      isCurrent: false,
      bullets: [
        "Crafted high-fidelity wireframes, interaction prototypes, and visual assets for e-commerce clients.",
        "Collaborated with QA engineers to audit accessibility compliance and fix cross-browser UI defects.",
        "Participated in daily design critiques and maintained standard Sketch / Figma UI component kits.",
        "Created brand guidelines, iconography, and responsive design specs for 15+ client web launches.",
      ],
    },
    {
      id: "exp4",
      jobTitle: "Design Intern",
      company: "Agency X",
      location: "Mumbai",
      startDate: "2015-06",
      endDate: "2015-12",
      isCurrent: false,
      bullets: [
        "Assisted senior designers in customer journey mapping and heuristic evaluations.",
        "Produced icon sets, typography scales, and presentation decks for stakeholder pitches.",
      ],
    },
    {
      id: "exp5",
      jobTitle: "Freelance UI Specialist",
      company: "Independent",
      location: "Remote",
      startDate: "2014-06",
      endDate: "2015-05",
      isCurrent: false,
      bullets: [
        "Designed marketing landing pages and brand identities for 10+ early-stage technology startups.",
        "Delivered responsive web designs optimized for mobile conversions and SEO visibility.",
      ],
    },
  ];

  const longLayout = layoutResumeDocument(longResume);
  console.log(`- Long Resume Page Count: ${longLayout.pages.length} (Expected: >= 2)`);
  if (longLayout.pages.length < 2) throw new Error("Long resume should span at least 2 pages!");

  // Verify that page 2 does NOT start with an orphaned entry-gap or isolated section heading
  const page2FirstBlock = longLayout.pages[1].blocks[0];
  console.log("- Page 2 First Block Type:", page2FirstBlock.type);
  if (page2FirstBlock.type === "entry-gap") {
    throw new Error("Page 2 must not start with an entry-gap!");
  }

  const longPdf = await generateResumePdfBytes(longResume);
  console.log(`- Long PDF generated: ${longPdf.bytes.length} bytes, pageCount: ${longPdf.pageCount}`);

  // Load generated PDF to verify page count & metadata
  const parsedPdfDoc = await PDFDocument.load(longPdf.bytes);
  console.log(`- Loaded PDF into PDFDocument: ${parsedPdfDoc.getPageCount()} pages`);
  if (parsedPdfDoc.getPageCount() !== longLayout.pages.length) {
    throw new Error("PDF page count does not match layout page count!");
  }

  // -------------------------------------------------------------
  // Test 5: Times New Roman Font PDF Output
  // -------------------------------------------------------------
  console.log("\n[Test 5] Testing Times New Roman Font PDF Output...");
  const timesResume = { ...experienced, fontFamily: "times" as const };
  const timesPdf = await generateResumePdfBytes(timesResume);
  console.log(`- Times New Roman PDF generated: ${timesPdf.bytes.length} bytes`);

  // -------------------------------------------------------------
  // Test 6: Intelligent Quality Checker & Corrections Application
  // -------------------------------------------------------------
  console.log("\n[Test 6] Testing Intelligent Quality Checker & Fix Application...");
  const flawed = createEmptyResumeData();
  flawed.personal = {
    firstName: "Alex",
    lastName: "Taylor",
    headline: "Frontend ninja",
    email: "alex@example.com",
    phone: "+1 555 123 4567",
    city: "San Francisco, CA",
    links: [],
  };
  flawed.summary =
    "Experienced engineer with extensive managment skills who built the the cloud infrastructure (featuring advanced tooling.";
  flawed.skills = [
    {
      id: "s1",
      category: "Frontend",
      items: ["javascript", "nextjs", "React"],
    },
  ];
  flawed.experience = [
    {
      id: "exp1",
      jobTitle: "Senior Software Engineer",
      company: "Company Alpha",
      location: "San Francisco",
      startDate: "2022-01",
      endDate: "2023-06",
      isCurrent: false,
      bullets: ["Responsible for managing databases."],
    },
    {
      id: "exp2",
      jobTitle: "Staff Software Engineer",
      company: "Company Beta",
      location: "San Francisco",
      startDate: "2022-06",
      endDate: "2023-12",
      isCurrent: false,
      bullets: ["Worked on frontend microservices."],
    },
  ];

  const flawedAnalysis = analyzeResumeForAts(flawed);
  console.log("- Quality Checks Found:", flawedAnalysis.checks.length);
  console.log("  Errors:", flawedAnalysis.counts.errors, "Warnings:", flawedAnalysis.counts.warnings);
  console.log("  All check titles:", flawedAnalysis.checks.map((c) => `[${c.category}] ${c.title}`));

  // Check 1: Typo "managment"
  const typoCheck = flawedAnalysis.checks.find((c) => c.title.includes("managment"));
  if (!typoCheck || !typoCheck.action) throw new Error("Quality checker failed to catch typo 'managment'!");
  console.log("  ✓ Caught typo 'managment':", typoCheck.action.label);

  // Check 2: Brand casing "javascript" -> "JavaScript"
  const casingCheck = flawedAnalysis.checks.find((c) => c.title.includes("javascript"));
  if (!casingCheck || !casingCheck.action) throw new Error("Quality checker failed to catch brand casing 'javascript'!");
  console.log("  ✓ Caught casing 'javascript':", casingCheck.action.label);

  // Check 3: Repeated word "the the"
  const repeatedCheck = flawedAnalysis.checks.find((c) => c.title.includes("the the"));
  if (!repeatedCheck) throw new Error("Quality checker failed to catch duplicate adjacent word 'the the'!");
  console.log("  ✓ Caught duplicate word 'the the'");

  // Check 4: Unclosed parenthesis
  const unclosedCheck = flawedAnalysis.checks.find((c) => c.title.includes("Unclosed"));
  if (!unclosedCheck) throw new Error("Quality checker failed to catch unclosed parenthesis!");
  console.log("  ✓ Caught unclosed parenthesis");

  // Check 5: Unsupported buzzword "ninja"
  const buzzwordCheck = flawedAnalysis.checks.find((c) => c.title.includes("ninja"));
  if (!buzzwordCheck) throw new Error("Quality checker failed to catch buzzword 'ninja'!");
  console.log("  ✓ Caught buzzword 'ninja'");

  // Check 6: Passive duty phrasing "Responsible for" / "Worked on"
  const passiveCheck = flawedAnalysis.checks.find((c) =>
    c.title.toLowerCase().includes("passive duty phrasing")
  );
  if (!passiveCheck) throw new Error("Quality checker failed to catch passive duty phrasing!");
  console.log("  ✓ Caught passive duty phrasing");

  // Check 7: Employment overlap between Company Alpha and Company Beta
  const overlapCheck = flawedAnalysis.checks.find(
    (c) =>
      c.category === "Dates & Chronology" &&
      c.title.toLowerCase().includes("overlapping")
  );
  if (!overlapCheck) throw new Error("Quality checker failed to catch concurrent full-time employment overlap!");
  console.log("  ✓ Caught employment date overlap:", overlapCheck.title);

  // Test applyAtsCorrectionToResume on typo
  const fixedResume = applyAtsCorrectionToResume(flawed, typoCheck.action);
  if (!fixedResume.summary.includes("management")) {
    throw new Error("applyAtsCorrectionToResume failed to replace 'managment' with 'management'!");
  }
  console.log("  ✓ Successfully applied typo fix to summary");

  // Test applyAtsCorrectionToResume on skill casing
  const fixedSkillsResume = applyAtsCorrectionToResume(fixedResume, casingCheck.action);
  const fixedGroup = fixedSkillsResume.skills.find((g) => g.id === "s1");
  if (!fixedGroup?.items.includes("JavaScript")) {
    throw new Error("applyAtsCorrectionToResume failed to correct 'javascript' to 'JavaScript'!");
  }
  console.log("  ✓ Successfully applied casing fix to skills");

  // -------------------------------------------------------------
  // Test 7: Job Description Matching & Categorization
  // -------------------------------------------------------------
  console.log("\n[Test 7] Testing Job Description Matching Engine...");
  const jdText = `
    We are seeking a Senior Frontend Engineer proficient in React, TypeScript, Next.js, and Tailwind CSS.
    Experience with GraphQL, Docker, and Kubernetes is highly desirable.
    Must demonstrate strong leadership and mentorship capabilities.
  `;
  const jdAnalysis = analyzeResumeForAts(fixedSkillsResume, jdText);
  if (!jdAnalysis.keywordAnalysis.hasJobDescription) {
    throw new Error("Job match analysis should indicate hasJobDescription: true!");
  }

  console.log(`- Estimated Match Score: ${jdAnalysis.keywordAnalysis.matchPercentage}%`);
  console.log("- Matched Skills:", jdAnalysis.keywordAnalysis.matchedKeywords.join(", "));
  console.log("- Missing Critical Keywords:", jdAnalysis.keywordAnalysis.missingKeywords.join(", "));
  console.log("- Transferable Skills:", jdAnalysis.keywordAnalysis.transferableKeywords.join(", "));

  if (!jdAnalysis.keywordAnalysis.matchedKeywords.some((k) => k.toLowerCase() === "react")) {
    throw new Error("Job matcher failed to match 'React'!");
  }
  if (!jdAnalysis.keywordAnalysis.missingKeywords.some((k) => k.toLowerCase() === "graphql")) {
    throw new Error("Job matcher failed to identify missing keyword 'GraphQL'!");
  }
  if (!jdAnalysis.keywordAnalysis.matchScoreExplanation.includes("estimate")) {
    throw new Error("Job match score explanation must clearly state it is an estimate!");
  }
  console.log("  ✓ Verified transparent estimated match score explanation and disclaimer");

  // -------------------------------------------------------------
  // Test 8: Clickable Link Annotations in Generated PDF
  // -------------------------------------------------------------
  console.log("\n[Test 8] Testing Clickable Link Annotations in Generated PDF...");
  const linkResume = { ...experienced };
  linkResume.projects = [
    {
      id: "p1",
      name: "Zenoway Portal",
      role: "Lead Engineer",
      link: "https://zenoway.com/demo",
      startDate: "2023-01",
      endDate: "2023-12",
      description: "Interactive candidate and job portal.",
      highlights: [
        "Live deployment at https://zenoway.com/live with 50,000 monthly active users.",
      ],
    },
  ];

  const linkPdf = await generateResumePdfBytes(linkResume);
  const loadedLinkPdf = await PDFDocument.load(linkPdf.bytes);
  let totalLinkAnnotations = 0;

  for (let pageIdx = 0; pageIdx < loadedLinkPdf.getPageCount(); pageIdx++) {
    const page = loadedLinkPdf.getPage(pageIdx);
    const annots = page.node.get(PDFName.of("Annots"));
    if (annots) {
      const annotsArray = loadedLinkPdf.context.lookup(annots);
      if (Array.isArray((annotsArray as unknown as { array: unknown[] })?.array)) {
        const arr = (annotsArray as unknown as { array: unknown[] }).array;
        for (const annotRef of arr) {
          const dict = loadedLinkPdf.context.lookup(annotRef as unknown as Parameters<typeof loadedLinkPdf.context.lookup>[0]) as PDFDict;
          if (dict && dict.get(PDFName.of("Subtype"))?.toString() === "/Link") {
            const action = dict.get(PDFName.of("A"));
            if (action) {
              const actionDict = loadedLinkPdf.context.lookup(action as unknown as Parameters<typeof loadedLinkPdf.context.lookup>[0]) as PDFDict;
              const uri = actionDict.get(PDFName.of("URI"))?.toString();
              if (uri) {
                totalLinkAnnotations++;
                console.log(`  Found clickable PDF Link Annotation: ${uri}`);
              }
            }
          }
        }
      }
    }
  }

  console.log(`- Total clickable link annotations in PDF: ${totalLinkAnnotations}`);
  if (totalLinkAnnotations < 2) {
    throw new Error(`Expected at least 2 clickable link annotations (project link and bullet URL), found ${totalLinkAnnotations}`);
  }
  console.log("  ✓ Successfully verified clickable PDF link annotations");

  // -------------------------------------------------------------
  // Test 9: Long Skill Token Preservation (Fixing 60-char truncation)
  // -------------------------------------------------------------
  console.log("\n[Test 9] Testing Long Skill Token Preservation & Parentheses Handling...");
  const skillResume = createEmptyResumeData();
  const longSkill = "Figma (Auto Layout, Design Systems, Variables/Tokens, Dev Mode, Wireframing, User Flows)";
  skillResume.personal = { ...experienced.personal };
  skillResume.skills = [
    {
      id: "s_design",
      category: "Design & UX",
      items: [longSkill, "Adobe Illustrator", "Responsive Design"],
    },
  ];

  const sanitized = sanitizeResumeData(skillResume);
  if (!sanitized.ok) throw new Error("Sanitization failed for long skills!");
  const preservedItem = sanitized.data.skills[0].items[0];
  console.log(`- Input Skill length: ${longSkill.length} chars`);
  console.log(`- Sanitized Skill: "${preservedItem}" (Length: ${preservedItem.length})`);
  if (preservedItem !== longSkill) {
    throw new Error(`Skill was truncated! Expected "${longSkill}", got "${preservedItem}"`);
  }
  if (!preservedItem.includes("Dev Mode")) {
    throw new Error("Skill had 'Dev Mode' truncated!");
  }
  console.log("  ✓ Verified full skill preserved without truncation");

  // -------------------------------------------------------------
  // Test 10: Recruiter Scorecard Pillars
  // -------------------------------------------------------------
  console.log("\n[Test 10] Testing Recruiter Scorecard Pillars & Status Labels...");
  const scorecard = flawedAnalysis.scorecard;
  console.log("- Scorecard Statuses:", {
    contentQuality: scorecard.contentQuality.status,
    experienceImpact: scorecard.experienceImpact.status,
    pdfReadiness: scorecard.pdfReadiness.status,
    jobMatch: scorecard.jobMatch.status,
  });

  if (scorecard.contentQuality.status !== "Needs review") {
    throw new Error("Content Quality scorecard should be 'Needs review' when typos exist!");
  }
  if (scorecard.jobMatch.status !== "Not checked") {
    throw new Error("Job Match scorecard should be 'Not checked' when JD is absent!");
  }
  if (jdAnalysis.scorecard.jobMatch.status === "Not checked") {
    throw new Error("Job Match scorecard should update when JD is provided!");
  }
  console.log("  ✓ Verified Recruiter Review Scorecard status calculations and labels");

  // -------------------------------------------------------------
  // Test 11: Real-World Typo ("Desigd" -> "Designed") & Case Preservation
  // -------------------------------------------------------------
  console.log("\n[Test 11] Testing Real-World Typo ('Desigd' -> 'Designed') & Scorecard State...");
  const userCaseResume = createEmptyResumeData();
  userCaseResume.personal = {
    firstName: "Aswanth",
    lastName: "U P",
    headline: "UI Developer",
    email: "aswanth@example.com",
    phone: "+91 98765 43210",
    city: "Kozhikode, India",
    links: [],
  };
  userCaseResume.experience = [
    {
      id: "exp_chaavie",
      jobTitle: "UI Developer",
      company: "Chaavie Solutions",
      location: "Kozhikode, India",
      startDate: "2023-06",
      endDate: "2026-07",
      isCurrent: false,
      bullets: [
        "•Desigd user flows and responsive interfaces in Figma, then built reusable component-based UI in React, Next.js, Tailwind CSS, JavaScript, and CSS3 across multiple products.",
      ],
    },
  ];

  const userCaseAnalysis = analyzeResumeForAts(userCaseResume);
  console.log("- User Case Quality Checks Found:", userCaseAnalysis.checks.length);
  console.log("  Errors:", userCaseAnalysis.counts.errors, "Warnings:", userCaseAnalysis.counts.warnings);
  console.log("  Language & Typos status:", userCaseAnalysis.scorecard.contentQuality.status);

  if (userCaseAnalysis.scorecard.contentQuality.status === "Passed") {
    throw new Error("Scorecard should NOT pass when 'Desigd' typo is present!");
  }

  const desigdCheck = userCaseAnalysis.checks.find(
    (c) => c.title.includes("Desigd") || c.explanation.includes("Desigd")
  );
  if (!desigdCheck || !desigdCheck.action) {
    throw new Error("Checker failed to detect 'Desigd' as a spelling error!");
  }
  console.log("  ✓ Caught 'Desigd' typo:", desigdCheck.title);
  console.log("  ✓ Suggested correction:", desigdCheck.suggestedCorrection);

  if (desigdCheck.suggestedCorrection !== "Designed") {
    throw new Error(`Expected case-preserved correction "Designed", got "${desigdCheck.suggestedCorrection}"`);
  }

  // Verify redundant bullet symbol is also flagged
  const bulletSymbolCheck = userCaseAnalysis.checks.find((c) =>
    c.id.startsWith("redundant-bullet")
  );
  if (!bulletSymbolCheck) {
    throw new Error("Checker failed to flag redundant leading '•' bullet symbol!");
  }
  console.log("  ✓ Caught redundant leading bullet symbol '•'");

  // Verify correction application
  const fixedUserResume = applyAtsCorrectionToResume(userCaseResume, desigdCheck.action);
  const fixedBullet = fixedUserResume.experience[0].bullets[0];
  console.log("  ✓ Corrected Bullet:", fixedBullet);
  if (!fixedBullet.includes("Designed")) {
    throw new Error(`Failed to replace 'Desigd' with 'Designed'! Got: "${fixedBullet}"`);
  }

  console.log("\n=== ALL 11 AUDIT & VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runAuditTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
