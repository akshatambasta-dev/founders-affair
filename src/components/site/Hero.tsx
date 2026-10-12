import { useState } from "react";

const loop = [
  {
    label: "01 / DECISION",
    title: "Make the call.",
    copy: "A team decision sets the company in motion.",
    path: "M12 112 C48 102 55 124 88 91 S137 93 166 61 S210 70 246 36 S294 53 338 18",
  },
  {
    label: "02 / MARKET",
    title: "Read the room.",
    copy: "The simulated market responds to what the company does.",
    path: "M12 112 C43 124 59 73 91 86 S141 113 170 70 S211 84 248 48 S293 70 338 18",
  },
  {
    label: "03 / RESPONSE",
    title: "Move together.",
    copy: "The team sees the result, then chooses its next move.",
    path: "M12 112 C42 92 59 110 89 78 S135 86 170 56 S210 65 248 31 S297 47 338 18",
  },
];

/** Immediate brand-first hero with an interactive view of the simulation loop. */
export function Hero() {
  const [active, setActive] = useState(0);
  const step = loop[active];

  return (
    <section id="top" className="theme-dark fa-hero">
      <div className="fa-hero__frame">
        <div className="fa-hero__eyebrow label-mono">
          <span>Founder&apos;s Affair</span>
          <span className="fa-live"><i aria-hidden="true" /> Two-day business simulation</span>
        </div>

        <div className="fa-hero__main">
          <div className="fa-hero__copy">
            <p className="fa-kicker label-mono"><span>01</span> The company is yours to run</p>
            <h1 className="fa-hero__title">
              Founder&apos;s
              <br />
              <em>Affair.</em>
            </h1>
            <p className="fa-hero__description">
              Teams of five take C-suite roles and spend two days building, deciding, surviving
              crises, moving their stock, and convincing investors to fund them.
            </p>
            <div className="fa-hero__actions">
              <a href="#how" className="fa-button fa-button--copper" data-cursor="cta">
                Enter the simulation <span aria-hidden="true">↗</span>
              </a>
              <a href="#about" className="fa-text-link">See how it works <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <div className="fa-instrument" aria-label="Interactive simulation feedback loop">
            <div className="fa-instrument__top label-mono">
              <span>Simulation loop</span>
              <span>Day 01 — Day 02</span>
            </div>
            <div className="fa-instrument__visual" aria-hidden="true">
              <div className="fa-orbit fa-orbit--outer" />
              <div className="fa-orbit fa-orbit--inner" />
              <div className="fa-orbit__core"><span>FA</span></div>
              <span className="fa-orbit__node fa-orbit__node--one">DECIDE</span>
              <span className="fa-orbit__node fa-orbit__node--two">BUILD</span>
              <span className="fa-orbit__node fa-orbit__node--three">PITCH</span>
              <svg className="fa-signal" viewBox="0 0 350 132" fill="none" role="presentation">
                <path className="fa-signal__baseline" d="M5 120H345" />
                <path key={active} className="fa-signal__line" pathLength="1" d={step.path} />
                <circle className="fa-signal__dot" cx="338" cy="18" r="5" />
              </svg>
            </div>
            <div className="fa-instrument__readout" aria-live="polite" aria-atomic="true">
              <span className="label-mono">{step.label}</span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </div>
            <div className="fa-instrument__steps" role="group" aria-label="Choose a simulation step">
              {loop.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={active === i}
                  aria-label={`Show ${item.label.toLowerCase()}`}
                  onClick={() => setActive(i)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fa-hero__footer label-mono">
          <span>Build it. Run it. Move it. Sell it. Fund it.</span>
          <a href="#how"><span className="fa-scroll-dot" /> Scroll to explore</a>
          <span className="fa-hero__index">01 <i /> 08</span>
        </div>
      </div>
    </section>
  );
}
