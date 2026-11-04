import type { ScenarioId } from "@/lib/scenarios";
import type { ScoredReport } from "@/lib/scoring";

export const COUNTRIES = ["India", "Philippines", "Nigeria", "Other"] as const;
export type Country = (typeof COUNTRIES)[number];

export interface Profile {
  country: Country | null;
  examDate: string; // yyyy-mm-dd or ""
}

export function priceFor(country: Country | null): string {
  return country === "India" ? "₹3,999" : "$79";
}

/** Whole days from today (local time) until the exam date; null if unset/invalid. */
export function daysUntil(examDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) return null;
  const [y, m, d] = examDate.split("-").map(Number);
  const exam = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam.getTime() - today.getTime()) / 86_400_000);
}

export function examLine(examDate: string): string | null {
  const n = daysUntil(examDate);
  if (n === null) return null;
  if (n < 0) return "Your exam date has passed";
  if (n === 0) return "Your exam is today";
  return `Your exam is in ${n} day${n === 1 ? "" : "s"}`;
}

/* ---------- localStorage (results + profile) ---------- */

const PROFILE_KEY = "rolespeak.profile";
const RESULTS_KEY = "rolespeak.results";

export interface SavedResult {
  at: string;
  scenarioId: ScenarioId;
  demo: boolean;
  predicted: number;
  grade: string;
  report: ScoredReport;
}

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export const loadProfile = (): Profile => {
  const p = read<Partial<Profile>>(PROFILE_KEY, {});
  return {
    country: COUNTRIES.includes(p.country as Country) ? (p.country as Country) : null,
    examDate: typeof p.examDate === "string" ? p.examDate : "",
  };
};
export const saveProfile = (p: Profile) => write(PROFILE_KEY, p);

export function saveResult(r: SavedResult) {
  const all = read<SavedResult[]>(RESULTS_KEY, []);
  write(RESULTS_KEY, [r, ...all].slice(0, 20));
}
