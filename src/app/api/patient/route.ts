import { callGemini, GeminiError, type GeminiMessage } from "@/lib/server/gemini";
import { PATIENT_PROMPTS, PATIENT_STYLE_RULES } from "@/lib/server/patientPrompts";
import { readBody } from "@/lib/server/validate";

// Gemini calls (with retries) can take a while; allow up to 60s on Vercel.
export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = await readBody(req);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  const { scenarioId, turns } = parsed;

  if (!turns.length || turns[turns.length - 1].speaker !== "nurse") {
    return Response.json({ error: "The nurse must speak last" }, { status: 400 });
  }

  // Gemini conversations start with a user turn, so the nurse "enters" first.
  const messages: GeminiMessage[] = [
    { role: "user", text: "(The nurse comes in to see you.)" },
    ...turns.map<GeminiMessage>((t) => ({
      role: t.speaker === "nurse" ? "user" : "model",
      text: t.text,
    })),
  ];

  try {
    const raw = await callGemini({
      system: `${PATIENT_PROMPTS[scenarioId]}\n\n${PATIENT_STYLE_RULES}`,
      messages,
      temperature: 0.8,
      maxOutputTokens: 800,
      thinkingLevel: "minimal",
    });
    const reply = raw
      .replace(/\*[^*]*\*/g, "") // drop *stage directions*
      .replace(/^\s*(patient|alex|sam)[^:]{0,20}:\s*/i, "")
      .replace(/^["“]|["”]$/g, "")
      .trim();
    return Response.json({ reply: reply || raw });
  } catch (e) {
    const status = e instanceof GeminiError ? e.status : 500;
    console.error("[api/patient]", e instanceof Error ? e.message : e);
    return Response.json(
      {
        error:
          status === 503
            ? "AI is not configured on the server."
            : status === 429
              ? "The AI patient has reached today's usage limit. Please try again later."
              : "The patient could not reply. Please try again.",
      },
      { status },
    );
  }
}
