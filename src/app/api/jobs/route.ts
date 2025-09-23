import { google, sheets_v4 } from "googleapis";
import { NextRequest } from "next/server";

interface Job {
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
}

interface SheetsValueRange {
  values?: string[][];
}

interface SheetsAppendParams {
  spreadsheetId: string;
  range: string;
  valueInputOption: string;
  requestBody: SheetsValueRange;
}

interface SheetsGetParams {
  spreadsheetId: string;
  range: string;
}

interface SheetsUpdateParams {
  spreadsheetId: string;
  range: string;
  valueInputOption: string;
  requestBody: SheetsValueRange;
}

interface SheetsClearParams {
  spreadsheetId: string;
  range: string;
}

interface SheetsClient {
  spreadsheets: {
    values: {
      get: (params: SheetsGetParams) => Promise<{ data: sheets_v4.Schema$ValueRange }>;
      append: (params: SheetsAppendParams) => Promise<{ data: sheets_v4.Schema$AppendValuesResponse }>;
      update: (params: SheetsUpdateParams) => Promise<{ data: sheets_v4.Schema$UpdateValuesResponse }>;
      clear: (params: SheetsClearParams) => Promise<{ data: sheets_v4.Schema$ClearValuesResponse }>;
    };
  };
}

async function getSheetsClient(readonly = true): Promise<SheetsClient> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

  if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.GOOGLE_SHEET_ID) {
    throw new Error("Google Sheets credentials are missing");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: [
      readonly
        ? "https://www.googleapis.com/auth/spreadsheets.readonly"
        : "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return google.sheets({ version: "v4", auth }) as SheetsClient;
}

// 🔹 Generate incremental ID like JOB1000, JOB1001...
async function generateNumericId(sheets: SheetsClient): Promise<string> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "Sheet1!A:A", // Only ID column
  });

  const rows: string[][] = response.data.values || [];
  let maxId = 999; // ensures first ID will be JOB1000

  rows.forEach((row) => {
    const id = row[0];
    if (id && id.startsWith("JOB")) {
      const num = parseInt(id.replace("JOB", ""), 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
  });

  return `JOB${maxId + 1}`;
}

// ✅ GET → Fetch jobs (sorted by postedDate descending)
export async function GET() {
  try {
    const sheets = await getSheetsClient(true);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "Sheet1!A2:K",
    });

    const rows: string[][] = response.data.values || [];
    const jobs: Job[] = rows.map((row) => ({
      id: row[0] || "",
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

    jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    return new Response(JSON.stringify(jobs), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return new Response("Server error", { status: 500 });
  }
}

// ✅ POST → Add new job (auto incremental ID + timestamp)
export async function POST(req: NextRequest) {
  try {
    const sheets = await getSheetsClient(false);
    const body: Job = await req.json();

    const newRow = [
      await generateNumericId(sheets), // auto increment
      body.title,
      body.company,
      body.location,
      body.experience,
      new Date().toISOString(), // timestamp
      body.salary || "Not Disclosed",
      body.mail || "",
      body.companyLink || "",
      body.apply || "",
      body.description,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "Sheet1!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });

    return new Response(JSON.stringify({ message: "Job added successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Error adding job:", error);
    return new Response("Server error", { status: 500 });
  }
}

// ✅ PUT → Update existing job
export async function PUT(req: NextRequest) {
  try {
    const sheets = await getSheetsClient(false);
    const body: Job = await req.json();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "Sheet1!A2:K",
    });

    const rows: string[][] = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === body.id);

    if (rowIndex === -1) {
      return new Response(JSON.stringify({ message: "Job not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    const sheetRow = rowIndex + 2;

    const updatedRow = [
      body.id,
      body.title,
      body.company,
      body.location,
      body.experience,
      body.postedDate,
      body.salary || "Not Disclosed",
      body.mail || "",
      body.companyLink || "",
      body.apply || "",
      body.description,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: `Sheet1!A${sheetRow}:K${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    });

    return new Response(JSON.stringify({ message: "Job updated successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating job:", message);
    return new Response(`Server error: ${message}`, { status: 500 });
  }
}

// ✅ DELETE → Remove a job
export async function DELETE(req: NextRequest) {
  try {
    const sheets = await getSheetsClient(false);
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get all rows to find the correct row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "A:A", // Only need the ID column
    });

    const rows: string[][] = response.data.values || [];
    
    // Find the row index (0-based including header)
    let rowIndex = -1;
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === id) {
        rowIndex = i; // 0-based index including header
        break;
      }
    }

    if (rowIndex === -1) {
      return new Response(JSON.stringify({ message: "Job not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    console.log(`Deleting row ${rowIndex + 1} with ID: ${id}`);

    // Copy all rows except the one to delete, then overwrite the entire sheet
    const allDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "A:K",
    });

    const allRows: string[][] = allDataResponse.data.values || [];
    
    // Remove the target row
    const updatedRows = [
      ...allRows.slice(0, rowIndex),
      ...allRows.slice(rowIndex + 1)
    ];

    // Clear the entire sheet and rewrite without the deleted row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "A:K",
    });

    if (updatedRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: updatedRows,
        },
      });
    }

    return new Response(JSON.stringify({ message: "Job deleted successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ message: `Server error: ${message}` }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}