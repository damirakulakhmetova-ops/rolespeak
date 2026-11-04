"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- Minimal Web Speech API typings ---------- */
interface SRAlternative {
  transcript: string;
}
interface SRResult {
  isFinal: boolean;
  0: SRAlternative;
}
interface SREvent {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
interface SRErrorEvent {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SRCtor = new () => SpeechRecognitionLike;

function getSRCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechRecognitionSupported(): boolean {
  return getSRCtor() !== null;
}

/**
 * Push-to-talk speech recognition (en-GB).
 * start() begins listening; stop() resolves with everything heard.
 * Browsers end sessions on silence, so we restart until stop() is called.
 */
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRef = useRef(false); // user still holding "talk"
  const committedRef = useRef(""); // text from earlier sessions
  const sessionRef = useRef(""); // text from the current session
  const resolveRef = useRef<((t: string) => void) | null>(null);

  const fullText = () => `${committedRef.current} ${sessionRef.current}`.replace(/\s+/g, " ").trim();

  const startSession = useCallback(() => {
    const run = () => {
    const Ctor = getSRCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    const android = /android/i.test(navigator.userAgent);
    rec.lang = "en-GB";
    // Android Chrome duplicates results in continuous mode.
    rec.continuous = !android;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    sessionRef.current = "";

    rec.onresult = (e) => {
      let finals = "";
      let partial = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals += `${r[0].transcript} `;
        else partial += `${r[0].transcript} `;
      }
      sessionRef.current = `${finals}${partial}`;
      setInterim(fullText());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
        setError("Microphone access is blocked. Allow the microphone or switch to typing.");
      } else if (e.error === "audio-capture") {
        wantRef.current = false;
        setError("No microphone found. Switch to typing.");
      }
      // "no-speech" / "aborted" / "network": onend handles restart or finish.
    };
    rec.onend = () => {
      committedRef.current = fullText();
      sessionRef.current = "";
      if (wantRef.current) {
        try {
          run();
          return;
        } catch {
          /* fall through and finish */
        }
      }
      recRef.current = null;
      setListening(false);
      const text = committedRef.current;
      const resolve = resolveRef.current;
      resolveRef.current = null;
      resolve?.(text);
    };
    recRef.current = rec;
    rec.start();
    };
    run();
  }, []);

  const start = useCallback(() => {
    if (recRef.current) return;
    setError(null);
    committedRef.current = "";
    sessionRef.current = "";
    setInterim("");
    wantRef.current = true;
    try {
      startSession();
      setListening(true);
    } catch {
      wantRef.current = false;
      setError("Couldn't start the microphone. Switch to typing.");
    }
  }, [startSession]);

  const stop = useCallback((): Promise<string> => {
    wantRef.current = false;
    const rec = recRef.current;
    if (!rec) {
      setListening(false);
      return Promise.resolve(fullText());
    }
    return new Promise((resolve) => {
      resolveRef.current = (t) => {
        setInterim("");
        resolve(t);
      };
      try {
        rec.stop();
      } catch {
        resolveRef.current?.(fullText());
      }
      // Safety net: some browsers never fire onend.
      setTimeout(() => {
        if (resolveRef.current) {
          recRef.current = null;
          setListening(false);
          const r = resolveRef.current;
          resolveRef.current = null;
          r(fullText());
        }
      }, 2500);
    });
  }, []);

  const abort = useCallback(() => {
    wantRef.current = false;
    resolveRef.current = null;
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  useEffect(() => () => abort(), [abort]);

  return { listening, interim, error, start, stop, abort };
}

/* ---------- Patient voice (speechSynthesis) ---------- */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined && cachedVoice !== null) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const gb = voices.filter((v) => v.lang?.toLowerCase().replace("_", "-").startsWith("en-gb"));
  const preferred =
    gb.find((v) => /google uk english/i.test(v.name)) ??
    gb.find((v) => /natural|premium|enhanced/i.test(v.name)) ??
    gb[0] ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ??
    null;
  cachedVoice = preferred;
  return preferred;
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speak text; resolves when finished (or after a safety timeout). */
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  if (!ttsSupported() || !text) return Promise.resolve();
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? "en-GB";
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, 4000 + text.length * 90);
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/**
 * Call inside a click handler before the first speak(): iOS Safari only
 * allows speech synthesis once it has been started by a user gesture.
 */
export function unlockSpeech() {
  if (!ttsSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Warm up the voice list (Chrome loads voices asynchronously). */
export function preloadVoices() {
  if (!ttsSupported()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
    pickVoice();
  };
}
