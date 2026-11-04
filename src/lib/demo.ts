// Demo mode (/practice?demo=1): Scenario A with scripted patient replies and
// a pre-written report. No API calls. Used for the live pitch and demo video.
import { finaliseReport, type ScoredReport } from "@/lib/scoring";
import { SCENARIOS } from "@/lib/scenarios";

/** Suggested nurse lines, shown as a prompt so the presenter can read them. */
export const DEMO_NURSE_LINES = [
  "Hello, I'm the practice nurse. Can you tell me when it started?",
  "Don't worry, it is not heart. It is asthma exacerbation.",
  "It means your asthma is worse. Did anything change at home?",
  "What medicine you are using now?",
  "You must take the brown inhaler every day, it is preventer. Use it with spacer, shake it, breathe slowly.",
  "Yes. If you cannot speak in sentences or the blue inhaler does not help, call ambulance.",
  "Come back in one week.",
];

/** Patient reply i is said after the nurse's i-th line. */
export const DEMO_PATIENT_REPLIES = [
  "It started two days ago. It's worse at night, I keep waking up coughing. Is it my heart? My dad had a heart attack.",
  "Asthma exa... sorry, what does that mean?",
  "Well, my sister's cat has been staying with me for about a week.",
  "I use my blue inhaler, maybe four or five times a day. I stopped the brown one about a month ago because I felt fine.",
  "Okay. So I need to take it even when I feel fine?",
  "Right, that's a bit scary, but okay. Thank you.",
  "Okay, one week. Thanks, Nurse.",
];

export const DEMO_FALLBACK_REPLY = "Okay. Is there anything else I should know?";

const tasks = SCENARIOS.breathless.tasks;

// Scores add up to 24 / 39 -> predicted 310 -> grade C+.
export const DEMO_REPORT: ScoredReport = finaliseReport({
  criteria: [
    { key: "intelligibility", score: 5, max: 6, comment: "Your words were clear and easy to follow throughout." },
    { key: "fluency", score: 4, max: 6, comment: "You kept the conversation moving, but some turns were very short and abrupt." },
    { key: "appropriateness", score: 3, max: 6, comment: "You used jargon like \"exacerbation\" and blunt instructions such as \"you must\"." },
    { key: "grammar_expression", score: 3, max: 6, comment: "Several questions were ungrammatical, e.g. \"What medicine you are using now?\"." },
    { key: "relationship_building", score: 2, max: 3, comment: "You introduced yourself, but did not show empathy when Alex was worried." },
    { key: "patient_perspective", score: 1, max: 3, comment: "You dismissed the fear about the heart instead of exploring it." },
    { key: "structure", score: 2, max: 3, comment: "You moved through topics logically, but never signposted or summarised." },
    { key: "information_gathering", score: 3, max: 3, comment: "Good: you uncovered the trigger at home and the stopped preventer." },
    { key: "information_giving", score: 1, max: 3, comment: "Your inhaler advice was rushed and you did not check Alex understood." },
  ],
  fixes: [
    {
      you_said: "Don't worry, it is not heart. It is asthma exacerbation.",
      better:
        "I can understand why you're worried, especially with your dad's history. From what you've told me, this sounds more like your asthma flaring up. Let's go through it together.",
      why: "Acknowledge the concern before reassuring, and replace jargon with everyday words.",
    },
    {
      you_said: "What medicine you are using now?",
      better: "Could you tell me which inhalers you're using at the moment, and how often?",
      why: "Correct question form plus an open question gets you more information.",
    },
    {
      you_said: "Come back in one week.",
      better:
        "So, to sum up: take your brown preventer every day with the spacer, and keep the blue one for when you're wheezy. Shall we book a check-up for next week to see how you're getting on?",
      why: "Summarise the plan and agree the follow-up instead of giving an order.",
    },
  ],
  tasks_covered: [
    { task: tasks[0], covered: true },
    { task: tasks[1], covered: false },
    { task: tasks[2], covered: true },
    { task: tasks[3], covered: true },
    { task: tasks[4], covered: false },
  ],
});
