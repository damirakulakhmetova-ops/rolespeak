# RoleSpeak

**You know medicine. Speak it with confidence.**

RoleSpeak is an AI patient for rehearsing the **OET Speaking roleplay**. You play the nurse, an AI plays the patient by voice, and in about 10 minutes you get OET-style feedback on all 9 Speaking criteria, a predicted score and grade, and three concrete fixes for your next attempt.

> For language practice only. Not medical advice. Not affiliated with OET. Predicted scores are practice estimates, not official OET results.

## Who it is for

Nurses aged 24–35 from India, the Philippines and Nigeria preparing for OET Speaking (target grade **B**, which the NMC requires), with the exam 4–12 weeks away. Most of them practise on their phones, so the app is mobile-first.

## User flow

1. **Setup**: country (India / Philippines / Nigeria / Other), exam date ("Your exam is in X days") and a scenario:
   - **A. Breathless patient** (Community clinic), the default
   - **B. Refusing to walk after surgery** (Hospital ward)
2. **Prepare**: the nurse role card and a 3:00 countdown, like the real OET. Button "I'm ready".
3. **Roleplay**: 5:00 timer, the role card stays visible, a big push-to-talk mic button, and the patient speaks first. A live transcript shows both sides. You can switch to typing or end early, and the roleplay ends automatically at 0:00.
4. **Feedback**: predicted score (0–500) and grade, the 9 OET criteria (Strong / Developing / Needs work, with a bar and a one-line comment), a checklist of the role card tasks you covered or missed, and "3 fixes for your next attempt".
5. **Gap screen and paywall**: your grade compared with the grade B target, then the **Exam Pass** (8 weeks of unlimited roleplays, ₹3,999 in India, $79 elsewhere). Checkout has two steps: contact details are saved as a lead, then a "payments open soon" fake door.

## Screenshots

_Add screenshots here (landing, roleplay, feedback, paywall)._

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**, deployed on **Vercel** (free tier)
- **Google Gemini API**, called **only** from server route handlers (`/api/patient`, `/api/score`). The API key never reaches the browser.
- **Speech to text**: the browser Web Speech API (`en-GB`), push-to-talk. Unsupported browsers show "Voice works best in Chrome" and fall back to typing.
- **Patient voice**: the browser `speechSynthesis` (a British English voice when one is available)
- **No database**: results are kept in `localStorage`, and leads are `POST`ed to `/api/lead` and logged (a placeholder for a CRM)

### Project structure

```
src/
  app/
    page.tsx                 Landing "/" (converted from the original landing HTML)
    practice/page.tsx        The app "/practice"
    api/patient/route.ts     AI patient reply (Gemini)
    api/score/route.ts       OET-style assessment (Gemini, JSON, validated, one retry)
    api/lead/route.ts        Lead capture (logs; CRM placeholder)
  components/practice/       Setup, Prepare, Roleplay, Feedback, Gap (paywall)
  lib/
    scenarios.ts             Role cards (client-safe)
    server/patientPrompts.ts Patient prompts (server-only)
    server/gemini.ts         Gemini REST client with retries and a fallback model
    scoring.ts               Criteria, score formula, grades, report validation
    speech.ts                Push-to-talk recognition + speech synthesis
    demo.ts                  Scripted demo conversation and report
    analytics.ts             Event shim (console + Meta Pixel / GA placeholders)
```

### Scoring

The assessor returns 4 linguistic criteria (0–6 each) and 5 clinical communication criteria (0–3 each), 39 points in total.

- `predicted = round(total / 39 * 500 / 10) * 10`
- Grades: A 450–500 · B 350–440 · C+ 300–340 · C 200–290 · D 100–190 · E 0–90
- Level labels: ≥ 67% of the criterion's maximum is **Strong**, ≥ 40% is **Developing**, anything lower is **Needs work**

## Run locally

Requirements: Node.js 20+ and a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/damirakulakhmetova-ops/rolespeak.git
cd rolespeak
npm install
cp .env.example .env.local   # then paste your key into .env.local
npm run dev
```

Open http://localhost:3000 (landing) and http://localhost:3000/practice (app). Use **Chrome** for voice. Other browsers fall back to typing.

## Environment variables

| Variable | Required | Default | What it does |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | yes | — | Google Gemini API key. Read only on the server. |
| `GEMINI_MODEL` | no | `gemini-3.6-flash` | Model for the patient and the assessor. |
| `GEMINI_FALLBACK_MODEL` | no | `gemini-3.5-flash-lite` | Used automatically when the main model is out of quota or overloaded. |

`.env.local` is gitignored. Never commit a real key.

> **Quota note:** the Gemini **free tier** allows only a small number of requests per model per day (20 for `gemini-3.6-flash` when we tested). One roleplay uses about 10–15 requests: one per patient reply plus one for scoring. For a pitch or real users, turn on billing for the project in Google AI Studio (Tier 1).

## Demo mode

Open **`/practice?demo=1`**. It runs Scenario A with scripted patient replies and a pre-written realistic report (grade **C+, 310**) and makes **no API calls**. A "Demo script" prompt shows the next nurse line: read it aloud or tap **Use**. Use this mode as the backup for the live pitch and for recording the demo video.

## Analytics

These events are logged to the console and forwarded to Meta Pixel (`window.fbq`) and Google Analytics (`window.gtag`) when those snippets are added in `src/app/layout.tsx`:

`landing_view`, `scenario_selected`, `roleplay_started`, `roleplay_completed`, `feedback_viewed`, `paywall_viewed`, `contact_submitted`, `payment_viewed`

## Live links

- Landing: https://rolespeak.vercel.app/
- App: https://rolespeak.vercel.app/practice
- Demo: https://rolespeak.vercel.app/practice?demo=1

## Team

_Add team members and roles here._

---

This is a practice estimate, not an official OET score. We do not guarantee a score, exam result, employment or registration.
