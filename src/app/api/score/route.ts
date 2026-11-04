import { SCENARIOS } from "@/lib/scenarios";
import { CRITERIA, finaliseReport, validateReport } from "@/lib/scoring";
import { callGemini, GeminiError } from "@/lib/server/gemini";
import { readBody } from "@/lib/server/validate";

// Gemini calls (with retries) can take a while; allow up to 60s on Vercel.
export const maxDuration = 60;

const ASSESSOR =
  "You are an experienced OET Speaking assessor. Score the CANDIDATE (the nurse) using the OET Speaking criteria: linguistic criteria 0-6 each (intelligibility, fluency, appropriateness, grammar_expression) and clinical communication criteria 0-3 each (relationship_building, patient_perspective, structure, information_gathering, information_giving). Judge only from the transcript; for intelligibility and fluency judge from the text as best you can. Be strict but fair. Return JSON only.";

const SCHEMA_HINT = `Return exactly this JSON shape:
{
  "criteria": [{ "key": string, "score": integer, "max": integer, "comment": string }],
  "fixes": [{ "you_said": string, "better": string, "why": string }],
  "tasks_covered": [{ "task": string, "covered": boolean }]
}
Rules:
- "criteria" has exactly these 9 keys with these max values: ${CRITERIA.map((c) => `${c.key} (max ${c.max})`).join(", ")}.
- Each "comment" is ONE short sentence addressed to the candidate as "you", specific to this transcript.
- "fixes" has exactly 3 items. "you_said" must be an exact quote of something the NURSE said. "better" is a more natural, patient-friendly version a grade-B nurse would say. "why" is one short sentence.
- "tasks_covered" lists every role card task exactly as written, with covered true only if the nurse clearly did it.
- If the nurse said very little, score low.
- Calibrate like a real OET assessor: top scores (6/6, 3/3) are rare and need near-flawless, natural performance; when unsure between two scores, choose the lower one.`;

export async function POST(req: Request) {
  const parsed = await readBody(req);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  const { scenarioId, turns } = parsed;
  const scenario = SCENARIOS[scenarioId];

  const nurseWords = turns
    .filter((t) => t.speaker === "nurse")
    .reduce((n, t) => n + t.text.split(/\s+/).filter(Boolean).length, 0);
  if (nurseWords < 5) {
    return Response.json(
      { error: "We didn't hear enough from you to score this roleplay. Try again and speak a few full sentences." },
      { status: 422 },
    );
  }

  const transcript = turns
    .map((t) => `${t.speaker === "nurse" ? "NURSE (candidate)" : "PATIENT"}: ${t.text}`)
    .join("\n");
  const userMsg = `ROLE CARD
Setting: ${scenario.setting}
Patient: ${scenario.patient}
Tasks:
${scenario.tasks.map((t) => `- ${t}`).join("\n")}

TRANSCRIPT
${transcript}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callGemini({
        system: `${ASSESSOR}\n\n${SCHEMA_HINT}`,
        messages: [{ role: "user", text: userMsg }],
        json: true,
        temperature: 0.2,
        maxOutputTokens: 4096,
      });
      const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
      const report = validateReport(JSON.parse(cleaned), scenario.tasks);
      if (!report) throw new SyntaxError("Report failed validation");
      return Response.json(finaliseReport(report));
    } catch (e) {
      console.error(`[api/score] attempt ${attempt}:`, e instanceof Error ? e.message : e);
      if (e instanceof GeminiError && e.status === 503) {
        return Response.json({ error: "AI is not configured on the server." }, { status: 503 });
      }
      if (e instanceof GeminiError && e.status === 429) {
        return Response.json(
          { error: "Our AI assessor has reached today's usage limit. Please try again later." },
          { status: 429 },
        );
      }
      // Only invalid JSON / validation errors and upstream hiccups get one retry.
    }
  }
  return Response.json(
    { error: "We couldn't score this roleplay right now. Please try again in a moment." },
    { status: 502 },
  );
}
