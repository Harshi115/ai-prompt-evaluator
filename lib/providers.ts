export type ProviderResult = {
  provider: "gemini" | "groq";
  model: string;
  text: string;
  latencyMs: number;
  wordCount: number;
  charCount: number;
  error?: string;
};

function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export async function callGemini(prompt: string): Promise<ProviderResult> {
  const started = performance.now();
  const model = "gemini-flash-latest";
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing in environment");

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    const latencyMs = Math.round(performance.now() - started);

    return {
      provider: "gemini",
      model,
      text,
      latencyMs,
      wordCount: countWords(text),
      charCount: text.length,
    };
  } catch (err) {
    return {
      provider: "gemini",
      model,
      text: "",
      latencyMs: Math.round(performance.now() - started),
      wordCount: 0,
      charCount: 0,
      error: err instanceof Error ? err.message : "Unknown Gemini error",
    };
  }
}

export async function callGroq(prompt: string): Promise<ProviderResult> {
  const started = performance.now();
  const model = "llama-3.3-70b-versatile";
  try {
    const Groq = (await import("groq-sdk")).default;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY missing in environment");

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const latencyMs = Math.round(performance.now() - started);

    return {
      provider: "groq",
      model,
      text,
      latencyMs,
      wordCount: countWords(text),
      charCount: text.length,
    };
  } catch (err) {
    return {
      provider: "groq",
      model,
      text: "",
      latencyMs: Math.round(performance.now() - started),
      wordCount: 0,
      charCount: 0,
      error: err instanceof Error ? err.message : "Unknown Groq error",
    };
  }
}
