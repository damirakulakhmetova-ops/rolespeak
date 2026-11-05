"use client";

import { useEffect, useState } from "react";
import { BF_DISMISS_KEY, BF_INLINE_SCRIPT, bfEnd, bfLive, bfStart } from "@/lib/blackFriday";

/** Inline script that applies the banner/discount state before first paint (hard loads). */
export function BlackFridayScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: BF_INLINE_SCRIPT }}
    />
  );
}

/** Re-applies the same state on client-side navigations, where the inline script doesn't run. */
function useApplyBfState() {
  useEffect(() => {
    const d = document.documentElement;
    if (!bfLive()) {
      d.classList.add("bf-ended", "bf-hide");
      return;
    }
    try {
      if (localStorage.getItem(BF_DISMISS_KEY) === "1") d.classList.add("bf-hide");
    } catch {
      /* storage unavailable */
    }
  }, []);
}

export function BlackFridayBar() {
  useApplyBfState();
  const dismiss = () => {
    document.documentElement.classList.add("bf-hide");
    try {
      localStorage.setItem(BF_DISMISS_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };
  return (
    <div className="bf-bar" role="region" aria-label="Black Friday offer">
      <a href="#pricing">
        <strong>Black Friday, Nov 27 – Dec 1:</strong> Pro for $79 instead of $149 →
      </a>
      <button type="button" className="bf-close" aria-label="Dismiss Black Friday banner" onClick={dismiss}>
        ×
      </button>
    </div>
  );
}

function countdownText(now: number): string {
  if (now < bfStart()) return "Starts Nov 27 · until Dec 1, 23:59";
  const left = bfEnd() - now;
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  return `until Dec 1, 23:59 · ends in ${d > 0 ? `${d}d ` : ""}${h}h ${m}m`;
}

/** Countdown to the real end date only. Fixed single line, so no layout shift. */
export function BfCountdown() {
  const [text, setText] = useState("until Dec 1, 23:59");
  useEffect(() => {
    const tick = () => setText(countdownText(Date.now()));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  return <span className="bf-countdown">{text}</span>;
}
