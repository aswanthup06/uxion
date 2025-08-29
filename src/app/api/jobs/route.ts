import { google } from "googleapis";

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

    if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Google Sheets credentials are missing");
    }

    // Create service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch rows from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A2:L",
    });

    const rows = response.data.values || [];

    const jobs = rows.map((row, i) => ({
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
  } catch (error: any) {
    console.error("Error fetching Google Sheets data:", error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
}