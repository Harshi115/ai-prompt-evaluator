# Model Bench — Gemini vs Groq/Llama 3.3

A side-by-side LLM evaluator: send one prompt, get responses from **Gemini 1.5 Flash** and **Llama 3.3 70B (via Groq)** in parallel, and compare latency, word count, and the actual output.

Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS.

## Why this project

Most "AI projects" are a thin wrapper around a single LLM API. This one is different — it treats the LLM as a variable, not a given, which is closer to how real AI-engineering decisions get made in production (which model do we actually use, and why?).

## Features

- Runs Gemini and Groq calls **in parallel** (`Promise.all`), not sequentially
- Measures real latency per provider, not just "it responded"
- Shows word count / character count side by side
- Handles partial failure gracefully (if one API key is missing or a call fails, the other side still renders)
- Clean split-screen UI with distinct visual identity per model

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your keys to `.env.local`:
- `GEMINI_API_KEY` — from https://aistudio.google.com/apikey
- `GROQ_API_KEY` — from https://console.groq.com/keys

Run locally:

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a new GitHub repo
2. Import it in Vercel
3. Add `GEMINI_API_KEY` and `GROQ_API_KEY` as Environment Variables in the Vercel project settings
4. Deploy

## Project structure

```
app/
  api/compare/route.ts   → API route that calls both providers in parallel
  page.tsx                → UI: prompt input + side-by-side results
  layout.tsx, globals.css
lib/
  providers.ts             → Gemini + Groq API wrappers, latency + word count logic
```

## Possible extensions (good "v2" talking points in interviews)

- Add a third provider (e.g. Claude via Anthropic API) for a 3-way comparison
- Score outputs with an LLM-as-judge for relevance/quality, not just speed
- Save comparison history to a database (Postgres/Supabase) and show trends over time
- Add streaming responses instead of waiting for the full completion

## Resume bullet points (pick 1-2)

- Built a full-stack LLM evaluation tool (Next.js 15, TypeScript) that runs concurrent API calls to Gemini and Groq/Llama 3.3, benchmarking latency and output length in real time
- Designed an API layer with graceful degradation — partial provider failures don't break the UI, using isolated error handling per external call
- Implemented a responsive comparison UI in Tailwind CSS with distinct visual states for loading, success, and per-provider error handling
