import { NextRequest, NextResponse } from "next/server";

// Supports either provider via env vars — both expose an OpenAI-compatible
// /chat/completions endpoint, so the request shape is identical.
const PROVIDERS = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    keyEnv: "OPENROUTER_API_KEY",
    defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    keyEnv: "NVIDIA_API_KEY",
    defaultModel: "meta/llama-3.1-8b-instruct",
  },
} as const;

type ProviderName = keyof typeof PROVIDERS;

const SYSTEM_PROMPT = `You are a market analyst for a prediction market app. Given a YES/NO
prediction market question and its current on-chain YES/NO split, respond with ONLY a JSON
object (no markdown fences, no commentary) matching exactly this shape:
{
  "summary": "2-3 sentence neutral summary of what would need to happen for YES vs NO",
  "bullish": ["short factor 1", "short factor 2"],
  "bearish": ["short factor 1", "short factor 2"],
  "estimatedProbabilityYes": 0-100 integer,
  "confidence": "low" | "medium" | "high"
}
You do not have live news or search access — reason only from general knowledge and the
question itself. Never claim certainty. This is informational only, not financial advice.`;

export async function POST(req: NextRequest) {
  try {
    const { question, category, yesPct, noPct } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const providerName = (process.env.AI_PROVIDER as ProviderName) || "openrouter";
    const provider = PROVIDERS[providerName];
    if (!provider) {
      return NextResponse.json({ error: `Unknown AI_PROVIDER: ${providerName}` }, { status: 500 });
    }

    const apiKey = process.env[provider.keyEnv];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${provider.keyEnv} is not set on the server — add it to .env.local` },
        { status: 500 }
      );
    }

    const model = process.env.AI_MODEL || provider.defaultModel;

    const userPrompt = `Question: ${question}
Category: ${category ?? "Unknown"}
Current on-chain odds: YES ${yesPct}% / NO ${noPct}%`;

    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(providerName === "openrouter"
          ? { "HTTP-Referer": "https://cookiepredict.app", "X-Title": "CookiePredict" }
          : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `AI provider error: ${text.slice(0, 300)}` }, { status: 502 });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output", raw }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Analysis failed" }, { status: 500 });
  }
}
