import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is missing. Emails will not be sent.");
}

export async function POST(req: Request) {
  try {
    const {
      title,
      company,
      location,
      description,
      contactEmail,
      apply, // required
      salary,
      website,
      linkedin,
      contactNumber,
    } = await req.json();

    // ✅ Required field validation
    if (!title || !company || !location || !description || !contactEmail || !apply) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Build email HTML with optional fields
    let html = `
      <h2>${title}</h2>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Apply Link / Email:</strong> ${apply}</p>
      <p><strong>Contact Email:</strong> ${contactEmail}</p>
    `;

    if (salary) html += `<p><strong>Salary:</strong> ${salary}</p>`;
    if (website) html += `<p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>`;
    if (linkedin) html += `<p><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank">${linkedin}</a></p>`;
    if (contactNumber) html += `<p><strong>Contact Number:</strong> ${contactNumber}</p>`;

    // ✅ Send email
    if (resend && process.env.RECEIVER_MAIL) {
      await resend.emails.send({
        from: "Job Portal <onboarding@resend.dev>",
        to: process.env.RECEIVER_MAIL,
        subject: `New Job Posted: ${title}`,
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
