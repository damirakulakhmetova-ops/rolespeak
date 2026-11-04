"use client";

import { track } from "@/lib/analytics";
import { COUNTRIES, examLine, type Profile } from "@/lib/profile";
import { SCENARIO_LIST, type ScenarioId } from "@/lib/scenarios";
import { speechRecognitionSupported } from "@/lib/speech";
import { Button, Card, Pill, Tag } from "./ui";

interface Props {
  demo: boolean;
  profile: Profile;
  onProfile: (p: Profile) => void;
  scenarioId: ScenarioId;
  onScenario: (id: ScenarioId) => void;
  onNext: () => void;
}

const FLAGS: Record<string, string> = { India: "🇮🇳", Philippines: "🇵🇭", Nigeria: "🇳🇬", Other: "🌍" };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Setup({ demo, profile, onProfile, scenarioId, onScenario, onNext }: Props) {
  const line = examLine(profile.examDate);
  const voiceOk = speechRecognitionSupported();
  const scenarios = demo ? SCENARIO_LIST.filter((s) => s.id === "breathless") : SCENARIO_LIST;

  return (
    <div className="space-y-5">
      <div>
        <Tag>OET Speaking practice</Tag>
        <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight">
          Set up your roleplay
        </h1>
        <p className="mt-1 text-ink-soft">
          You play the nurse. The AI plays the patient, by voice. You get your predicted grade in about 10 minutes.
        </p>
      </div>

      {!voiceOk && (
        <div className="rounded-xl border border-[#f1d9a6] bg-[#fff8ea] p-3 text-sm text-[#7a5200]">
          <b>Voice works best in Chrome.</b> In this browser you can still practise by typing.
        </div>
      )}

      <Card>
        <div className="font-bold">Where are you from?</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => onProfile({ ...profile, country: c })}
              aria-pressed={profile.country === c}
              className={`min-h-[52px] rounded-xl border px-3 text-left font-semibold transition ${
                profile.country === c ? "border-teal bg-soft ring-1 ring-teal" : "border-line bg-[#f8fbf9]"
              }`}
            >
              <span className="mr-2">{FLAGS[c]}</span>
              {c}
            </button>
          ))}
        </div>

        <label htmlFor="exam-date" className="mt-5 block font-bold">
          When is your OET exam?
        </label>
        <input
          id="exam-date"
          type="date"
          min={todayIso()}
          value={profile.examDate}
          onChange={(e) => onProfile({ ...profile, examDate: e.target.value })}
          className="mt-2 block min-h-[52px] w-full rounded-xl border border-[#c8dcd5] bg-white px-3 text-base"
        />
        {line && <div className="mt-2 text-sm font-bold text-teal">{line}</div>}
      </Card>

      <div>
        <div className="mb-2 font-bold">Choose a scenario</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s) => {
            const active = s.id === scenarioId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onScenario(s.id);
                  track("scenario_selected", { scenario: s.id });
                }}
                aria-pressed={active}
                className={`relative rounded-2xl border bg-white p-4 text-left transition ${
                  active ? "border-teal ring-2 ring-teal" : "border-line"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Pill tone="sky">{s.place}</Pill>
                  {s.id === "breathless" && <Pill>Recommended</Pill>}
                </div>
                <div className="mt-3 text-lg font-extrabold">{s.title}</div>
                <div className="mt-1 text-sm text-ink-soft">{s.patient}</div>
                <div
                  className={`mt-3 text-sm font-bold ${active ? "text-teal" : "text-ink-soft"}`}
                  aria-hidden
                >
                  {active ? "✓ Selected" : "Tap to select"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        className="w-full"
        disabled={!profile.country}
        onClick={() => {
          track("scenario_selected", { scenario: scenarioId, confirmed: true, country: profile.country ?? "" });
          onNext();
        }}
      >
        {profile.country ? "Continue to preparation →" : "Choose your country to continue"}
      </Button>
    </div>
  );
}
