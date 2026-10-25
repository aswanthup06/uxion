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

    if (!body.title?.trim() || !body.company?.trim() || !body.location?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields (title, company, location, description)" },
        { status: 400 }
      );
    }

    const newJob = await createJob({
      ...body,
      title: body.title.trim(),
      company: body.company.trim(),
      location: body.location.trim(),
      description: body.description.trim(),
      salary: body.salary?.trim() || "Not Disclosed",
      mail: body.mail?.trim() || "",
      companyLink: body.companyLink?.trim() || "",
      apply: "",
      experience: body.experience?.trim() || "Fresher",
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