// src/app/api/jobs/route.ts
// Supabase-backed REST API route for Job listings.
// Replaces Google Sheets API entirely with PostgreSQL queries.

import { NextRequest, NextResponse } from "next/server";
import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
} from "@/lib/supabase/jobs";
import type { Job } from "@/app/types/job";

/**
 * Helper to verify that the request comes from an authenticated admin session
 * via the admin-auth HTTP-only cookie or valid authorization header.
 */
function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminCookie = req.cookies.get("admin-auth");
  if (adminCookie?.value === "true") return true;

  // Optional: Allow service key or admin key via Authorization header for machine-to-machine calls
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token && (token === process.env.ADMIN_KEY || token === process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      return true;
    }
  }

  return false;
}

// ✅ GET → Fetch all published jobs (sorted by postedDate descending, with optional page & limit pagination)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : undefined;

    const jobs = await getAllJobs(
      page && limit ? { page, limit } : undefined
    );

    return NextResponse.json(jobs, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error fetching jobs from Supabase:", error);
    return NextResponse.json(
      { error: "Server error retrieving jobs" },
      { status: 500 }
    );
  }
}

// ✅ POST → Add new job (auto-generated ID + timestamp via Supabase sequence)
export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }

    const body: Partial<Job> = await req.json();

    if (!body.title?.trim() || !body.company?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields (title, company, description)" },
        { status: 400 }
      );
    }

    const workMode = (body.workMode || "Onsite").trim();
    const isRemote = workMode.toLowerCase() === "remote";
    const isHybrid = workMode.toLowerCase() === "hybrid";

    // Validate location for on-site/hybrid
    if (!isRemote && !body.location?.trim() && !body.primaryCity?.trim() && !body.primaryState?.trim()) {
      return NextResponse.json(
        { error: "Physical work location (City or State) is required for on-site and hybrid jobs" },
        { status: 400 }
      );
    }

    // Validate remote eligibility
    if (isRemote && body.remoteEligibilityType === "COUNTRIES") {
      if (!body.remoteEligibilityCountries || body.remoteEligibilityCountries.length === 0) {
        return NextResponse.json(
          { error: "Please select at least one eligible country for country-restricted remote jobs" },
          { status: 400 }
        );
      }
    }

    // Canonical location string fallback
    let canonicalLocation = body.location?.trim() || "";
    if (!canonicalLocation) {
      if (isRemote) {
        canonicalLocation = body.remoteEligibilityType === "WORLDWIDE" ? "Remote · Worldwide" : "Remote";
      } else if (body.primaryCity && body.primaryState) {
        canonicalLocation = `${body.primaryCity}, ${body.primaryState}`;
      } else if (body.primaryState) {
        canonicalLocation = `${body.primaryState}, ${body.primaryCountry || "India"}`;
      } else {
        canonicalLocation = "Job location";
      }
    }

    const newJob = await createJob({
      ...body,
      title: body.title.trim(),
      company: body.company.trim(),
      location: canonicalLocation,
      description: body.description.trim(),
      salary: body.salary?.trim() || "Not Disclosed",
      mail: body.mail?.trim() || "",
      companyLink: body.companyLink?.trim() || "",
      apply: "",
      experience: body.experience?.trim() || "Fresher",
      workMode: isRemote ? "Remote" : isHybrid ? "Hybrid" : "Onsite",
      primaryCity: body.primaryCity?.trim() || undefined,
      primaryState: body.primaryState?.trim() || undefined,
      primaryStateCode: body.primaryStateCode?.trim() || undefined,
      primaryCountry: body.primaryCountry?.trim() || "India",
      primaryCountryCode: body.primaryCountryCode?.trim() || "IN",
      locality: body.locality?.trim() || undefined,
      postalCode: body.postalCode?.trim() || undefined,
      isMultiLocation: Boolean(body.isMultiLocation),
      remoteEligibilityType: body.remoteEligibilityType || (isRemote ? "UNSPECIFIED" : undefined),
      remoteEligibilityCountries: body.remoteEligibilityCountries || undefined,
      remoteEligibilityRegions: body.remoteEligibilityRegions || undefined,
      remoteEligibilityCities: body.remoteEligibilityCities || undefined,
      hqLocationId: body.hqLocationId || undefined,
      rawLocation: body.rawLocation || canonicalLocation,
    });

    return NextResponse.json(
      { message: "Job added successfully", job: newJob },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error adding job to Supabase:", message);
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}

// ✅ PUT → Update existing job
export async function PUT(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }

    const body: Partial<Job> = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Job ID is required for updating" },
        { status: 400 }
      );
    }

    const updatedJob = await updateJob(body.id, {
      ...body,
      title: body.title?.trim(),
      company: body.company?.trim(),
      location: body.location?.trim(),
      description: body.description?.trim(),
      salary: body.salary?.trim(),
      mail: body.mail?.trim(),
      companyLink: body.companyLink?.trim(),
      apply: "",
      experience: body.experience?.trim(),
      primaryCity: body.primaryCity?.trim(),
      primaryState: body.primaryState?.trim(),
      primaryStateCode: body.primaryStateCode?.trim(),
      primaryCountry: body.primaryCountry?.trim(),
      primaryCountryCode: body.primaryCountryCode?.trim(),
      locality: body.locality?.trim(),
      postalCode: body.postalCode?.trim(),
      isMultiLocation: body.isMultiLocation,
      remoteEligibilityType: body.remoteEligibilityType,
      remoteEligibilityCountries: body.remoteEligibilityCountries,
      remoteEligibilityRegions: body.remoteEligibilityRegions,
      remoteEligibilityCities: body.remoteEligibilityCities,
      hqLocationId: body.hqLocationId,
      workModeNotes: body.workModeNotes,
      requiresReview: body.requiresReview,
    });

    return NextResponse.json(
      { message: "Job updated successfully", job: updatedJob },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating job in Supabase:", message);
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}

// ✅ DELETE → Remove a job
export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Job ID is required" },
        { status: 400 }
      );
    }

    await deleteJob(id);

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting job from Supabase:", message);
    return NextResponse.json(
      { message: `Server error: ${message}` },
      { status: 500 }
    );
  }
}