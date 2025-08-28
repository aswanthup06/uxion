import { NextResponse } from "next/server";
import { Resend } from "resend";

// Check if API key exists before initializing
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is missing. Emails will not be sent.");
}

export async function POST(req: Request) {
  try {
    const { title, company, location, description, contactEmail } = await req.json();

    // Validate required fields
    if (!title || !company || !location || !description || !contactEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only send email if Resend client is initialized
    if (resend && process.env.RECEIVER_MAIL) {
      await resend.emails.send({
        from: "Job Portal <onboarding@resend.dev>",
        to: process.env.RECEIVER_MAIL,
        subject: `New Job Posted: ${title}`,
        html: `
          <h2>${title}</h2>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Contact Email:</strong> ${contactEmail}</p>
        `,
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
