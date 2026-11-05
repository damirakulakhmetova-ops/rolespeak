import { callLLM, llmErrorMessage, type LLMMessage } from "@/lib/server/llm";
import { PATIENT_PROMPTS, PATIENT_STYLE_RULES } from "@/lib/server/patientPrompts";
import { readBody } from "@/lib/server/validate";

// LLM calls (with retries) can take a while; allow up to 60s on Vercel.
export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = await readBody(req);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  const { scenarioId, turns } = parsed;

  if (!turns.length || turns[turns.length - 1].speaker !== "nurse") {
    return Response.json({ error: "The nurse must speak last" }, { status: 400 });
  }

  // The nurse "enters" first so the conversation starts with a user turn.
  const messages: LLMMessage[] = [
    { role: "user", text: "(The nurse comes in to see you.)" },
    ...turns.map<LLMMessage>((t) => ({
      role: t.speaker === "nurse" ? "user" : "assistant",
      text: t.text,
    })),
  ];

  try {
    const raw = await callLLM({
      system: `${PATIENT_PROMPTS[scenarioId]}\n\n${PATIENT_STYLE_RULES}`,
      messages,
      temperature: 0.8,
      maxTokens: 300,
      reasoning: "off",
    });
    const reply = raw
      .replace(/\*[^*]*\*/g, "") // drop *stage directions*
      .replace(/^\s*(patient|alex|sam)[^:]{0,20}:\s*/i, "")
      .replace(/^["“]|["”]$/g, "")
      .trim();
    return Response.json({ reply: reply || raw });
  } catch (e) {
    console.error("[api/patient]", e instanceof Error ? e.message : e);
    const { status, error } = llmErrorMessage(e, "patient");
    return Response.json({ error }, { status });
  }
}
