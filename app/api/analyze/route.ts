import { NextRequest, NextResponse } from "next/server";

// Supports either provider via env vars. Both expose an OpenAI-compatible
// /chat/completions endpoint, so the request shape is identical.
const PROVIDERS = {
  openrouter: {
    chatUrl: "https://openrouter.ai/api/v1/chat/completions",
    modelsUrl: "https://openrouter.ai/api/v1/models",
    keyEnv: "OPENROUTER_API_KEY",
  },
  nvidia: {
    chatUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    modelsUrl: "https://integrate.api.nvidia.com/v1/models",
    keyEnv: "NVIDIA_API_KEY",
  },
} as const;

type ProviderName = keyof typeof PROVIDERS;

// Resolves which model to use: an explicit AI_MODEL env var always wins;
// otherwise ask the provider's own /models endpoint what's currently live,
// rather than trusting a hardcoded model id that can go stale when a
// provider retires a model (as happened here).
async function resolveModel(provider: (typeof PROVIDERS)[ProviderName], apiKey: string): Promise<string> {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;

  const res = await fetch(provider.modelsUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Could not list available models (${res.status}). Set AI_MODEL explicitly in .env.local instead.`);
  }
  const data = await res.json();
  const first = data?.data?.[0]?.id;
  if (!first) {
    throw new Error("Provider returned no models. Set AI_MODEL explicitly in .env.local instead.");
  }
  return first;
}

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
You do not have live news or search access. Reason only from general knowledge and the
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
        { error: `${provider.keyEnv} is not set on the server. Add it to .env.local` },
        { status: 500 }
      );
    }

    const model = await resolveModel(provider, apiKey);

    const userPrompt = `Question: ${question}
Category: ${category ?? "Unknown"}
Current on-chain odds: YES ${yesPct}% / NO ${noPct}%`;

    const res = await fetch(provider.chatUrl, {
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
