import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
  console.error("❌ Missing environment variables!");
  process.exit(1);
}

const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function test() {
  try {
    // 1️⃣ Fetch all rows
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A2:K",
    });
    const rows = res.data.values || [];
    console.log("✅ Current rows:", rows);

    // 2️⃣ Add a new row
    const newJob = [
      `JOB${Date.now()}`,
      "Test Title",
      "Test Company",
      "Test Location",
      "1-2 yrs",
      new Date().toISOString().split("T")[0],
      "50000",
      "test@mail.com",
      "https://company.com",
      "https://apply.com",
      "Test description",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newJob] },
    });
    console.log("✅ Added a new row");

    // 3️⃣ Update last row
    const lastRowIndex = rows.length + 2; // header + 1-indexed
    const updatedJob = [...newJob];
    updatedJob[1] = "Updated Title";

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${lastRowIndex}:K${lastRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedJob] },
    });
    console.log("✅ Updated last row");

    // 4️⃣ Delete last row
    // First, get sheetId
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetId = meta.data.sheets?.[0]?.properties?.sheetId;
    if (!sheetId) throw new Error("Sheet not found");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: "ROWS", startIndex: lastRowIndex - 1, endIndex: lastRowIndex },
            },
          },
        ],
      },
    });
    console.log("✅ Deleted last row");

  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
}

test();
