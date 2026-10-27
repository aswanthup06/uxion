"use client";

import { useParams } from "next/navigation";
import JobFormWizard from "@/app/admin/comp/JobFormWizard";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  return <JobFormWizard mode="edit" jobId={jobId} />;
}
