import { useState } from "react";

const controls = ["Colour", "Type", "Spacing", "Radius", "Opacity"] as const;
const word = ["Founder’s", "Affair"];
const colors = ["#ede7d9", "#b8734a", "#0b3d2e", "#2e5748"];

/** Minimal, interactive studio-style landing hero. */
export function Hero() {
  const [active, setActive] = useState<(typeof controls)[number]>("Colour");

  return (
    <section id="top" className="theme-dark studio-hero" data-mode={active}>
      <div className="studio-hero__grid" aria-hidden="true" />
      <div className="studio-hero__meta label-mono">
        <span>Two-day business simulation</span>
        <span>Teams of five / Day 01—02</span>
      </div>
      <div className="studio-hero__center">
        <p className="studio-hero__index label-mono">A live business simulation</p>
        <h1 aria-label="Founder’s Affair">
          {word.map((line, lineIndex) => (
            <span className={`studio-word studio-word--${lineIndex + 1}`} key={line}>
              {Array.from(line).map((letter, index) => (
                <span
                  aria-hidden="true"
                  key={`${letter}-${index}`}
                  style={{ "--letter-color": colors[(index + lineIndex) % colors.length] } as React.CSSProperties}
                >
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="studio-hero__description">
          Teams of five build a company from the ground up. Make the calls, move the market, and
          make people believe in what you built.
        </p>
        <div className="studio-hero__actions">
          <a href="#how" className="studio-cta">Explore the simulation <span aria-hidden="true">↗</span></a>
          <a href="#contact" className="studio-link">Register your team <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      <div className="studio-experiment" aria-label="Interactive design token experiment">
        <div className="studio-experiment__sample" aria-hidden="true">
          <span>BUILD</span><i /><span>RUN</span><i /><span>FUND</span>
        </div>
        <p className="label-mono">Hover the letters. Tune the system.</p>
        <div role="group" aria-label="Design token controls">
          {controls.map((control) => (
            <button
              type="button"
              key={control}
              aria-pressed={active === control}
              onClick={() => setActive(control)}
            >
              <span aria-hidden="true">{{ Colour: "◉", Type: "Aa", Spacing: "↔", Radius: "▢", Opacity: "◒" }[control]}</span>
              <span>{control}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="studio-hero__bottom label-mono">
        <span>Acquire / Operate / Pitch / Get funded</span>
        <a href="#about" aria-label="Scroll to overview">Scroll to begin <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
