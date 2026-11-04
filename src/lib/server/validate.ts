import { isScenarioId, type ScenarioId, type Turn } from "@/lib/scenarios";

const MAX_TURNS = 120;
const MAX_TEXT = 2000;

export function parseTurns(v: unknown): Turn[] | null {
  if (!Array.isArray(v) || v.length > MAX_TURNS) return null;
  const out: Turn[] = [];
  for (const t of v) {
    if (!t || typeof t !== "object") return null;
    const { speaker, text } = t as Record<string, unknown>;
    if ((speaker !== "nurse" && speaker !== "patient") || typeof text !== "string") return null;
    const clean = text.trim().slice(0, MAX_TEXT);
    if (clean) out.push({ speaker, text: clean });
  }
  return out;
}

export async function readBody(
  req: Request,
): Promise<{ scenarioId: ScenarioId; turns: Turn[] } | { error: string }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: "Invalid JSON body" };
  }
  const b = body as Record<string, unknown>;
  if (!isScenarioId(b?.scenarioId)) return { error: "Unknown scenario" };
  const turns = parseTurns(b.turns);
  if (!turns) return { error: "Invalid transcript" };
  return { scenarioId: b.scenarioId, turns };
}
