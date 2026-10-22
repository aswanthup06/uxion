// import { google } from "googleapis";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// interface RouteContext {
//   params: Promise<{ id: string }>;
// }

// export async function GET(
//   _request: Request,
//   { params }: RouteContext
// ) {
//   try {
//     const { id } = await params;

//     if (!id || id === "undefined" || id === "null") {
//       return NextResponse.json(
//         { error: "Invalid job ID" },
//         { status: 400 }
//       );
//     }

//     const privateKey = process.env.GOOGLE_PRIVATE_KEY
//       ?.replace(/\\n/g, "\n");

//     const email = process.env.GOOGLE_CLIENT_EMAIL;
//     const spreadsheetId = process.env.GOOGLE_SHEET_ID;

//     if (!privateKey || !email || !spreadsheetId) {
//       console.error("Google Sheets credentials are missing");

//       return NextResponse.json(
//         { error: "Server configuration error" },
//         { status: 500 }
//       );
//     }

//     const auth = new google.auth.GoogleAuth({
//       credentials: {
//         client_email: email,
//         private_key: privateKey,
//       },
//       scopes: [
//         "https://www.googleapis.com/auth/spreadsheets.readonly",
//       ],
//     });

//     const sheets = google.sheets({
//       version: "v4",
//       auth,
//     });

//     // Read only the ID column first.
//     const idsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Sheet1!A2:A",
//     });

//     const ids = idsResponse.data.values ?? [];

//     const index = ids.findIndex(
//       (row) => String(row[0] ?? "").trim() === id.trim()
//     );

//     if (index === -1) {
//       return NextResponse.json(
//         { error: "Job not found", id },
//         { status: 404 }
//       );
//     }

//     // Sheet row 1 is the header; data starts at row 2.
//     const sheetRow = index + 2;

//     const jobResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `Sheet1!A${sheetRow}:K${sheetRow}`,
//     });

//     const row = jobResponse.data.values?.[0];

//     if (!row || String(row[0] ?? "").trim() !== id.trim()) {
//       return NextResponse.json(
//         { error: "Job not found", id },
//         { status: 404 }
//       );
//     }

//     const job = {
//       id: row[0] ?? "",
//       title: row[1] ?? "",
//       company: row[2] ?? "",
//       location: row[3] ?? "",
//       experience: row[4] ?? "",
//       postedDate: row[5] ?? "",
//       salary: row[6] ?? "",
//       mail: row[7] ?? "",
//       companyLink: row[8] ?? "",
//       apply: row[9] ?? "",
//       description: row[10] ?? "",
//     };

//     return NextResponse.json(job);
//   } catch (error) {
//     console.error("GET /api/jobs/[id] failed:", error);

//     return NextResponse.json(
//       { error: "Failed to fetch job" },
//       { status: 500 }
//     );
//   }
// }