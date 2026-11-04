// Tiny analytics shim. Logs every event to the console and forwards it to
// Meta Pixel / Google Analytics when those scripts are on the page.
// To enable them, add the official snippets in src/app/layout.tsx
// (see the commented placeholders there).

export type AnalyticsEvent =
  | "landing_view"
  | "scenario_selected"
  | "roleplay_started"
  | "roleplay_completed"
  | "feedback_viewed"
  | "paywall_viewed"
  | "contact_submitted"
  | "payment_viewed";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  console.info("[analytics]", event, props);
  try {
    window.fbq?.("trackCustom", event, props); // Meta Pixel placeholder
    window.gtag?.("event", event, props); // Google Analytics placeholder
  } catch {
    /* never let analytics break the app */
  }
}
