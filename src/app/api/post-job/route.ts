import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// Initialize Resend
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is missing. Emails will not be sent.");
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const limit = checkRateLimit("post-job-email", clientIp, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Too many submissions. Please wait ${Math.ceil(
            limit.retryAfterSec / 60
          )} minutes before submitting again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
    const location = typeof body.location === "string" ? body.location.trim().slice(0, 200) : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 25000) : "";
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim().slice(0, 120) : "";
    const salary = typeof body.salary === "string" ? body.salary.trim().slice(0, 80) : "";
    const website = sanitizeUrl(typeof body.website === "string" ? body.website.slice(0, 300) : "");
    const linkedin = sanitizeUrl(typeof body.linkedin === "string" ? body.linkedin.slice(0, 300) : "");
    const contactNumber = typeof body.contactNumber === "string" ? body.contactNumber.trim().slice(0, 50) : "";

    // Required field validation
    if (!title || !company || !location || !description || !contactEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build email HTML with strictly escaped fields to prevent HTML injection
    let html = `
      <h2>${escapeHtml(title)}</h2>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p><strong>Location:</strong> ${escapeHtml(location)}</p>
      <p><strong>Description:</strong> ${escapeHtml(description).replace(/\n/g, "<br/>")}</p>
      <p><strong>Application Email:</strong> ${escapeHtml(contactEmail)}</p>
    `;

    if (salary) html += `<p><strong>Salary:</strong> ${escapeHtml(salary)}</p>`;
    if (website) {
      const safeWeb = escapeHtml(website);
      html += `<p><strong>Website:</strong> <a href="${safeWeb}" target="_blank" rel="noopener noreferrer">${safeWeb}</a></p>`;
    }
    if (linkedin) {
      const safeLi = escapeHtml(linkedin);
      html += `<p><strong>LinkedIn:</strong> <a href="${safeLi}" target="_blank" rel="noopener noreferrer">${safeLi}</a></p>`;
    }
    if (contactNumber) html += `<p><strong>Contact Number:</strong> ${escapeHtml(contactNumber)}</p>`;

    // Send email
    if (resend && process.env.RECEIVER_MAIL) {
      await resend.emails.send({
        from: "Job Portal <onboarding@resend.dev>",
        to: process.env.RECEIVER_MAIL,
        subject: `New Job Posted: ${escapeHtml(title)}`,
        html,
      });
    } else {
      console.warn("Email not sent. Resend client or RECEIVER_MAIL is missing.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending job post email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
