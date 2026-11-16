import { describe, it, expect } from "vitest";
import { extractJobKeywords, analyzeResumeForAts } from "../ats-checker";
import { type ResumeData, DEFAULT_SECTION_ORDER } from "../types";

function createEmptyResume(): ResumeData {
  return {
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

describe("ats-checker", () => {
  describe("extractJobKeywords", () => {
    it("returns empty array for empty or whitespace JD", () => {
      expect(extractJobKeywords("")).toEqual([]);
      expect(extractJobKeywords("   \n\t  ")).toEqual([]);
    });

    it("extracts recognized technical phrases and keywords", () => {
      const jd = `
        We are seeking a Senior Frontend Engineer with deep experience in React, Next.js,
        TypeScript, and Tailwind CSS. The ideal candidate has built design systems in Figma
        and implemented automated testing with Jest or Vitest.
      `;
      const keywords = extractJobKeywords(jd);
      const lowerKeywords = keywords.map((k) => k.toLowerCase());

      expect(lowerKeywords).toContain("react");
      expect(lowerKeywords).toContain("typescript");
    });

    it("does not include common English stop words", () => {
      const jd = "The candidate will work with our team and should have strong communication skills.";
      const keywords = extractJobKeywords(jd);
      const lowerKeywords = keywords.map((k) => k.toLowerCase());

      expect(lowerKeywords).not.toContain("the");
      expect(lowerKeywords).not.toContain("with");
      expect(lowerKeywords).not.toContain("our");
      expect(lowerKeywords).not.toContain("and");
    });
  });

  describe("analyzeResumeForAts", () => {
    it("flags critical errors when personal contact details are missing", () => {
      const resume = createEmptyResume();
      const result = analyzeResumeForAts(resume);

      const errorIds = result.checks.filter((c) => c.severity === "error").map((c) => c.id);
      expect(errorIds).toContain("contact-name");
      expect(errorIds).toContain("contact-email-missing");
      expect(result.overallScore).toBeLessThan(50);
    });

    it("passes contact checks when full details are provided", () => {
      const resume: ResumeData = {
        ...createEmptyResume(),
        personal: {
          firstName: "John",
          lastName: "Doe",
          headline: "Senior UI Developer",
          email: "john.doe@example.com",
          phone: "+91 9876543210",
          city: "Bengaluru, India",
          links: [{ id: "l1", label: "LinkedIn", url: "https://linkedin.com/in/johndoe" }],
        },
        summary: "Passionate UI developer with 5+ years of experience building scalable design systems and web apps.",
        experience: [
          {
            id: "exp-1",
            jobTitle: "Senior Frontend Engineer",
            company: "Tech Corp",
            location: "Bengaluru",
            startDate: "2022-01",
            endDate: "Present",
            isCurrent: true,
            bullets: [
              "Architected responsive Next.js frontend improving Core Web Vitals LCP by 40%.",
              "Mentored junior engineers and collaborated closely with UI/UX designers.",
            ],
          },
        ],
        education: [
          {
            id: "edu-1",
            degree: "B.Tech in Computer Science",
            fieldOfStudy: "Computer Science",
            institution: "National Institute of Technology",
            location: "Bengaluru",
            startDate: "2018",
            endDate: "2022",
            isCurrent: false,
            grade: "8.5 CGPA",
            highlights: "",
          },
        ],
        skills: [
          {
            id: "sk-1",
            category: "Frontend",
            items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
          },
        ],
      };

      const result = analyzeResumeForAts(resume);
      const nameCheck = result.checks.find((c) => c.id === "contact-name");
      const emailCheck = result.checks.find((c) => c.id === "contact-email-missing");

      expect(nameCheck).toBeUndefined();
      expect(emailCheck).toBeUndefined();
      expect(result.overallScore).toBeGreaterThan(60);
    });

    it("evaluates keyword match rate against target job description", () => {
      const resume: ResumeData = {
        ...createEmptyResume(),
        personal: {
          firstName: "Jane",
          lastName: "Smith",
          headline: "Frontend Engineer",
          email: "jane@example.com",
          phone: "+91 9876543211",
          city: "Kochi, India",
          links: [],
        },
        skills: [
          {
            id: "sk-1",
            category: "Core",
            items: ["React", "JavaScript", "CSS"],
          },
        ],
      };

      const jd = "Seeking engineer proficient in React, Kubernetes, Go, Docker, GraphQL, and AWS.";
      const result = analyzeResumeForAts(resume, jd);

      expect(result.keywordAnalysis.hasJobDescription).toBe(true);
      expect(result.keywordAnalysis.extractedKeywords.length).toBeGreaterThan(0);
      expect(result.keywordAnalysis.matchedKeywords.length).toBeGreaterThan(0);
    });
  });
});
