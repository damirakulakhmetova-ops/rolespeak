"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { daysUntil, priceFor, type Profile } from "@/lib/profile";
import type { ScenarioId } from "@/lib/scenarios";
import { isBOrHigher, type ScoredReport } from "@/lib/scoring";
import { Button, Card, Pill, Tag } from "./ui";

interface Props {
  profile: Profile;
  report: ScoredReport;
  scenarioId: ScenarioId;
  onBack: () => void;
}

type Stage = "offer" | "contact" | "reserved";

function examSentence(examDate: string): string | null {
  const n = daysUntil(examDate);
  if (n === null || n < 0) return null;
  if (n === 0) return "Your exam is today.";
  return `Your exam is in ${n} day${n === 1 ? "" : "s"}.`;
}

export default function Gap({ profile, report, scenarioId, onBack }: Props) {
  const price = priceFor(profile.country);
  const onTrack = isBOrHigher(report.grade);
  const exam = examSentence(profile.examDate);
  const [stage, setStage] = useState<Stage>("offer");
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track("paywall_viewed", { grade: report.grade, predicted: report.predicted, price, country: profile.country ?? "" });
  }, [report.grade, report.predicted, price, profile.country]);

  const openCheckout = () => {
    setStage("contact");
    setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          country: profile.country,
          examDate: profile.examDate,
          scenario: scenarioId,
          predicted: report.predicted,
          grade: report.grade,
          price,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      track("contact_submitted", { country: profile.country ?? "", grade: report.grade, price });
      setStage("reserved");
      track("payment_viewed", { price });
      setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className={onTrack ? "bg-soft" : "bg-[#fff8ea]"}>
        <Tag>Where you are now</Tag>
        {onTrack ? (
          <>
            <h1 className="mt-2 text-2xl leading-tight font-extrabold">You&apos;re on track. Keep it there until exam day.</h1>
            <p className="mt-2 text-ink-soft">
              Your estimated grade: {report.grade} ({report.predicted}). {exam}
            </p>
          </>
        ) : (
          <h1 className="mt-2 text-2xl leading-tight font-extrabold">
            Your estimated grade: {report.grade} ({report.predicted}). NMC requires grade B (350+). {exam}
          </h1>
        )}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold text-ink-soft">
            <span>You: {report.predicted}</span>
            <span>Grade B: 350</span>
          </div>
          <div className="relative mt-1 h-3 rounded-full bg-white">
            <div
              className={`h-3 rounded-full ${onTrack ? "bg-teal" : "bg-[#e0a030]"}`}
              style={{ width: `${Math.min(100, (report.predicted / 500) * 100)}%` }}
            />
            <div className="absolute top-[-4px] h-5 w-0.5 bg-ink" style={{ left: "70%" }} aria-hidden />
          </div>
        </div>
      </Card>

      <Card className="border-teal ring-1 ring-teal">
        <div className="flex items-center justify-between gap-2">
          <Pill>Exam Pass</Pill>
          <span className="text-xs font-bold text-ink-soft">One payment · no subscription</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
          {onTrack ? "Stay at grade B or above until exam day" : "Close the gap to grade B"}
        </h2>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-black tracking-tight">{price}</span>
          <span className="pb-1.5 text-ink-soft">/ 8 weeks</span>
        </div>
        <ul className="mt-4 space-y-2 text-[15px]">
          {[
            "8 weeks of unlimited roleplays",
            "All scenarios",
            "Detailed OET-style feedback after every roleplay",
            exam ? "A practice plan built around your exam date" : "A practice plan to your exam date",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <span className="font-black text-teal">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-soft p-3 text-sm font-semibold text-[#13665c]">
          🛡️ 7-day money-back guarantee
        </div>
        {stage === "offer" && (
          <Button className="mt-4 w-full" onClick={openCheckout}>
            Get the Exam Pass · {price}
          </Button>
        )}
      </Card>

      <div ref={checkoutRef} className="scroll-mt-20">
        {stage === "contact" && (
          <Card>
            <div className="text-xs font-bold text-ink-soft">Step 1 of 2</div>
            <h2 className="mt-1 text-xl font-extrabold">Your contact details</h2>
            <form className="mt-3 space-y-3" onSubmit={submit} noValidate>
              <Field
                id="name"
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                id="whatsapp"
                label="WhatsApp number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={form.whatsapp}
                onChange={(v) => setForm({ ...form, whatsapp: v })}
              />
              {error && <p className="text-sm font-semibold text-[#b42318]">{error}</p>}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Saving…" : "Continue to payment →"}
              </Button>
              <p className="text-xs text-ink-soft">We&apos;ll only use these details to contact you about RoleSpeak.</p>
            </form>
          </Card>
        )}

        {stage === "reserved" && (
          <Card className="text-center">
            <div className="text-xs font-bold text-ink-soft">Step 2 of 2 · Payment</div>
            <div className="mt-3 text-4xl">🎉</div>
            <h2 className="mt-2 text-xl font-extrabold">Payments open soon</h2>
            <p className="mt-2 text-ink-soft">
              Your spot and launch price are reserved, we&apos;ll message you on WhatsApp.
            </p>
            <div className="mt-3 inline-block rounded-full bg-soft px-4 py-1.5 font-bold text-teal">
              Launch price reserved: {price}
            </div>
          </Card>
        )}
      </div>

      <Button variant="ghost" className="w-full" onClick={onBack}>
        ← Back to my feedback
      </Button>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 block min-h-[52px] w-full rounded-xl border border-[#c8dcd5] bg-white px-3 text-base"
        {...rest}
      />
    </div>
  );
}
