import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const { jobUrl, action } = await request.json(); 
    // action should be either "URL_UPDATED" (new/edited) or "URL_DELETED" (expired)

    if (!jobUrl || !action) {
      return NextResponse.json({ error: "Missing jobUrl or action" }, { status: 400 });
    }

    // 1. Authenticate with Google's Indexing API safely using the config object
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Parses newline characters correctly
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const indexer = google.indexing({
      version: "v3",
      auth: auth,
    });

    // 2. Publish the indexing request notification
    const response = await indexer.urlNotifications.publish({
      requestBody: {
        url: jobUrl,
        type: action,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Google Jobs notified successfully!", 
      data: response.data 
    });
  } catch (error) {
    console.error("Google Indexing API Error:", error);
    
    // Safely extract the error message without using 'any'
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}