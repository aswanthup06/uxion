import type { Metadata } from "next";
import ResumeBuilderWorkspace from "./components/ResumeBuilderWorkspace";

export const metadata: Metadata = {
  title: "ATS Resume Builder | Zenoway",
  description:
    "Build a clean, single-column, ATS-friendly resume with live A4 preview, transparent ATS readiness checks, optional Gemini writing assistance, and selectable PDF export.",
};

export default function ResumeBuilderPage() {
  return <ResumeBuilderWorkspace />;
}

