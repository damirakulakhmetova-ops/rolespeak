// Server-only DeepSeek client (OpenAI-compatible Chat Completions API).
// Never import this from a client component: it reads DEEPSEEK_API_KEY.

const BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-flash"; // DeepSeek V4.1 Flash

export interface LLMMessage {
  role: "user" | "assistant";
  text: string;
}

export class LLMError extends Error {
  constructor(
    message: string,
    /** 503 = not configured, 429 = rate limited, 402 = out of credit, 502 = upstream error */
    public status = 502,
  ) {
    super(message);
  }
}

interface CallOptions {
  system: string;
  messages: LLMMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** "off" disables thinking (fastest, for the patient); "low" allows brief reasoning. */
  reasoning?: "off" | "low";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Back-off for rate limits (429) and overloaded/temporary errors (500, 503).
const RETRY_DELAYS_MS = [1000, 3000];
const RETRYABLE = new Set([429, 500, 502, 503]);

export async function callLLM(opts: CallOptions): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) throw new LLMError("DEEPSEEK_API_KEY is not set", 503);
  const model = process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: opts.system },
      ...opts.messages.map((m) => ({ role: m.role, content: m.text })),
    ],
    max_tokens: opts.maxTokens ?? 1024,
    stream: false,
  };
  if (opts.reasoning === "low") {
    body.reasoning_effort = "low";
  } else {
    body.thinking = { type: "disabled" };
    body.temperature = opts.temperature ?? 0.7;
  }
  if (opts.json) body.response_format = { type: "json_object" };

  let res: Response | null = null;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (e) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      throw new LLMError(`DeepSeek request failed: ${e instanceof Error ? e.message : e}`, 502);
    }
    if (RETRYABLE.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
      console.warn(`[llm] DeepSeek ${res.status}, retrying in ${RETRY_DELAYS_MS[attempt]}ms`);
      await res.body?.cancel();
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }
    break;
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const status = res.status === 429 ? 429 : res.status === 402 ? 402 : 502;
    throw new LLMError(`DeepSeek ${res.status}: ${t.slice(0, 300)}`, status);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new LLMError("DeepSeek returned an empty response", 502);
  return text;
}

/** User-facing message for an LLM failure. */
export function llmErrorMessage(e: unknown, who: "patient" | "assessor"): { status: number; error: string } {
  const status = e instanceof LLMError ? e.status : 500;
  if (status === 503) return { status, error: "AI is not configured on the server." };
  if (status === 429)
    return { status, error: `The AI ${who} is busy right now. Please wait a few seconds and try again.` };
  if (status === 402) return { status: 503, error: "AI is temporarily unavailable. Please try the demo or come back later." };
  return {
    status: 502,
    error:
      who === "patient"
        ? "The patient could not reply. Please try again."
        : "We couldn't score this roleplay right now. Please try again in a moment.",
  };
}
