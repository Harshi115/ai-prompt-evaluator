"use client";

import { useState } from "react";

type ProviderResult = {
  provider: "gemini" | "groq";
  model: string;
  text: string;
  latencyMs: number;
  wordCount: number;
  charCount: number;
  error?: string;
};

type CompareResponse = {
  prompt: string;
  gemini: ProviderResult;
  groq: ProviderResult;
  ranAt: string;
};

const SAMPLE_PROMPTS = [
  "Explain quantum entanglement to a 10 year old.",
  "Write a haiku about monsoon in Jaipur.",
  "Give 3 tips for a first-time home buyer in India.",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runComparison() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const winner =
    result && !result.gemini.error && !result.groq.error
      ? result.gemini.latencyMs <= result.groq.latencyMs
        ? "gemini"
        : "groq"
      : null;

  return (
    <main className="min-h-screen px-6 py-14 md:px-12 lg:px-20">
      {/* Header */}
      <header className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-white/40">
          LIVE MODEL BENCHMARK
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
          One prompt.
          <br />
          <span className="text-gemini">Gemini</span>
          <span className="text-white/30"> vs </span>
          <span className="text-groq">Llama 3.3</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-white/50">
          Send the same prompt to both models at the same time. Compare
          speed, length, and the actual answer — no guessing which one is
          faster or better for your use case.
        </p>
      </header>

      {/* Input */}
      <section className="mx-auto mt-10 max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a prompt for both models to answer..."
            rows={3}
            maxLength={4000}
            className="w-full resize-none bg-transparent text-sm text-white/90 placeholder-white/30 outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/50 transition hover:border-white/30 hover:text-white/80"
                >
                  {p.length > 32 ? p.slice(0, 32) + "…" : p}
                </button>
              ))}
            </div>
            <button
              onClick={runComparison}
              disabled={loading || !prompt.trim()}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold tracking-wide text-ink transition disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? "Running…" : "Run comparison"}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-center text-xs text-groq">{error}</p>
        )}
      </section>

      {/* Loading state */}
      {loading && (
        <section className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {(["gemini", "groq"] as const).map((p) => (
            <div
              key={p}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <p
                className={`text-xs font-semibold tracking-wide ${
                  p === "gemini" ? "text-gemini" : "text-groq"
                }`}
              >
                {p === "gemini" ? "GEMINI 1.5 FLASH" : "LLAMA 3.3 70B (GROQ)"}
              </p>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`racing-bar h-full ${
                    p === "gemini" ? "bg-gemini" : "bg-groq"
                  }`}
                />
              </div>
              <p className="mt-3 text-[11px] text-white/30">waiting on response…</p>
            </div>
          ))}
        </section>
      )}

      {/* Results */}
      {result && !loading && (
        <section className="mx-auto mt-10 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-2">
            {([result.gemini, result.groq] as const).map((r) => {
              const isGemini = r.provider === "gemini";
              const isWinner = winner === r.provider;
              return (
                <div
                  key={r.provider}
                  className={`relative rounded-2xl border p-5 ${
                    isWinner
                      ? isGemini
                        ? "border-gemini/50 bg-gemini/[0.06]"
                        : "border-groq/50 bg-groq/[0.06]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-semibold tracking-wide ${
                        isGemini ? "text-gemini" : "text-groq"
                      }`}
                    >
                      {isGemini ? "GEMINI 1.5 FLASH" : "LLAMA 3.3 70B (GROQ)"}
                    </p>
                    {isWinner && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                        FASTER
                      </span>
                    )}
                  </div>

                  {r.error ? (
                    <p className="mt-4 text-xs text-white/40">
                      Could not get a response: {r.error}
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 flex gap-6">
                        <div>
                          <p className="font-display text-2xl font-semibold">
                            {r.latencyMs}
                            <span className="text-sm text-white/40">ms</span>
                          </p>
                          <p className="text-[10px] tracking-wide text-white/30">
                            LATENCY
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-2xl font-semibold">
                            {r.wordCount}
                          </p>
                          <p className="text-[10px] tracking-wide text-white/30">
                            WORDS
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-2xl font-semibold">
                            {r.charCount}
                          </p>
                          <p className="text-[10px] tracking-wide text-white/30">
                            CHARS
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 text-[13px] leading-relaxed text-white/80">
                        {r.text || "(empty response)"}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {!result.gemini.error && !result.groq.error && (
            <p className="mt-4 text-center text-[11px] text-white/30">
              {winner === "gemini" ? "Gemini" : "Llama 3.3"} responded{" "}
              {Math.abs(result.gemini.latencyMs - result.groq.latencyMs)}ms
              faster on this prompt.
            </p>
          )}
        </section>
      )}

      <footer className="mx-auto mt-20 max-w-3xl text-center text-[11px] text-white/20">
        Built with Next.js 15 · Gemini API · Groq (Llama 3.3) · not affiliated
        with Google or Meta
      </footer>
    </main>
  );
}
