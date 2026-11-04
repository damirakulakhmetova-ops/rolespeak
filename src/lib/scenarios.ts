// Client-safe scenario data (role cards). Patient prompts live server-side
// in src/lib/server/patientPrompts.ts and are never sent to the browser.

export type ScenarioId = "breathless" | "post-surgery";

export interface Scenario {
  id: ScenarioId;
  title: string;
  place: string;
  setting: string;
  patient: string;
  patientName: string;
  tasks: string[];
  openingLine: string;
  /** Speech synthesis hints for the patient voice. */
  voice: { rate: number; pitch: number };
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  breathless: {
    id: "breathless",
    title: "Breathless patient",
    place: "Community clinic",
    setting: "Community clinic. You are the practice nurse.",
    patient:
      "Alex Morgan, 34, came in with shortness of breath and chest tightness for two days. The patient has asthma and can speak in full sentences.",
    patientName: "Alex Morgan",
    tasks: [
      "Find out about the symptoms (onset, duration, triggers, night-time symptoms).",
      "Ask about current medication, inhaler use and allergies.",
      "Explain why the preventer inhaler matters and how to use the inhaler correctly with a spacer.",
      "Explain the warning signs that need urgent help.",
      "Summarise the plan and agree on a follow-up appointment.",
    ],
    openingLine:
      "Hi Nurse, I've been having shortness of breath and chest tightness for the last two days.",
    voice: { rate: 1, pitch: 1 },
  },
  "post-surgery": {
    id: "post-surgery",
    title: "Refusing to walk after surgery",
    place: "Hospital ward",
    setting: "Orthopaedic ward, hospital.",
    patient:
      "Sam Taylor, 72, day 2 after a hip replacement. The physiotherapist wants the patient to start walking today, but the patient refuses to get out of bed.",
    patientName: "Sam Taylor",
    tasks: [
      "Find out why the patient does not want to walk.",
      "Explain why moving early after surgery is important (blood clots, chest infection, faster recovery).",
      "Reassure the patient about pain relief before walking.",
      "Explain the safety measures (physiotherapist present, walking frame, short distance first).",
      "Persuade the patient to try walking this afternoon.",
    ],
    openingLine:
      "Oh, hello. If you've come to get me up, I'm really not up to it today.",
    voice: { rate: 0.9, pitch: 0.85 },
  },
};

export const SCENARIO_LIST: Scenario[] = [
  SCENARIOS.breathless,
  SCENARIOS["post-surgery"],
];

export function isScenarioId(v: unknown): v is ScenarioId {
  return v === "breathless" || v === "post-surgery";
}

export type Speaker = "nurse" | "patient";
export interface Turn {
  speaker: Speaker;
  text: string;
}
