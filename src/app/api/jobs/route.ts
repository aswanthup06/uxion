// src/app/api/jobs/route.ts
import { google } from "googleapis";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  postedDate: string;
  salary: string;
  mail: string;
  companyLink: string;
  apply: string;
  description: string;
};

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

    if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Google Sheets credentials are missing");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2:L",
    });

    const rows: string[][] = response.data.values || [];

    const jobs: Job[] = rows.map((row, i) => ({
      id: row[0] || `JOB${1000 + i}`,
      title: row[1] || "",
      company: row[2] || "",
      location: row[3] || "",
      experience: row[4] || "",
      postedDate: row[5] || "",
      salary: row[6] || "",
      mail: row[7] || "",
      companyLink: row[8] || "",
      apply: row[9] || "",
      description: row[10] || "",
    }));

    return new Response(JSON.stringify(jobs), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching Google Sheets data:", message);
    return new Response(`Server error: ${message}`, { status: 500 });
  }
}
