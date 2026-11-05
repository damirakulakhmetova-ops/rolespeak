"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { bfLive } from "@/lib/blackFriday";
import { BfCountdown } from "./BlackFriday";

type PlanId = "last_minute" | "exam_pass" | "pro";

const PLAN_NAMES: Record<PlanId, string> = {
  last_minute: "Last-minute",
  exam_pass: "Exam Pass",
  pro: "Pro",
};

function priceOf(plan: PlanId, blackFriday: boolean): string {
  if (plan === "last_minute") return "$29";
  if (plan === "exam_pass") return "$79";
  return blackFriday ? "$79" : "$149";
}

// Both Pro price variants are always rendered; CSS shows one of them based on the
// .bf-ended class that the inline script sets on <html> before first paint.
export default function Pricing() {
  const [plan, setPlan] = useState<PlanId | null>(null);

  const reserve = (p: PlanId) => {
    track("reserve_clicked", { plan: p, black_friday: p === "pro" && bfLive() });
    setPlan(p);
  };

  return (
    <>
      <div className="plans">
        <div className="plan">
          <h3>Last-minute</h3>
          <p className="plan-sub">A final run before your exam</p>
          <div className="plan-price">$29</div>
          <p className="plan-week">$29 a week</p>
          <ul>
            <li>1 week access</li>
            <li>Unlimited AI role-plays</li>
            <li>Score on 9 criteria + 3 fixes after each</li>
            <li>Predicted grade</li>
          </ul>
          <button type="button" className="btn outline" onClick={() => reserve("last_minute")}>
            Reserve Last-minute
          </button>
        </div>

        <div className="plan featured">
          <span className="badge">Most popular</span>
          <h3>Exam Pass</h3>
          <p className="plan-sub">Best value to reach grade B</p>
          <div className="plan-price">
            $79 <small>once · 8 weeks</small>
          </div>
          <p className="plan-inr">India: ₹3,999</p>
          <p className="plan-week">$9.88 a week</p>
          <ul>
            <li>8 weeks access</li>
            <li>Unlimited AI role-plays</li>
            <li>All available scenarios</li>
            <li>Plan to your exam date</li>
            <li>Progress tracker to grade B</li>
            <li>Free extension to your next attempt if you don&apos;t reach B</li>
          </ul>
          <button type="button" className="btn" onClick={() => reserve("exam_pass")}>
            Reserve Exam Pass
          </button>
        </div>

        <div className="plan">
          <h3>Pro</h3>
          <p className="plan-sub">Practice + a teacher&apos;s review</p>
          <div className="bf-only">
            <div className="plan-price">
              <s aria-label="Regular price $149">$149</s> $79 <small className="bf-tag">Black Friday</small>
            </div>
            <p className="plan-week">
              <BfCountdown />
            </p>
          </div>
          <div className="bf-regular">
            <div className="plan-price">$149</div>
            <p className="plan-week">$11.46 a week</p>
          </div>
          <ul>
            <li>3 months access</li>
            <li>Everything in Exam Pass</li>
            <li>An OET teacher reviews a recording of one of your role-plays and writes feedback</li>
          </ul>
          <p className="plan-note">Teacher reviews launching soon — reserve your place</p>
          <button type="button" className="btn outline" onClick={() => reserve("pro")}>
            Reserve Pro
          </button>
        </div>
      </div>
      {plan && <ReserveModal plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}

type Stage = "contact" | "reserved";

function ReserveModal({ plan, onClose }: { plan: PlanId; onClose: () => void }) {
  // Decided once when the form opens, so the price shown and the price saved match.
  const [blackFriday] = useState(() => plan === "pro" && bfLive());
  const price = priceOf(plan, blackFriday);
  const [stage, setStage] = useState<Stage>("contact");
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan, black_friday: blackFriday, price, source: "landing" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      track("contact_submitted", { plan, black_friday: blackFriday, price, source: "landing" });
      track("payment_viewed", { plan, price });
      setStage("reserved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {stage === "contact" ? (
          <>
            <div className="step-label">Step 1 of 2</div>
            <h3 id="reserve-title">
              Reserve {PLAN_NAMES[plan]} · {price}
              {blackFriday && <span className="bf-tag"> Black Friday</span>}
            </h3>
            <p className="muted">Your contact details, so we can reach you when checkout opens.</p>
            <form onSubmit={submit} noValidate>
              <label htmlFor="lead-name">Full name</label>
              <input
                ref={firstInput}
                id="lead-name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <label htmlFor="lead-email">Email</label>
              <input
                id="lead-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <label htmlFor="lead-whatsapp">WhatsApp number</label>
              <input
                id="lead-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                required
              />
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn" disabled={sending}>
                {sending ? "Saving…" : "Continue to payment →"}
              </button>
              <p className="tiny">We&apos;ll only use these details to contact you about RoleSpeak.</p>
            </form>
          </>
        ) : (
          <div className="center-text" aria-live="polite">
            <div className="step-label">Step 2 of 2 · Payment</div>
            <div style={{ fontSize: 40, marginTop: 8 }}>🎉</div>
            <h3 id="reserve-title">Payments open soon</h3>
            <p className="muted">
              Your {PLAN_NAMES[plan]} place is reserved at {price}. We&apos;ll email you when checkout opens.
            </p>
            <button type="button" className="btn outline" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
