import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { job } = await req.json();

    const prompt = `
Extract the following job posting into JSON.

Return ONLY valid JSON.

{
  "title": "",
  "company": "",
  "location": "",
  "employmentType": "",
  "experience": "",
  "salary": "",
  "description": "",
  "skills": [],
  "requirements": [],
  "responsibilities": [],
  "applyLink": ""
}

Job:

${job}
`;

const response = await ai.models.generateContent({
  model: "gemini-flash-latest",
  contents: prompt,
});

    const text = response.text ?? "";

    return NextResponse.json({
      success: true,
      data: text,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Generation failed",
      },
      { status: 500 }
    );
  }
}