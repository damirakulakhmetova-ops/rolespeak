"use client";

import { useEffect, useState } from "react";
import { SCENARIOS, type ScenarioId } from "@/lib/scenarios";
import { Button, RoleCard, Tag, formatClock } from "./ui";

const PREP_SECONDS = 180;

export default function Prepare({
  scenarioId,
  onBack,
  onReady,
}: {
  scenarioId: ScenarioId;
  onBack: () => void;
  onReady: () => void;
}) {
  const scenario = SCENARIOS[scenarioId];
  const [left, setLeft] = useState(PREP_SECONDS);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = PREP_SECONDS - (Date.now() - started) / 1000;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, []);

  const done = left <= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Tag>Preparation time</Tag>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Read your role card</h1>
          <p className="text-sm text-ink-soft">Like the real OET: 3 minutes to plan what you will say.</p>
        </div>
        <div
          className={`rounded-xl px-3 py-2 text-center font-mono text-2xl font-black tabular-nums ${
            done ? "bg-soft text-teal" : "bg-ink text-white"
          }`}
          aria-label="Preparation time left"
          role="timer"
        >
          {formatClock(left)}
        </div>
      </div>

      <RoleCard scenario={scenario} />

      <div className="rounded-xl bg-sky p-3 text-sm text-sky-ink">
        <b>Tip:</b> introduce yourself, ask open questions, explain without jargon and check the patient understands.
        The patient will speak first.
      </div>

      {done && <div className="text-center font-bold text-teal">Preparation time is over. Start when you&apos;re ready.</div>}

      <div className="sticky bottom-3 flex gap-2">
        <Button variant="outline" onClick={onBack} className="shrink-0">
          ← Back
        </Button>
        <Button className={`flex-1 ${done ? "rs-pulse" : ""}`} onClick={onReady}>
          I&apos;m ready
        </Button>
      </div>
    </div>
  );
}
