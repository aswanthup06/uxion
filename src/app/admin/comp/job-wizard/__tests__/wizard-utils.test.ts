import { describe, it, expect } from "vitest";
import {
  formatExperienceLabel,
  parseExperienceFromJob,
  dateForInput,
  cleanDescriptionText,
  formatSalaryBadge,
  calculateNumericSalary,
  parseSalaryFromJob,
} from "../wizard-utils";
import type { Job } from "@/app/types/job";

describe("wizard-utils", () => {
  describe("formatExperienceLabel", () => {
    it("formats 0 to 0 as Fresher", () => {
      expect(formatExperienceLabel("0", "0")).toBe("Fresher");
      expect(formatExperienceLabel("0", "")).toBe("Fresher");
      expect(formatExperienceLabel("", "")).toBe("Fresher");
    });

    it("formats 0 to max as 0–N years", () => {
      expect(formatExperienceLabel("0", "2")).toBe("0–2 years");
    });

    it("formats min to max as min–max years", () => {
      expect(formatExperienceLabel("3", "6")).toBe("3–6 years");
    });

    it("formats equal min and max as exact years", () => {
      expect(formatExperienceLabel("1", "1")).toBe("1 year");
      expect(formatExperienceLabel("5", "5")).toBe("5 years");
    });

    it("formats unbounded min as min+ years", () => {
      expect(formatExperienceLabel("5", "")).toBe("5+ years");
    });
  });

  describe("parseExperienceFromJob", () => {
    const baseJob: Job = {
      id: "test-job-1",
      title: "UI Developer",
      company: "Zenoway",
      location: "Bengaluru",
      workMode: "Hybrid",
      employmentType: "FULL_TIME",
      category: "UI/UX & Product Design",
      experience: "Fresher",
      salary: "12 LPA",
      mail: "careers@zenoway.com",
      companyLink: "https://zenoway.com",
      description: "Sample",
      postedDate: "2026-11-16",
      apply: "https://zenoway.com/apply",
      views: 0,
    };

    it("parses Fresher into 0-0 range", () => {
      expect(parseExperienceFromJob({ ...baseJob, experience: "Fresher" })).toEqual({
        min: "0",
        max: "0",
      });
      expect(parseExperienceFromJob({ ...baseJob, experience: "fresher" })).toEqual({
        min: "0",
        max: "0",
      });
      expect(parseExperienceFromJob({ ...baseJob, experience: "" })).toEqual({
        min: "0",
        max: "0",
      });
    });

    it("parses ranges into min and max", () => {
      expect(parseExperienceFromJob({ ...baseJob, experience: "3 - 6 years" })).toEqual({
        min: "3",
        max: "6",
      });
      expect(parseExperienceFromJob({ ...baseJob, experience: "0–2 yrs" })).toEqual({
        min: "0",
        max: "2",
      });
    });

    it("parses plus notation into open-ended min", () => {
      expect(parseExperienceFromJob({ ...baseJob, experience: "5+ years" })).toEqual({
        min: "5",
        max: "",
      });
    });

    it("parses single number into equal min and max", () => {
      expect(parseExperienceFromJob({ ...baseJob, experience: "4 years" })).toEqual({
        min: "4",
        max: "4",
      });
    });
  });

  describe("dateForInput", () => {
    it("formats ISO date strings to YYYY-MM-DD", () => {
      expect(dateForInput("2026-11-16T12:00:00.000Z")).toBe("2026-11-16");
    });

    it("handles DD/MM/YYYY format", () => {
      expect(dateForInput("16/11/2026")).toBe("2026-11-16");
    });

    it("handles empty or invalid values safely", () => {
      expect(dateForInput("")).toBe("");
      expect(dateForInput(undefined)).toBe("");
      expect(dateForInput("invalid-date-string")).toBe("");
    });
  });

  describe("cleanDescriptionText", () => {
    it("strips leading metadata blocks", () => {
      const raw = `Role: Senior Frontend Engineer
Company: Zenoway Tech
Location: Bengaluru
Salary: 18-24 LPA

About the Role:
We are looking for an experienced developer.`;

      const cleaned = cleanDescriptionText(raw);
      expect(cleaned).not.toContain("Role: Senior Frontend Engineer");
      expect(cleaned).not.toContain("Company: Zenoway Tech");
      expect(cleaned).toContain("We are looking for an experienced developer.");
    });

    it("handles plain text without metadata block", () => {
      const plain = "We are seeking a talented designer to join our product team.";
      expect(cleanDescriptionText(plain)).toBe(plain);
    });

    it("normalizes consecutive blank lines", () => {
      const input = "Paragraph 1\n\n\n\n\nParagraph 2";
      expect(cleanDescriptionText(input)).toBe("Paragraph 1\n\nParagraph 2");
    });
  });

  describe("formatSalaryBadge", () => {
    it("returns Not Disclosed when undisclosed", () => {
      expect(formatSalaryBadge({ isDisclosed: false })).toBe("Not Disclosed");
      expect(formatSalaryBadge({ isDisclosed: true, min: "", max: "" })).toBe("Not Disclosed");
    });

    it("formats Indian LPA ranges correctly", () => {
      expect(formatSalaryBadge({ isDisclosed: true, min: "12", max: "18", period: "YEAR", currency: "INR", type: "RANGE" })).toBe("₹12–18 LPA");
      expect(formatSalaryBadge({ isDisclosed: true, min: "15", period: "YEAR", currency: "INR", type: "FIXED" })).toBe("₹15 LPA");
      expect(formatSalaryBadge({ isDisclosed: true, max: "25", period: "YEAR", currency: "INR", type: "UP_TO" })).toBe("Up to ₹25 LPA");
    });

    it("formats Monthly salaries with comma separators", () => {
      expect(formatSalaryBadge({ isDisclosed: true, min: "25000", max: "40000", period: "MONTH", currency: "INR", type: "RANGE" })).toBe("₹25,000 – ₹40,000 / month");
      expect(formatSalaryBadge({ isDisclosed: true, max: "25000", period: "MONTH", currency: "INR", type: "UP_TO" })).toBe("Up to ₹25,000 / month");
    });

    it("formats USD annual salaries", () => {
      expect(formatSalaryBadge({ isDisclosed: true, min: "80", max: "120", period: "YEAR", currency: "USD", type: "RANGE" })).toBe("$80k–120k / yr");
    });
  });

  describe("calculateNumericSalary", () => {
    it("converts LPA to full integer values", () => {
      const res = calculateNumericSalary({ isDisclosed: true, min: "12", max: "18", period: "YEAR", currency: "INR", type: "RANGE" });
      expect(res.salaryMin).toBe(1200000);
      expect(res.salaryMax).toBe(1800000);
    });

    it("handles decimal LPA values like 12.5", () => {
      const res = calculateNumericSalary({ isDisclosed: true, min: "12.5", max: "18.5", period: "YEAR", currency: "INR", type: "RANGE" });
      expect(res.salaryMin).toBe(1250000);
      expect(res.salaryMax).toBe(1850000);
    });

    it("handles UP_TO and FIXED salary types", () => {
      const upTo = calculateNumericSalary({ isDisclosed: true, max: "20", period: "YEAR", currency: "INR", type: "UP_TO" });
      expect(upTo.salaryMin).toBeUndefined();
      expect(upTo.salaryMax).toBe(2000000);

      const fixed = calculateNumericSalary({ isDisclosed: true, min: "15", period: "YEAR", currency: "INR", type: "FIXED" });
      expect(fixed.salaryMin).toBe(1500000);
      expect(fixed.salaryMax).toBe(1500000);
    });

    it("returns undefined for undisclosed", () => {
      const res = calculateNumericSalary({ isDisclosed: false, min: "12", max: "18" });
      expect(res.salaryMin).toBeUndefined();
      expect(res.salaryMax).toBeUndefined();
    });
  });

  describe("parseSalaryFromJob", () => {
    it("parses undisclosed jobs", () => {
      expect(parseSalaryFromJob({ salary: "Not Disclosed" }).isDisclosed).toBe(false);
      expect(parseSalaryFromJob({ salary: "" }).isDisclosed).toBe(false);
    });

    it("parses structured jobs directly", () => {
      const res = parseSalaryFromJob({
        salaryMin: 1200000,
        salaryMax: 1800000,
        salaryCurrency: "INR",
        salaryPeriod: "YEAR",
        salaryIsDisclosed: true,
      });
      expect(res.isDisclosed).toBe(true);
      expect(res.min).toBe("12");
      expect(res.max).toBe("18");
      expect(res.type).toBe("RANGE");
    });

    it("parses legacy LPA string format", () => {
      const res = parseSalaryFromJob({ salary: "₹18–24 LPA" });
      expect(res.isDisclosed).toBe(true);
      expect(res.min).toBe("18");
      expect(res.max).toBe("24");
      expect(res.period).toBe("YEAR");
    });

    it("parses legacy monthly string format", () => {
      const res = parseSalaryFromJob({ salary: "Up to ₹25k/month" });
      expect(res.isDisclosed).toBe(true);
      expect(res.type).toBe("UP_TO");
      expect(res.max).toBe("25000");
      expect(res.period).toBe("MONTH");
    });
  });
});
