import Image from "next/image";
import Link from "next/link";
import LandingPreview from "@/components/landing/LandingPreview";
import LandingView from "@/components/landing/LandingView";
import "./landing-styles/landing.css";

// Converted from RoleSpeak_Landing_Page_With_Photos.html: same design and copy,
// with every main call-to-action pointing to /practice.

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
      <LandingView />
      <header>
        <div className="wrap">
          <nav>
            <a className="logo" href="#top">
              role<span>speak</span>
            </a>
            <div className="links">
              <a href="#why">Benefits</a>
              <a href="#try">Try a scenario</a>
              <a href="#how">How it works</a>
              <a href="#price">Pricing</a>
            </div>
            <Link className="btn" href="/practice">
              Try the preview →
            </Link>
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="tag">Medical English for real conversations</div>
              <h1>
                Your clinical skills can take you further.
                <br />
                <em>Let your English keep up.</em>
              </h1>
              <p className="lead">
                Your next opportunity could be an overseas hospital, an OET exam, or a conversation with a
                patient who needs reassurance. Practise speaking in realistic clinical situations — and prepare to
                show what you know with confidence.
              </p>
              <div className="actions">
                <Link className="btn" href="/practice">
                  Start your free practice →
                </Link>
                <a className="btn outline" href="#how">
                  How it works
                </a>
              </div>
              <p className="tiny">Interactive concept preview. Live AI voice practice is under development.</p>
              <div className="ticks">
                <span>Designed for healthcare roles</span>
                <span>Flexible practice</span>
                <span>Actionable feedback concept</span>
              </div>
            </div>
            <div className="photo-frame hero-photo">
              <Photo src="/images/hero-nurse.jpg" alt="Healthcare professional in teal scrubs" priority focus="50% 18%" />
              <div className="photo-caption">
                Your expertise deserves to be heard.
                <br />
                <span style={{ fontWeight: 400, color: "#59707b", fontSize: 12 }}>
                  Real conversations. Professional confidence. New possibilities.
                </span>
              </div>
            </div>
          </div>
        </div>

        <section id="why">
          <div className="wrap">
            <div className="center">
              <div className="tag">Why RoleSpeak</div>
              <h2>You&apos;re already trained to care. Now practise how to communicate it.</h2>
              <p className="lead">
                You shouldn&apos;t have to choose between expensive one-to-one speaking sessions and practising
                alone. RoleSpeak is designed to make realistic healthcare conversations easier to rehearse.
              </p>
            </div>
            <div className="cards">
              <div className="card">
                <div className="benefit-num">01 · RELEVANT</div>
                <div className="emoji">🩺</div>
                <h3>Practise your actual job</h3>
                <p>
                  Rehearse patient consultations, reassurance, history-taking and handovers — not generic textbook
                  dialogues.
                </p>
              </div>
              <div className="card">
                <div className="benefit-num">02 · FLEXIBLE</div>
                <div className="emoji">💬</div>
                <h3>Speak without the pressure</h3>
                <p>
                  Prepare for difficult questions in a private practice environment, at a time that works around
                  your shifts.
                </p>
              </div>
              <div className="card">
                <div className="benefit-num">03 · ACTIONABLE</div>
                <div className="emoji">📈</div>
                <h3>Know what to work on</h3>
                <p>
                  Get planned feedback on clarity, empathy and structure, with practical suggestions for your next
                  attempt.
                </p>
              </div>
              <div className="card">
                <div className="benefit-num">04 · GOAL-FOCUSED</div>
                <div className="emoji">🎯</div>
                <h3>Prepare with a purpose</h3>
                <p>
                  Build a speaking routine around an upcoming OET exam, interview or transition into an
                  English-speaking workplace.
                </p>
              </div>
            </div>
            <div className="photo-strip">
              <div className="photo-frame">
                <Photo src="/images/doctor.jpg" alt="Doctor in a white coat" focus="50% 25%" />
                <div className="photo-caption">For doctors</div>
              </div>
              <div className="photo-frame">
                <Photo src="/images/nurse.jpg" alt="Healthcare professional in blue scrubs" focus="50% 15%" />
                <div className="photo-caption">For nurses</div>
              </div>
              <div className="photo-frame">
                <Photo src="/images/global.jpg" alt="Doctor in green scrubs" focus="50% 15%" />
                <div className="photo-caption">For future global careers</div>
              </div>
            </div>
            <p className="section-note">
              Initial MVP focus: OET Speaking role-play for nurses. Doctor and student scenarios shown on this page
              illustrate possible future tracks.
            </p>
          </div>
        </section>

        <section className="tint" id="try">
          <LandingPreview />
        </section>

        <section className="outcomes" id="opportunities">
          <div className="wrap outcomes-grid">
            <div>
              <div className="tag" style={{ color: "#83ddc7" }}>
                Beyond the practice session
              </div>
              <h2>Don&apos;t let a language barrier limit where your career could go.</h2>
              <p className="lead">
                Medical expertise matters. So does the ability to explain it clearly, listen with empathy and
                respond under pressure. Consistent speaking practice can help you prepare for the moments that
                shape your professional future.
              </p>
              <div className="outcome-list">
                <div className="outcome-item">
                  <strong>🌍 Explore international roles</strong>
                  <span>Feel better prepared for English-language communication in overseas healthcare settings.</span>
                </div>
                <div className="outcome-item">
                  <strong>📋 Approach OET Speaking prepared</strong>
                  <span>Rehearse the structure and communication demands of a healthcare role-play.</span>
                </div>
                <div className="outcome-item">
                  <strong>🤝 Connect with patients</strong>
                  <span>Practise explaining care, responding to worries and building understanding.</span>
                </div>
                <div className="outcome-item">
                  <strong>🎙️ Speak up in interviews</strong>
                  <span>Build familiarity with discussing your experience and decisions in professional English.</span>
                </div>
              </div>
              <p className="eyebrow-note">
                These are intended learning outcomes, not guaranteed exam scores, job offers or career results.
              </p>
            </div>
            <div className="photo-frame" style={{ height: 540 }}>
              <Photo src="/images/outcomes.jpg" alt="Healthcare professional in a light uniform and headscarf" focus="50% 20%" />
              <div className="photo-caption">More confident conversations can open new possibilities.</div>
            </div>
          </div>
        </section>

        <section id="how">
          <div className="wrap">
            <div className="center">
              <div className="tag">How it works</div>
              <h2>Four steps from hesitation to practice.</h2>
              <p className="lead">A repeatable routine designed around the conversations that matter in healthcare.</p>
            </div>
            <div className="steps">
              <div className="step">
                <b>01</b>
                <h3>Choose your goal</h3>
                <p>Select a professional scenario or OET Speaking practice focus.</p>
              </div>
              <div className="step">
                <b>02</b>
                <h3>Prepare your approach</h3>
                <p>Review the patient&apos;s situation and organise what you want to communicate.</p>
              </div>
              <div className="step">
                <b>03</b>
                <h3>Speak with an AI patient</h3>
                <p>Work through a simulated clinical conversation, responding in your own words.</p>
              </div>
              <div className="step">
                <b>04</b>
                <h3>Get feedback &amp; repeat</h3>
                <p>Review your communication, identify three areas to improve and practise again.</p>
              </div>
            </div>
            <p className="section-note">
              The four-step experience describes the planned voice MVP. The interactive preview on this page uses
              text-based sample responses.
            </p>
          </div>
        </section>

        <section className="tint" id="price">
          <div className="wrap">
            <div className="center">
              <div className="tag">Proposed early-access offer</div>
              <h2>Focused practice, on your schedule.</h2>
            </div>
            <div className="pricing">
              <span className="pill">Planned offer · Not available to purchase yet</span>
              <h3>Medical English Practice Pass</h3>
              <div className="price">
                $79 <small>/ 8 weeks</small>
              </div>
              <p className="muted">Proposed one-time access for an intensive preparation period.</p>
              <ul>
                <li>Healthcare-focused patient role-plays</li>
                <li>Flexible, repeatable practice</li>
                <li>Planned structured communication feedback</li>
                <li>OET Speaking-oriented practice for eligible roles</li>
                <li>No automatic renewal planned</li>
              </ul>
              <Link className="btn" href="/practice">
                Express early-access interest →
              </Link>
              <p className="tiny">Price and features are proposals subject to validation. No payments are collected.</p>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <div className="center">
              <div className="tag">FAQs</div>
              <h2>Good questions, clear answers.</h2>
            </div>
            <div className="faq">
              <details>
                <summary>Is RoleSpeak only for nurses?</summary>
                <p>
                  No. The broader concept includes doctors and other healthcare professionals. The team&apos;s
                  initial live MVP focuses on nurse–patient OET Speaking role-plays; other tracks are planned.
                </p>
              </details>
              <details>
                <summary>Does RoleSpeak guarantee an OET score?</summary>
                <p>
                  No. Any AI feedback is for educational practice and is not an official score or guarantee of exam
                  performance.
                </p>
              </details>
              <details>
                <summary>Can I talk to an AI patient here?</summary>
                <p>
                  This page contains an interactive text preview. Live AI voice conversation will require connecting
                  the team&apos;s deployed MVP.
                </p>
              </details>
              <details>
                <summary>Is this affiliated with OET?</summary>
                <p>No. RoleSpeak is an independent educational concept and is not endorsed by OET.</p>
              </details>
            </div>
          </div>
        </section>

        <div className="final">
          <div className="wrap">
            <div className="tag" style={{ color: "#8cddcb" }}>
              Your words matter
            </div>
            <h2>
              Your next opportunity starts
              <br />
              with a conversation.
            </h2>
            <p>
              Build the confidence to communicate your clinical expertise in English — one realistic scenario at a
              time.
            </p>
            <Link className="btn" href="/practice">
              Try the preview →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
