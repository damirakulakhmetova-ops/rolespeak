"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DEMO_REPORT } from "@/lib/demo";
import { saveResult } from "@/lib/profile";
import type { ScenarioId, Turn } from "@/lib/scenarios";
import { CRITERIA, levelFor, type Level, type ScoredReport } from "@/lib/scoring";
import { Button, Card, Pill, Spinner, Tag } from "./ui";

interface Props {
  demo: boolean;
  scenarioId: ScenarioId;
  turns: Turn[];
  report: ScoredReport | null;
  onReport: (r: ScoredReport) => void;
  onAgain: () => void;
  onGap: () => void;
}

export const DISCLAIMER =
  "This is a practice estimate, not an official OET score. We do not guarantee a score, exam result, employment or registration.";

const LEVEL_STYLE: Record<Level, { pill: "teal" | "sky" | "amber"; bar: string }> = {
  Strong: { pill: "teal", bar: "bg-teal" },
  Developing: { pill: "sky", bar: "bg-[#3b82c4]" },
  "Needs work": { pill: "amber", bar: "bg-[#e0a030]" },
};

export default function Feedback({ demo, scenarioId, turns, report, onReport, onAgain, onGap }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!report);
  const requested = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      let r: ScoredReport;
      if (demo) {
        await new Promise((res) => setTimeout(res, 1200));
        r = DEMO_REPORT;
      } else {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId, turns }),
        });
        const data = (await res.json().catch(() => ({}))) as ScoredReport & { error?: string };
        if (!res.ok || !Array.isArray(data.criteria)) {
          throw new Error(data.error || "We couldn't score this roleplay right now. Please try again.");
        }
        r = data;
      }
      saveResult({
        at: new Date().toISOString(),
        scenarioId,
        demo,
        predicted: r.predicted,
        grade: r.grade,
        report: r,
      });
      onReport(r);
      track("feedback_viewed", { scenario: scenarioId, predicted: r.predicted, grade: r.grade, demo });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [demo, scenarioId, turns, onReport]);

  useEffect(() => {
    if (report || requested.current) return;
    requested.current = true;
    void load();
  }, [report, load]);

  if (loading) return <Spinner label="Your assessor is reviewing the roleplay…" />;

  if (error || !report) {
    return (
      <Card className="text-center">
        <div className="text-3xl">🩺</div>
        <h2 className="mt-2 text-xl font-extrabold">We couldn&apos;t score this one</h2>
        <p className="mt-1 text-ink-soft">{error}</p>
        <div className="mt-4 flex flex-col gap-2">
          {turns.some((t) => t.speaker === "nurse") && <Button onClick={() => void load()}>Try scoring again</Button>}
          <Button variant="outline" onClick={onAgain}>
            Practise again
          </Button>
        </div>
      </Card>
    );
  }

  const groups = [
    { id: "linguistic", title: "Linguistic criteria", sub: "0–6 each" },
    { id: "clinical", title: "Clinical communication", sub: "0–3 each" },
  ] as const;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-white to-mint text-center">
        <Tag>Predicted OET Speaking score</Tag>
        <div className="mt-2 flex items-end justify-center gap-2">
          <span className="text-6xl font-black tracking-tighter">{report.predicted}</span>
          <span className="pb-2 text-lg text-ink-soft">/ 500</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 font-extrabold text-white">
          Grade {report.grade}
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {report.grade === "A" || report.grade === "B"
            ? "That's at the level most regulators ask for. Keep practising to stay consistent."
            : "Most nursing regulators, including the NMC, ask for grade B (350+)."}
        </p>
      </Card>

      {groups.map((g) => (
        <Card key={g.id}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold">{g.title}</h2>
            <span className="text-xs text-ink-soft">{g.sub}</span>
          </div>
          <ul className="mt-3 space-y-4">
            {CRITERIA.filter((c) => c.group === g.id).map((meta) => {
              const c = report.criteria.find((x) => x.key === meta.key);
              if (!c) return null;
              const level = levelFor(c.score, c.max);
              const st = LEVEL_STYLE[level];
              return (
                <li key={meta.key}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold leading-snug">{meta.label}</span>
                    <Pill tone={st.pill}>{level}</Pill>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#edf2f0]">
                      <div className={`h-2 rounded-full ${st.bar}`} style={{ width: `${(c.score / c.max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-ink-soft tabular-nums">
                      {c.score}/{c.max}
                    </span>
                  </div>
                  {c.comment && <p className="mt-1 text-sm text-ink-soft">{c.comment}</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <Card>
        <h2 className="text-lg font-extrabold">Role card tasks</h2>
        <ul className="mt-3 space-y-2">
          {report.tasks_covered.map((t) => (
            <li key={t.task} className="flex gap-3 text-[15px]">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                  t.covered ? "bg-soft text-teal" : "bg-[#fdecea] text-[#b42318]"
                }`}
                aria-label={t.covered ? "Covered" : "Missed"}
              >
                {t.covered ? "✓" : "✕"}
              </span>
              <span className={t.covered ? "" : "text-ink-soft"}>
                {t.task}
                {!t.covered && <span className="ml-1 text-xs font-bold text-[#b42318]">Missed</span>}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {report.fixes.length > 0 && (
        <Card>
          <h2 className="text-lg font-extrabold">3 fixes for your next attempt</h2>
          <ol className="mt-3 space-y-4">
            {report.fixes.map((f, i) => (
              <li key={i} className="rounded-xl border border-line p-3">
                <div className="text-xs font-bold text-[#b42318] uppercase">You said</div>
                <p className="mt-0.5 text-ink-soft italic">“{f.you_said}”</p>
                <div className="mt-2 text-xs font-bold text-teal uppercase">Better</div>
                <p className="mt-0.5 font-semibold">“{f.better}”</p>
                {f.why && <p className="mt-2 text-sm text-ink-soft">{f.why}</p>}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer font-bold">Your transcript</summary>
        <div className="mt-3 space-y-2 text-sm">
          {turns.map((t, i) => (
            <p key={i}>
              <b className={t.speaker === "nurse" ? "text-sky-ink" : "text-teal"}>
                {t.speaker === "nurse" ? "You" : "Patient"}:
              </b>{" "}
              {t.text}
            </p>
          ))}
        </div>
      </details>

      <p className="rounded-xl bg-[#f3f6f5] p-3 text-xs text-ink-soft">{DISCLAIMER}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={onAgain}>
          Practise again
        </Button>
        <Button className="flex-1" onClick={onGap}>
          See how to reach grade B →
        </Button>
      </div>
    </div>
  );
}
