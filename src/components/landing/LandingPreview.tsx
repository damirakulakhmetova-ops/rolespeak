"use client";

// Interactive text preview from the original landing page, ported to React.
import { useState } from "react";

type Role = "doctor" | "nurse" | "student";
type Answer = [text: string, feedback: string, correct: 0 | 1];

const DATA: Record<Role, { title: string; info: string; prompt: string; answers: Answer[] }> = {
  doctor: {
    title: "Doctor · Patient consultation",
    info: "Practise consultations, questions, and patient reassurance.",
    prompt: "“I have been dizzy all week. Do you think it is serious?”",
    answers: [
      ["“You should not worry. It is probably nothing.”", "Avoid dismissing the patient’s concerns before assessment.", 0],
      ["“I understand this is worrying. Could you tell me when it started?”", "Strong response: acknowledges concern and invites further information.", 1],
      ["“There are many differential diagnoses.”", "Use accessible language and explain your next steps.", 0],
    ],
  },
  nurse: {
    title: "Nurse · Patient reassurance",
    info: "Practise patient reassurance and explaining care steps.",
    prompt: "“I am nervous about the procedure. Will it hurt?”",
    answers: [
      ["“There is nothing to be nervous about.”", "Acknowledge the patient’s feelings rather than dismissing them.", 0],
      ["“It is routine. Please do not ask questions.”", "Encourage questions and explain what to expect.", 0],
      ["“It is understandable to feel nervous. Would you like me to explain what will happen?”", "Strong response: shows empathy and invites the patient into the conversation.", 1],
    ],
  },
  student: {
    title: "Medical student · History-taking",
    info: "Practise clear questions and active listening.",
    prompt: "“I have had this cough for a while.”",
    answers: [
      ["“What exactly is wrong with you?”", "Try a more open and supportive question.", 0],
      ["“Could you tell me more about your cough and when it began?”", "Strong response: invites a fuller history without jumping to conclusions.", 1],
      ["“You probably have an infection.”", "Avoid premature assumptions before gathering information.", 0],
    ],
  },
};

const ROLES: [Role, string][] = [
  ["doctor", "Doctor"],
  ["nurse", "Nurse"],
  ["student", "Medical student"],
];

export default function LandingPreview() {
  const [role, setRole] = useState<Role>("doctor");
  const [picked, setPicked] = useState<number | null>(null);
  const s = DATA[role];
  const chosen = picked !== null ? s.answers[picked] : null;

  return (
    <div className="wrap practice-grid">
      <div>
        <div className="tag">Interactive preview</div>
        <h2>Try a conversation before the real one.</h2>
        <p className="lead">
          Choose your role and respond to a patient. Get an example of the kind of communication feedback we&apos;re
          building.
        </p>
        <div className="tabs" role="tablist">
          {ROLES.map(([r, label]) => (
            <button
              key={r}
              role="tab"
              aria-selected={r === role}
              className={`tab${r === role ? " active" : ""}`}
              onClick={() => {
                setRole(r);
                setPicked(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="muted">{s.info}</p>
      </div>
      <div className="scenario">
        <span className="pill">Interactive scenario</span>
        <h3>{s.title}</h3>
        <div className="question">{s.prompt}</div>
        <p className="muted">Which response communicates most clearly and empathetically?</p>
        <div>
          {s.answers.map((a, i) => (
            <button key={a[0]} className={`choice${picked === i ? " active" : ""}`} onClick={() => setPicked(i)}>
              {a[0]}
            </button>
          ))}
        </div>
        <div aria-live="polite" className={`feedback${chosen ? " show" : ""}`}>
          {chosen ? (chosen[2] ? "✓ " : "Learning tip: ") + chosen[1] : ""}
        </div>
        <p className="tiny">Educational preview only. Not clinical advice or an official OET assessment.</p>
      </div>
    </div>
  );
}
