"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { preloadVoices, unlockSpeech } from "@/lib/speech";
import { loadProfile, saveProfile, type Profile } from "@/lib/profile";
import type { ScenarioId, Turn } from "@/lib/scenarios";
import type { ScoredReport } from "@/lib/scoring";
import Setup from "./Setup";
import Prepare from "./Prepare";
import Roleplay from "./Roleplay";
import Feedback from "./Feedback";
import Gap from "./Gap";
import { Spinner } from "./ui";

type Step = "setup" | "prepare" | "roleplay" | "feedback" | "gap";
const STEP_LABELS: Record<Step, string> = {
  setup: "Setup",
  prepare: "Prepare",
  roleplay: "Roleplay",
  feedback: "Feedback",
  gap: "Your plan",
};
const ORDER: Step[] = ["setup", "prepare", "roleplay", "feedback", "gap"];

const noop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

function readDemoFlag() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

export default function PracticeApp() {
  const isClient = useIsClient();
  const [demo] = useState(readDemoFlag);
  const [profile, setProfile] = useState<Profile>(() =>
    typeof window === "undefined" ? { country: null, examDate: "" } : loadProfile(),
  );
  const [step, setStep] = useState<Step>("setup");
  const [scenarioId, setScenarioId] = useState<ScenarioId>("breathless");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [report, setReport] = useState<ScoredReport | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    preloadVoices();
  }, []);

  const go = useCallback((s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const updateProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  if (!isClient) {
    return (
      <main className="flex-1">
        <Spinner label="Loading RoleSpeak…" />
      </main>
    );
  }

  const idx = ORDER.indexOf(step);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link href="/" className="text-xl font-black tracking-tighter">
            role<span className="text-teal">speak</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
            {demo && <span className="rounded-full bg-[#fff4e0] px-2.5 py-1 text-[#8a5a00]">DEMO</span>}
            <span>
              {idx + 1}/{ORDER.length} · {STEP_LABELS[step]}
            </span>
          </div>
        </div>
        <div className="h-1 bg-soft">
          <div className="h-1 bg-teal transition-all" style={{ width: `${((idx + 1) / ORDER.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-10">
        {step === "setup" && (
          <Setup
            demo={demo}
            profile={profile}
            onProfile={updateProfile}
            scenarioId={scenarioId}
            onScenario={setScenarioId}
            onNext={() => go("prepare")}
          />
        )}
        {step === "prepare" && (
          <Prepare
            scenarioId={scenarioId}
            onBack={() => go("setup")}
            onReady={() => {
              unlockSpeech();
              go("roleplay");
            }}
          />
        )}
        {step === "roleplay" && (
          <Roleplay
            key={attempt}
            demo={demo}
            scenarioId={scenarioId}
            onFinish={(t) => {
              setTurns(t);
              setReport(null);
              go("feedback");
            }}
          />
        )}
        {step === "feedback" && (
          <Feedback
            demo={demo}
            scenarioId={scenarioId}
            turns={turns}
            report={report}
            onReport={setReport}
            onAgain={() => {
              setAttempt((a) => a + 1);
              go("setup");
            }}
            onGap={() => go("gap")}
          />
        )}
        {step === "gap" && report && (
          <Gap
            profile={profile}
            report={report}
            scenarioId={scenarioId}
            onBack={() => go("feedback")}
          />
        )}
      </main>
    </div>
  );
}
