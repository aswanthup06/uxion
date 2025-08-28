import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { title, company, location, description, contactEmail } = await req.json();

    if (!title || !company || !location || !description || !contactEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Job Portal <onboarding@resend.dev>", // default sender, or your verified domain
      to: process.env.RECEIVER_MAIL!,
      subject: `New Job Posted: ${title}`,
      html: `
        <h2>${title}</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Contact Email:</strong> ${contactEmail}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending job post email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
