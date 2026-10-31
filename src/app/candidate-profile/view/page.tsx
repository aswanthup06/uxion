"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      router.replace(`/candidates/${id}`);
    } else {
      router.replace("/profile");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface-page">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  );
}

export default function CandidateProfileViewRedirect() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-page" />}>
      <RedirectHandler />
    </Suspense>
  );
}
