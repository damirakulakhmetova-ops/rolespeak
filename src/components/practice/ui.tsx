import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Scenario } from "@/lib/scenarios";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }) {
  const base =
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-teal text-white hover:bg-teal-dark",
    outline: "border border-[#c2d7d0] bg-white text-ink hover:border-teal",
    ghost: "text-teal underline-offset-4 hover:underline",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-5 shadow-[0_12px_35px_#173d3a0b] ${className}`}>
      {children}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <div className="text-xs font-extrabold tracking-[1.5px] text-teal uppercase">{children}</div>;
}

export function Pill({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "sky" | "amber" }) {
  const t = {
    teal: "bg-soft text-[#08776e]",
    sky: "bg-sky text-sky-ink",
    amber: "bg-[#fff4e0] text-[#8a5a00]",
  }[tone];
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${t}`}>{children}</span>;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function RoleCard({ scenario, compact = false }: { scenario: Scenario; compact?: boolean }) {
  return (
    <Card className={compact ? "p-4" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tag>Nurse role card</Tag>
        <Pill tone="sky">{scenario.place}</Pill>
      </div>
      <h3 className={`mt-2 font-extrabold tracking-tight ${compact ? "text-lg" : "text-xl"}`}>{scenario.title}</h3>
      <dl className={`mt-2 space-y-1 text-ink-soft ${compact ? "text-sm" : "text-[15px]"}`}>
        <div>
          <dt className="inline font-bold text-ink">Setting: </dt>
          <dd className="inline">{scenario.setting}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-ink">Patient: </dt>
          <dd className="inline">{scenario.patient}</dd>
        </div>
      </dl>
      <div className={`mt-3 font-bold ${compact ? "text-sm" : ""}`}>Tasks</div>
      <ul className={`mt-1 space-y-1.5 ${compact ? "text-sm" : "text-[15px]"}`}>
        {scenario.tasks.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-[2px] font-black text-teal">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-soft border-t-teal" />
      <div className="font-semibold text-ink-soft">{label}</div>
    </div>
  );
}
