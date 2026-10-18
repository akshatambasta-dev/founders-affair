import { useEffect, useRef, useState } from "react";

const chapters = [
  {
    eyebrow: "The entrepreneurial instinct",
    line: "Ideas are easy.",
    accent: "Execution is everything.",
    note: "A live business simulation where decisions have consequences.",
  },
  {
    eyebrow: "Build something that matters",
    line: "Make a move.",
    accent: "Change the market.",
    note: "Teams become companies, take executive roles, and navigate uncertainty together.",
  },
  {
    eyebrow: "From concept to conviction",
    line: "Find your people.",
    accent: "Make them believe.",
    note: "Build a brand, pitch your company, and compete for simulated investor backing.",
  },
];

/** Scroll-tied editorial opening inspired by the supplied motion reference. */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.max(1, section.offsetHeight - window.innerHeight);
        setProgress(Math.max(0, Math.min(1, -rect.top / distance)));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener?.("change", updateMotion);
    };
  }, []);

  const chapterIndex = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  const chapter = chapters[chapterIndex];
  const sceneStyle = {
    "--scroll-progress": progress,
    "--scene-scale": reducedMotion ? 1 : 1 + progress * 0.12,
    "--scene-y": reducedMotion ? 0 : progress * -5,
  } as React.CSSProperties;

  return (
    <section id="top" ref={sectionRef} className="fa-scroll-hero theme-dark" style={sceneStyle}>
      <div className="fa-scroll-sticky">
        <div className="fa-scene" aria-hidden="true">
          <div className="fa-scene__grain" />
          <div className="fa-scene__ring fa-scene__ring--outer" />
          <div className="fa-scene__ring fa-scene__ring--mid" />
          <div className="fa-scene__ring fa-scene__ring--inner" />
          <div className="fa-scene__core">
            <div className="fa-scene__core-inner" />
          </div>
          <div className="fa-scene__shard fa-scene__shard--one" />
          <div className="fa-scene__shard fa-scene__shard--two" />
          <div className="fa-scene__shard fa-scene__shard--three" />
          <div className="fa-scene__shard fa-scene__shard--four" />
        </div>

        <div className="fa-scroll-top label-mono">
          <span className="fa-eic-mark" aria-label="Entrepreneurship & Innovation Cell">
            <span className="fa-eic-mark__symbol">EIC</span>
            <span className="fa-eic-mark__label">Entrepreneurship<br />& Innovation Cell</span>
          </span>
          <span>Business Conclave <i> / </i> 01—03</span>
        </div>

        <div className="fa-scroll-copy" key={chapterIndex}>
          <p className="fa-scroll-eyebrow label-mono">{chapter.eyebrow}</p>
          <h1 aria-label="Founders' Affair">
            <span>{chapter.line}</span>
            <em>{chapter.accent}</em>
          </h1>
          <p className="fa-scroll-note">{chapter.note}</p>
          <div className="fa-scroll-actions">
            <a href="#about" className="studio-cta">Discover the conclave <span aria-hidden="true">↗</span></a>
            <a href="#how" className="studio-link">How it works <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <div className="fa-scroll-bottom label-mono">
          <span>FOUNDERS’ AFFAIR <i>—</i> A BUSINESS CONCLAVE</span>
          <span className="fa-scroll-progress"><i style={{ transform: `scaleX(${progress})` }} /></span>
          <span>{String(Math.round(progress * 100)).padStart(3, "0")}<i> / 100</i></span>
        </div>
        <a className="fa-scroll-cue label-mono" href="#about" aria-label="Scroll to learn more"><span /> Scroll to explore</a>
      </div>
    </section>
  );
}
