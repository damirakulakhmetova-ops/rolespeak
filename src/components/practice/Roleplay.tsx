"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DEMO_FALLBACK_REPLY, DEMO_NURSE_LINES, DEMO_PATIENT_REPLIES } from "@/lib/demo";
import { SCENARIOS, type ScenarioId, type Turn } from "@/lib/scenarios";
import { speak, speechRecognitionSupported, stopSpeaking, useSpeechRecognition } from "@/lib/speech";
import { Button, RoleCard, formatClock } from "./ui";

const ROLEPLAY_SECONDS = 300;

type Phase = "patient" | "your-turn" | "listening" | "thinking" | "ended";
type Mode = "voice" | "text";

interface Props {
  demo: boolean;
  scenarioId: ScenarioId;
  onFinish: (turns: Turn[]) => void;
}

export default function Roleplay({ demo, scenarioId, onFinish }: Props) {
  const scenario = SCENARIOS[scenarioId];
  const voiceSupported = speechRecognitionSupported();
  const rec = useSpeechRecognition();

  const [turns, setTurns] = useState<Turn[]>([{ speaker: "patient", text: scenario.openingLine }]);
  const turnsRef = useRef(turns);
  const [rawPhase, setPhase] = useState<Phase>("patient");
  const phaseRef = useRef<Phase>("patient");
  const [mode, setMode] = useState<Mode>(voiceSupported ? "voice" : "text");
  const [left, setLeft] = useState(ROLEPLAY_SECONDS);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(true);
  const [replyError, setReplyError] = useState<string | null>(null);
  // A microphone error ends listening: hand the turn back to the nurse.
  const phase: Phase = rawPhase === "listening" && rec.error ? "your-turn" : rawPhase;
  const shownNotice = notice ?? rec.error;
  const endedRef = useRef(false);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const setTurnsBoth = (t: Turn[]) => {
    turnsRef.current = t;
    setTurns(t);
  };

  const speakGen = useRef(0);
  const patientSay = useCallback(
    async (text: string) => {
      if (endedRef.current) return;
      const gen = ++speakGen.current;
      setPhaseBoth("patient");
      await speak(text, scenario.voice);
      // Only the latest utterance hands the turn back to the nurse.
      if (!endedRef.current && gen === speakGen.current && phaseRef.current === "patient") {
        setPhaseBoth("your-turn");
      }
    },
    [scenario.voice],
  );

  /* ----- finish ----- */
  const finish = useCallback(
    async (reason: "timer" | "user") => {
      if (endedRef.current) return;
      endedRef.current = true;
      stopSpeaking();
      let final = turnsRef.current;
      if (phaseRef.current === "listening") {
        const heard = (await rec.stop()).trim();
        if (heard) final = [...final, { speaker: "nurse", text: heard }];
      } else {
        rec.abort();
      }
      setPhaseBoth("ended");
      track("roleplay_completed", {
        scenario: scenarioId,
        reason,
        demo,
        nurse_turns: final.filter((t) => t.speaker === "nurse").length,
      });
      onFinish(final);
    },
    [rec, scenarioId, demo, onFinish],
  );

  /* ----- start: the patient speaks first ----- */
  useEffect(() => {
    if (!startedRef.current) track("roleplay_started", { scenario: scenarioId, demo });
    startedRef.current = true;
    void patientSay(scenario.openingLine);
    return () => stopSpeaking();
  }, [patientSay, scenario.openingLine, scenarioId, demo]);

  /* ----- 5:00 timer ----- */
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = ROLEPLAY_SECONDS - (Date.now() - started) / 1000;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        void finishRef.current("timer");
      }
    }, 250);
    return () => {
      clearInterval(id);
      stopSpeaking();
    };
  }, []);

  /* ----- keep transcript scrolled ----- */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, rec.interim, phase]);

  /* ----- getting the patient's reply ----- */
  const requestReply = useCallback(
    async (history: Turn[]) => {
      setReplyError(null);
      setPhaseBoth("thinking");
      let reply: string;
      if (demo) {
        const nurseCount = history.filter((t) => t.speaker === "nurse").length;
        await new Promise((r) => setTimeout(r, 700));
        reply = DEMO_PATIENT_REPLIES[nurseCount - 1] ?? DEMO_FALLBACK_REPLY;
      } else {
        try {
          const res = await fetch("/api/patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scenarioId, turns: history }),
          });
          const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
          if (!res.ok || !data.reply) throw new Error(data.error || "The patient could not reply.");
          reply = data.reply;
        } catch (e) {
          if (endedRef.current) return;
          setReplyError(e instanceof Error ? e.message : "The patient could not reply.");
          setPhaseBoth("your-turn");
          return;
        }
      }
      if (endedRef.current) return;
      const next: Turn[] = [...turnsRef.current, { speaker: "patient", text: reply }];
      setTurnsBoth(next);
      await patientSay(reply);
    },
    [demo, scenarioId, patientSay],
  );

  const submitNurse = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || endedRef.current) return;
      stopSpeaking();
      setNotice(null);
      const next: Turn[] = [...turnsRef.current, { speaker: "nurse", text: clean }];
      setTurnsBoth(next);
      void requestReply(next);
    },
    [requestReply],
  );

  /* ----- mic ----- */
  const onMic = async () => {
    if (phase === "patient") {
      stopSpeaking();
      setPhaseBoth("your-turn");
      return;
    }
    if (phase === "your-turn") {
      setNotice(null);
      rec.start();
      setPhaseBoth("listening");
      return;
    }
    if (phase === "listening") {
      const heard = await rec.stop();
      if (endedRef.current) return;
      if (!heard.trim()) {
        setPhaseBoth("your-turn");
        setNotice("We didn't catch that. Tap the mic and try again, or switch to typing.");
        return;
      }
      submitNurse(heard);
    }
  };

  const switchMode = () => {
    if (phase === "listening") {
      rec.abort();
      setPhaseBoth("your-turn");
    }
    setNotice(null);
    setMode((m) => (m === "voice" ? "text" : "voice"));
  };

  const sendDraft = () => {
    if (phase === "thinking" || !draft.trim()) return;
    submitNurse(draft);
    setDraft("");
  };

  const nurseCount = turns.filter((t) => t.speaker === "nurse").length;
  const demoLine = demo ? DEMO_NURSE_LINES[nurseCount] : undefined;
  const lowTime = left <= 30;

  const micLabel = {
    patient: "Patient is speaking · tap to skip",
    "your-turn": "Tap to speak",
    listening: "Listening… tap to send",
    thinking: "Patient is thinking…",
    ended: "Roleplay ended",
  }[phase];

  return (
    // Fixed-height chat layout: only the transcript scrolls.
    <div className="-mb-6 flex h-[calc(100dvh-6.5rem)] min-h-[540px] flex-col gap-3">
      {/* timer bar */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold tracking-[1.5px] text-teal uppercase">Roleplay in progress</div>
          <div className="font-bold">
            {scenario.patientName} · {scenario.place}
          </div>
        </div>
        <div
          role="timer"
          aria-label="Roleplay time left"
          className={`rounded-xl px-3 py-2 font-mono text-2xl font-black tabular-nums ${
            lowTime ? "bg-[#fde8e8] text-[#b42318]" : "bg-ink text-white"
          }`}
        >
          {formatClock(left)}
        </div>
      </div>

      {/* Role card: collapsible, and allowed to shrink so the mic panel always fits. */}
      <button
        type="button"
        onClick={() => setShowCard((v) => !v)}
        aria-expanded={showCard}
        className="shrink-0 rounded-xl bg-sky px-4 py-2 text-left text-sm font-bold text-sky-ink"
      >
        {showCard ? "Hide role card ▴" : "Show role card ▾"}
      </button>
      {showCard && (
        <div className="max-h-[28vh] min-h-[72px] shrink overflow-y-auto rounded-2xl">
          <RoleCard scenario={scenario} compact />
        </div>
      )}

      {/* transcript */}
      <div
        ref={scrollRef}
        className="min-h-[110px] flex-1 space-y-3 overflow-y-auto rounded-2xl border border-line bg-white p-3"
        aria-live="polite"
      >
        {turns.map((t, i) => (
          <Bubble key={i} turn={t} name={scenario.patientName} />
        ))}
        {phase === "listening" && (
          <Bubble turn={{ speaker: "nurse", text: rec.interim || "…" }} name="" pending />
        )}
        {phase === "thinking" && (
          <div className="flex items-center gap-1 pl-2 text-2xl text-teal" aria-label="Patient is thinking">
            <span className="rs-dot">•</span>
            <span className="rs-dot">•</span>
            <span className="rs-dot">•</span>
          </div>
        )}
      </div>

      {replyError && (
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-[#f5c2c0] bg-[#fdf0ef] p-3 text-sm text-[#912018]">
          <span>{replyError}</span>
          <Button variant="outline" className="min-h-[40px] px-3 py-1 text-sm" onClick={() => void requestReply(turnsRef.current)}>
            Retry
          </Button>
        </div>
      )}
      {shownNotice && <div className="shrink-0 rounded-xl bg-[#fff8ea] p-3 text-sm text-[#7a5200]">{shownNotice}</div>}

      {/* controls */}
      <div className="shrink-0">
        {demoLine && (
          <div className="mb-2 flex items-start gap-2 rounded-xl border border-dashed border-[#e3c27a] bg-[#fffaf0] p-2.5 text-sm">
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#8a5a00] uppercase">Demo script · say or tap</div>
              <div className="leading-snug">“{demoLine}”</div>
            </div>
            <button
              className="shrink-0 self-center rounded-lg bg-white px-3 py-2 font-bold text-teal ring-1 ring-line disabled:opacity-50"
              disabled={phase === "thinking" || phase === "listening"}
              onClick={() => submitNurse(demoLine)}
            >
              Use
            </button>
          </div>
        )}
        {mode === "voice" ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => void onMic()}
              disabled={phase === "thinking" || phase === "ended"}
              aria-label={micLabel}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${
                phase === "listening" ? "rs-pulse bg-[#d92d20]" : phase === "patient" ? "bg-sky-ink" : "bg-teal"
              }`}
            >
              {phase === "listening" ? <StopIcon /> : phase === "patient" ? <SpeakerIcon /> : <MicIcon />}
            </button>
            <div className="text-sm font-bold text-ink-soft">{micLabel}</div>
          </div>
        ) : (
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendDraft();
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendDraft();
                }
              }}
              rows={2}
              placeholder="Type what you would say to the patient…"
              aria-label="Your reply"
              className="min-h-[56px] flex-1 resize-none rounded-xl border border-[#c8dcd5] bg-white p-3 text-base"
            />
            <Button type="submit" disabled={!draft.trim() || phase === "thinking"} className="shrink-0">
              Send
            </Button>
          </form>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          {voiceSupported ? (
            <Button variant="ghost" className="min-h-[44px] px-1" onClick={switchMode}>
              {mode === "voice" ? "Switch to typing" : "Switch to voice"}
            </Button>
          ) : (
            <span className="text-xs text-ink-soft">Voice works best in Chrome</span>
          )}
          <Button variant="outline" className="min-h-[44px] py-2" onClick={() => void finish("user")}>
            End roleplay
          </Button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ turn, name, pending }: { turn: Turn; name: string; pending?: boolean }) {
  const nurse = turn.speaker === "nurse";
  return (
    <div className={`flex ${nurse ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-[15px] leading-snug ${
          nurse
            ? "rounded-[17px_17px_3px_17px] bg-sky text-ink"
            : "rounded-[17px_17px_17px_3px] bg-[#edf5f2] text-ink"
        } ${pending ? "italic opacity-70" : ""}`}
      >
        <div className="mb-0.5 text-[11px] font-bold tracking-wide text-ink-soft uppercase">
          {nurse ? "You (nurse)" : name}
        </div>
        {turn.text}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" strokeLinecap="round" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
function SpeakerIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5z" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
    </svg>
  );
}
