import { NextRequest, NextResponse } from "next/server";
import { callGemini, callGroq } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt cannot be empty." },
        { status: 400 }
      );
    }
    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: "Prompt is too long (max 4000 characters)." },
        { status: 400 }
      );
    }

    const [gemini, groq] = await Promise.all([
      callGemini(prompt),
      callGroq(prompt),
    ]);

    return NextResponse.json({ prompt, gemini, groq, ranAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong while running the comparison." },
      { status: 500 }
    );
  }
}
