import { describe, it, expect } from "vitest";
import {
  formatExperienceLabel,
  parseExperienceFromJob,
  dateForInput,
  cleanDescriptionText,
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
});
