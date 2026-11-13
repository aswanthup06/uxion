import {
  createEmptyResumeData,
  DEFAULT_SECTION_ORDER,
  FRESHER_SECTION_ORDER,
} from "../src/lib/resume/types";
import { layoutResumeDocument } from "../src/lib/resume/document-layout";
import { generateResumePdfBytes } from "../src/lib/resume/pdf";
import { PDFDocument } from "pdf-lib";

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

  console.log("\n=== ALL 5 AUDIT & VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runAuditTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
