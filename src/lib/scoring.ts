// OET Speaking criteria, score maths and report validation (shared by
// the /api/score route and the client).

export type CriterionKey =
  | "intelligibility"
  | "fluency"
  | "appropriateness"
  | "grammar_expression"
  | "relationship_building"
  | "patient_perspective"
  | "structure"
  | "information_gathering"
  | "information_giving";

export interface CriterionMeta {
  key: CriterionKey;
  label: string;
  max: number;
  group: "linguistic" | "clinical";
}

export const CRITERIA: CriterionMeta[] = [
  { key: "intelligibility", label: "Intelligibility", max: 6, group: "linguistic" },
  { key: "fluency", label: "Fluency", max: 6, group: "linguistic" },
  { key: "appropriateness", label: "Appropriateness of language", max: 6, group: "linguistic" },
  { key: "grammar_expression", label: "Resources of grammar and expression", max: 6, group: "linguistic" },
  { key: "relationship_building", label: "Relationship building", max: 3, group: "clinical" },
  { key: "patient_perspective", label: "Understanding and incorporating the patient's perspective", max: 3, group: "clinical" },
  { key: "structure", label: "Providing structure", max: 3, group: "clinical" },
  { key: "information_gathering", label: "Information gathering", max: 3, group: "clinical" },
  { key: "information_giving", label: "Information giving", max: 3, group: "clinical" },
];

export const TOTAL_MAX = CRITERIA.reduce((s, c) => s + c.max, 0); // 39

export interface CriterionResult {
  key: CriterionKey;
  score: number;
  max: number;
  comment: string;
}
export interface Fix {
  you_said: string;
  better: string;
  why: string;
}
export interface TaskResult {
  task: string;
  covered: boolean;
}
export interface Report {
  criteria: CriterionResult[];
  fixes: Fix[];
  tasks_covered: TaskResult[];
}

export interface ScoredReport extends Report {
  total: number;
  predicted: number;
  grade: Grade;
}

export type Grade = "A" | "B" | "C+" | "C" | "D" | "E";

export function predictedScore(total: number): number {
  return Math.round(((total / TOTAL_MAX) * 500) / 10) * 10;
}

export function gradeFor(score: number): Grade {
  if (score >= 450) return "A";
  if (score >= 350) return "B";
  if (score >= 300) return "C+";
  if (score >= 200) return "C";
  if (score >= 100) return "D";
  return "E";
}

export function isBOrHigher(g: Grade): boolean {
  return g === "A" || g === "B";
}

export type Level = "Strong" | "Developing" | "Needs work";
export function levelFor(score: number, max: number): Level {
  const r = max > 0 ? score / max : 0;
  if (r >= 0.67) return "Strong";
  if (r >= 0.4) return "Developing";
  return "Needs work";
}

const str = (v: unknown): v is string => typeof v === "string";

/**
 * Validate and normalise the LLM's JSON. Returns null if it is unusable.
 * Missing criteria make the report invalid; scores are clamped to range.
 */
export function validateReport(raw: unknown, tasks: string[]): Report | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.criteria)) return null;

  const criteria: CriterionResult[] = [];
  for (const meta of CRITERIA) {
    const found = (r.criteria as unknown[]).find(
      (c) => c && typeof c === "object" && (c as { key?: unknown }).key === meta.key,
    ) as { score?: unknown; comment?: unknown } | undefined;
    if (!found) return null;
    const n = Number(found.score);
    if (!Number.isFinite(n)) return null;
    criteria.push({
      key: meta.key,
      max: meta.max,
      score: Math.max(0, Math.min(meta.max, Math.round(n))),
      comment: str(found.comment) ? found.comment.trim() : "",
    });
  }

  const fixes: Fix[] = Array.isArray(r.fixes)
    ? (r.fixes as unknown[])
        .filter(
          (f): f is Fix =>
            !!f &&
            typeof f === "object" &&
            str((f as Fix).you_said) &&
            str((f as Fix).better),
        )
        .map((f) => ({ you_said: f.you_said, better: f.better, why: str(f.why) ? f.why : "" }))
        .slice(0, 3)
    : [];

  // Always report against the real role-card tasks, in order.
  const rawTasks = Array.isArray(r.tasks_covered) ? (r.tasks_covered as unknown[]) : [];
  const tasks_covered: TaskResult[] = tasks.map((task, i) => {
    const byText = rawTasks.find(
      (t) => t && typeof t === "object" && (t as TaskResult).task === task,
    ) as TaskResult | undefined;
    const t = byText ?? (rawTasks[i] as TaskResult | undefined);
    return { task, covered: !!(t && typeof t === "object" && t.covered === true) };
  });

  return { criteria, fixes, tasks_covered };
}

export function finaliseReport(report: Report): ScoredReport {
  const total = report.criteria.reduce((s, c) => s + c.score, 0);
  const predicted = predictedScore(total);
  return { ...report, total, predicted, grade: gradeFor(predicted) };
}
