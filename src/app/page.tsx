import Image from "next/image";
import Link from "next/link";
import { BlackFridayBar, BlackFridayScript } from "@/components/landing/BlackFriday";
import LandingPreview from "@/components/landing/LandingPreview";
import LandingView from "@/components/landing/LandingView";
import Pricing from "@/components/landing/Pricing";
import "./landing-styles/landing.css";

// Design converted from RoleSpeak_Landing_Page_With_Photos.html. Every primary
// call-to-action points to /practice with the same label.

function MainCta() {
  return (
    <Link className="btn big" href="/practice">
      Get my free score in 5 minutes
    </Link>
  );
}

// Portrait photos in wide frames: anchor the crop near the top so faces stay visible.
function Photo({
  src,
  alt,
  priority,
  focus = "50% 20%",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  focus?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 800px) 100vw, 560px"
      priority={priority}
      style={{ objectPosition: focus }}
    />
  );
}

export default function Home() {
  return (
    <div className="lp">
      <BlackFridayScript />
      <LandingView />
      <header>
        <BlackFridayBar />
        <div className="wrap">
          <nav>
            <a className="logo" href="#top">
              role<span>speak</span>
            </a>
            <div className="links">
              <a href="#why">Why it matters</a>
              <a href="#try">Try a scenario</a>
              <a href="#how">How it works</a>
              <a href="#vs-tutor">vs a tutor</a>
              <a href="#pricing">Pricing</a>
            </div>
            <Link className="btn outline nav-btn" href="/practice">
              Try the preview →
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="tag">OET Speaking practice for nurses</div>
              <h1>
                Your clinical skills can take you abroad.{" "}
                <em>Don&apos;t let one Speaking exam hold you back.</em>
              </h1>
              <p className="lead">
                Practise the real OET role-play with an AI patient. Get a score on all 9 official criteria, a
                predicted grade and 3 fixes — in 5 minutes.
              </p>
              <div className="actions">
                <MainCta />
                <a className="text-link" href="#pricing">
                  See plans →
                </a>
              </div>
              <p className="micro">Free first role-play · No card needed · Works best in Chrome</p>
              <p className="trust">
                Built around the 9 official OET Speaking criteria. The score is a practice estimate, not an official
                OET result.
              </p>
            </div>
            <div className="photo-frame hero-photo">
              <Photo src="/images/hero-nurse.jpg" alt="Nurse in teal scrubs smiling" priority focus="50% 18%" />
              <div className="photo-caption">
                Your expertise deserves to be heard.
                <br />
                <span style={{ fontWeight: 400, color: "#59707b", fontSize: 12 }}>
                  Real OET role-plays. Clear feedback. New possibilities.
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="outcomes" id="why">
          <div className="wrap outcomes-grid">
            <div>
              <div className="tag" style={{ color: "#83ddc7" }}>
                Why it matters
              </div>
              <h2>Same nursing skills. A very different career.</h2>
              <div className="stats">
                <div className="stat">
                  <div className="stat-num">≈ $690 / month</div>
                  <p>Entry-level government nurse in the Philippines (gross basic pay)</p>
                </div>
                <div className="stat stat-hi">
                  <div className="stat-num">≈ $3,600 / month</div>
                  <p>New Band 5 nurse in England (gross)</p>
                </div>
              </div>
              <p className="lead">
                The gap is often one Speaking exam. OET costs ≈ $410, and a retake of one part ≈ $220.
              </p>
              <div className="actions">
                <MainCta />
              </div>
              <p className="eyebrow-note">
                Gross pay before tax and living costs. Sources: NHS Agenda for Change 2026/27, Band 5 entry
                £32,073/yr; Philippines Salary Grade 15 (Nurse I) 2026, ₱42,178/month; FX Nov 2026. RoleSpeak does not
                guarantee a pass, a job, registration or relocation.
              </p>
            </div>
            <div className="photo-frame why-photo">
              <Photo
                src="/images/outcomes.jpg"
                alt="Nurse in a light uniform and headscarf"
                focus="50% 20%"
              />
              <div className="photo-caption">Your next patient conversation could be abroad.</div>
            </div>
          </div>
        </section>

        <section id="benefits">
          <div className="wrap">
            <div className="center">
              <div className="tag">Why RoleSpeak</div>
              <h2>You&apos;re already trained to care. Now practise how to communicate it.</h2>
              <p className="lead">
                You shouldn&apos;t have to choose between expensive one-to-one sessions and practising alone.
                RoleSpeak gives you a realistic OET patient whenever you have 10 minutes.
              </p>
            </div>
            <div className="cards">
              <div className="card">
                <div className="benefit-num">01 · REAL FORMAT</div>
                <div className="emoji">🩺</div>
                <h3>The real OET role-play</h3>
                <p>Read a role card for 3 minutes, then speak with an AI patient for 5 — just like exam day.</p>
              </div>
              <div className="card">
                <div className="benefit-num">02 · FLEXIBLE</div>
                <div className="emoji">💬</div>
                <h3>Speak without the pressure</h3>
                <p>Practise difficult conversations in private, at a time that works around your shifts.</p>
              </div>
              <div className="card">
                <div className="benefit-num">03 · ACTIONABLE</div>
                <div className="emoji">📈</div>
                <h3>Know what to work on</h3>
                <p>A score on all 9 OET Speaking criteria, a predicted grade and 3 fixes after every role-play.</p>
              </div>
              <div className="card">
                <div className="benefit-num">04 · GOAL-FOCUSED</div>
                <div className="emoji">🎯</div>
                <h3>Prepare for your date</h3>
                <p>Set your exam date and build a speaking routine for the weeks before it.</p>
              </div>
            </div>
            <div className="photo-strip">
              <div className="photo-frame">
                <Photo src="/images/nurse.jpg" alt="Nurse in blue scrubs" focus="50% 15%" />
                <div className="photo-caption">For nurses</div>
              </div>
              <div className="photo-frame">
                <Photo src="/images/doctor.jpg" alt="Doctor in a white coat" focus="50% 25%" />
                <div className="photo-caption">For doctors (coming later)</div>
              </div>
              <div className="photo-frame">
                <Photo src="/images/global.jpg" alt="Healthcare professional in green scrubs" focus="50% 15%" />
                <div className="photo-caption">For future global careers</div>
              </div>
            </div>
          </div>
        </section>

        <section className="tint" id="try">
          <LandingPreview />
          <div className="wrap center-cta">
            <MainCta />
          </div>
        </section>

        <section id="how">
          <div className="wrap">
            <div className="center">
              <div className="tag">How it works</div>
              <h2>Four steps from hesitation to practice.</h2>
              <p className="lead">A repeatable routine built around the OET Speaking role-play.</p>
            </div>
            <div className="steps">
              <div className="step">
                <b>01</b>
                <h3>Choose your goal</h3>
                <p>Pick your country, exam date and a nursing scenario.</p>
              </div>
              <div className="step">
                <b>02</b>
                <h3>Prepare your approach</h3>
                <p>Read the role card for 3 minutes, as in the real exam.</p>
              </div>
              <div className="step">
                <b>03</b>
                <h3>Speak with an AI patient</h3>
                <p>A 5-minute voice role-play in your own words.</p>
              </div>
              <div className="step">
                <b>04</b>
                <h3>Get feedback &amp; repeat</h3>
                <p>See your score on 9 criteria, a predicted grade and 3 fixes — then practise again.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tint" id="vs-tutor">
          <div className="wrap">
            <div className="center">
              <div className="tag">AI practice vs a tutor</div>
              <h2>$79 buys one hour with a tutor — or 8 weeks of practice.</h2>
            </div>
            <div className="compare">
              <div className="cmp">
                <h3>OET tutor 1:1</h3>
                <div className="cmp-price">$20–66 per hour</div>
                <p>Human feedback, limited hours, scheduling.</p>
              </div>
              <div className="cmp">
                <h3>Expert Speaking review</h3>
                <div className="cmp-price">$99</div>
                <p>One assessment.</p>
              </div>
              <div className="cmp">
                <h3>AI patient apps by subscription</h3>
                <div className="cmp-price">from $39.99 per month</div>
                <p>Auto-renewal.</p>
              </div>
              <div className="cmp cmp-hi">
                <span className="badge">RoleSpeak</span>
                <h3>RoleSpeak Exam Pass</h3>
                <div className="cmp-price">$79 once for 8 weeks</div>
                <p>Unlimited role-plays, any time. ≈ $3.30 per role-play at 3 a week.</p>
              </div>
            </div>
            <p className="lead center-text compare-line">
              A tutor gives human judgement. RoleSpeak gives you the repetitions. Want both? Pro includes a teacher
              review of your recording.
            </p>
            <p className="section-note">
              Marketplace OET tutors $20–35/h; Specialist Language Courses 5 × 1-hour lessons $329; E2Language 1:1
              Speaking assessment $99; OET Live from $39.99/month. Prices checked Nov 2026.
            </p>
          </div>
        </section>

        <section id="pricing">
          <div className="wrap">
            <div className="center">
              <div className="tag">Pricing</div>
              <h2>Choose your exam plan</h2>
              <p className="lead">One payment. No subscription. No auto-renewal.</p>
              <span className="pill">
                Payments open soon. Reserve your plan now — we&apos;ll email you when checkout opens.
              </span>
            </div>
            <Pricing />
          </div>
        </section>

        <section className="tint" id="faq">
          <div className="wrap">
            <div className="center">
              <div className="tag">FAQs</div>
              <h2>Good questions, clear answers.</h2>
            </div>
            <div className="faq">
              <details>
                <summary>Is the score official?</summary>
                <p>
                  No. It is a practice estimate based on the 9 official OET Speaking criteria. Only OET issues
                  official results.
                </p>
              </details>
              <details>
                <summary>Do you guarantee a pass, a job or a visa?</summary>
                <p>No. We help you practise; results depend on you, the exam and your employer.</p>
              </details>
              <details>
                <summary>Can I talk to an AI patient here?</summary>
                <p>
                  Yes. The free role-play is a live voice conversation with an AI patient. It works best in Chrome
                  with microphone access.
                </p>
              </details>
              <details>
                <summary>Why one payment instead of a subscription?</summary>
                <p>
                  Your preparation has an exam date. Pay once for the time you need, with no auto-renewal.
                </p>
              </details>
              <details>
                <summary>Why 8 weeks?</summary>
                <p>
                  Most nurses prepare 4–12 weeks before the exam; 8 weeks covers a typical preparation cycle.
                </p>
              </details>
              <details className="bf-only">
                <summary>What is the Black Friday offer?</summary>
                <p>Pro (3 months + a teacher&apos;s review) for $79 instead of $149, Nov 27 – Dec 1.</p>
              </details>
              <details>
                <summary>Is RoleSpeak only for nurses?</summary>
                <p>
                  For now, yes: RoleSpeak focuses on nurse–patient OET Speaking role-plays. Other healthcare tracks
                  are planned.
                </p>
              </details>
              <details>
                <summary>Is this affiliated with OET?</summary>
                <p>No. RoleSpeak is an independent practice tool and is not endorsed by OET.</p>
              </details>
            </div>
          </div>
        </section>

        <div className="final">
          <div className="wrap">
            <h2>Your next patient conversation could be in London.</h2>
            <p>Start with a free role-play and see your predicted grade today.</p>
            <MainCta />
          </div>
        </div>
      </main>
    </div>
  );
}
