// Server-only Gemini client. Never import this from a client component:
// it reads GEMINI_API_KEY from the server environment.

const DEFAULT_MODEL = "gemini-3.6-flash";

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

interface CallOptions {
  system: string;
  messages: GeminiMessage[];
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  /** "minimal" for snappy chat, "low" for reasoning tasks. */
  thinkingLevel?: "minimal" | "low" | "medium" | "high";
}

export function geminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Back-off for short rate limits (429) and "model overloaded" (503) responses.
const RETRY_DELAYS_MS = [1500, 4000];
const DEFAULT_FALLBACK_MODEL = "gemini-3.5-flash-lite";

/** A daily quota won't recover in seconds, so don't wait for it. */
function isDailyQuota(body: string): boolean {
  return /per ?day|PerDay/i.test(body);
}

type PostResult = { res: Response; dailyQuota: boolean };

async function post(model: string, body: unknown): Promise<PostResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY is not set", 503);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
    if (res.status !== 429 && res.status !== 503) return { res, dailyQuota: false };

    const text = await res.text();
    const daily = res.status === 429 && isDailyQuota(text);
    const replay = new Response(text, { status: res.status });
    if (daily || attempt >= RETRY_DELAYS_MS.length) return { res: replay, dailyQuota: daily };
    console.warn(`[gemini] ${model} ${res.status}, retrying in ${RETRY_DELAYS_MS[attempt]}ms`);
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
}

/** Calls one model, retrying once without thinkingConfig if the model rejects it. */
async function postWithThinkingFallback(model: string, body: { generationConfig: Record<string, unknown> }) {
  let result = await post(model, body);
  if (result.res.status === 400) {
    const errText = await result.res.text();
    if (/thinking/i.test(errText)) {
      const { thinkingConfig: _drop, ...rest } = body.generationConfig;
      void _drop;
      result = await post(model, { ...body, generationConfig: rest });
    } else {
      throw new GeminiError(`Gemini 400 (${model}): ${errText.slice(0, 300)}`, 502);
    }
  }
  return result;
}

export async function callGemini(opts: CallOptions): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  // Merge consecutive turns from the same role (Gemini expects alternation).
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const m of opts.messages) {
    const last = contents[contents.length - 1];
    if (last && last.role === m.role) last.parts[0].text += `\n${m.text}`;
    else contents.push({ role: m.role, parts: [{ text: m.text }] });
  }

  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.7,
    maxOutputTokens: opts.maxOutputTokens ?? 1024,
    // Little thinking keeps replies fast. Unsupported levels fall back below.
    thinkingConfig: { thinkingLevel: opts.thinkingLevel ?? "low" },
  };
  if (opts.json) generationConfig.responseMimeType = "application/json";

  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents,
    generationConfig,
  };

  let { res, dailyQuota } = await postWithThinkingFallback(model, body);

  // Out of quota (or still overloaded) on the main model: try the fallback model,
  // which has its own separate quota.
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_MODEL;
  if ((res.status === 429 || res.status === 503) && fallback && fallback !== model) {
    console.warn(`[gemini] ${model} ${res.status}${dailyQuota ? " (daily quota)" : ""}, using ${fallback}`);
    ({ res, dailyQuota } = await postWithThinkingFallback(fallback, body));
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new GeminiError(`Gemini ${res.status}: ${t.slice(0, 300)}`, res.status === 429 ? 429 : 502);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
  if (!text) throw new GeminiError("Gemini returned an empty response", 502);
  return text;
}
