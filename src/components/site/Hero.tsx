import { useEffect, useRef, useState, type CSSProperties } from "react";
import { StoryTunnelScene } from "@/components/site/StoryTunnelScene";

type Chapter = "opening" | "brand" | "manifesto" | "roles" | "days" | "steps" | "finale";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const chapterRanges: Record<Chapter, [number, number]> = {
  opening: [0, 0.095],
  brand: [0.095, 0.27],
  manifesto: [0.27, 0.405],
  roles: [0.405, 0.535],
  days: [0.535, 0.665],
  steps: [0.665, 0.835],
  finale: [0.835, 1],
};

function getChapter(progress: number): Chapter {
  if (progress < chapterRanges.brand[0]) return "opening";
  if (progress < chapterRanges.manifesto[0]) return "brand";
  if (progress < chapterRanges.roles[0]) return "manifesto";
  if (progress < chapterRanges.days[0]) return "roles";
  if (progress < chapterRanges.steps[0]) return "days";
  if (progress < chapterRanges.finale[0]) return "steps";
  return "finale";
}

function getChapterProgress(progress: number, chapter: Chapter) {
  const [start, end] = chapterRanges[chapter];
  return clamp01((progress - start) / (end - start));
}

function revealStyle(
  progress: number,
  start: number,
  end: number,
  exitStart = 0.88,
  exitEnd = 0.99,
): CSSProperties {
  const entering = smoothStep(start, end, progress);
  const exiting = smoothStep(exitStart, exitEnd, progress);
  const opacity = entering * (1 - exiting);
  const translateY = (1 - entering) * 18 - exiting * 10;
  const blur = (1 - entering) * 5 + exiting * 3;
  return {
    opacity,
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
    filter: `blur(${blur.toFixed(1)}px)`,
    willChange: "opacity, transform, filter",
  };
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const audioRef = useRef<{
    context: AudioContext;
    gain: GainNode;
    oscillators: OscillatorNode[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  reducedMotionRef.current = reducedMotion;
  const chapter = getChapter(progress);
  const chapterProgress = getChapterProgress(progress, chapter);
  const sceneStyle = { "--journey-progress": progress } as CSSProperties;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const next = clamp01(-rect.top / travel);
        progressRef.current = next;
        setProgress((current) => Math.abs(current - next) > 0.0025 ? next : current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener?.("change", updateMotion);
    };
  }, []);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.oscillators.forEach((oscillator) => {
      try { oscillator.stop(); } catch {}
    });
    void audio.context.close();
  }, []);

  const toggleSound = async () => {
    const next = !soundEnabled;
    try {
      let audio = audioRef.current;
      if (!audio && next) {
        const audioConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!audioConstructor) return;
        const context = new audioConstructor();
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        const low = context.createOscillator();
        const high = context.createOscillator();
        low.type = "sine";
        high.type = "triangle";
        low.frequency.value = 54;
        high.frequency.value = 81;
        const lowGain = context.createGain();
        const highGain = context.createGain();
        lowGain.gain.value = 0.7;
        highGain.gain.value = 0.13;
        low.connect(lowGain);
        high.connect(highGain);
        lowGain.connect(gain);
        highGain.connect(gain);
        low.start();
        high.start();
        audio = { context, gain, oscillators: [low, high] };
        audioRef.current = audio;
      }
      if (audio) {
        await audio.context.resume();
        audio.gain.gain.setTargetAtTime(next ? 0.022 : 0, audio.context.currentTime, 0.28);
      }
      setSoundEnabled(next);
    } catch (error) {
      console.warn("Ambient sound could not be started.", error);
      setSoundEnabled(false);
    }
  };

  return (
    <section id="top" ref={sectionRef} className="fa-scroll-hero fa-journey-hero theme-dark" style={sceneStyle}>
      <div className="fa-scroll-sticky fa-journey-sticky">
        <div className="fa-tunnel-fallback" aria-hidden="true">
          <div className="fa-fallback-ring fa-fallback-ring--one" />
          <div className="fa-fallback-ring fa-fallback-ring--two" />
          <div className="fa-fallback-ring fa-fallback-ring--three" />
          <div className="fa-fallback-core" />
        </div>
        <StoryTunnelScene progressRef={progressRef} reducedMotionRef={reducedMotionRef} />
        <div className="fa-journey-shade" aria-hidden="true" style={{ opacity: 0.16 + smoothStep(0.08, 0.27, progress) * 0.74 - smoothStep(0.84, 0.97, progress) * 0.26 }} />
        <div className="fa-journey-top label-mono">
          <a href="#top" className="fa-journey-wordmark" aria-label="Founders’ Affair — return to opening">FA<span> / </span>EIC</a>
          <span className="fa-journey-edition">A TWO-DAY BUSINESS SIMULATION</span>
          <button type="button" className="fa-sound-toggle" onClick={toggleSound} aria-pressed={soundEnabled}>
            <span className={"fa-sound-indicator" + (soundEnabled ? " is-on" : "")} aria-hidden="true" />
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
        </div>

        <div className="fa-journey-content" aria-live="polite">
          {chapter === "opening" && (
            <div className="fa-journey-panel fa-journey-panel--opening" style={{ opacity: 1 - smoothStep(0.78, 0.99, chapterProgress) }}>
              <img src="/eic-logo.svg" alt="EIC — Entrepreneurship & Innovation Cell" className="fa-opening-eic-logo" />
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.12, 0.22)}>Entrepreneurship & Innovation Cell presents</p>
              <span className="fa-opening-line" style={revealStyle(chapterProgress, 0.23, 0.32)} />
              <p className="fa-opening-prompt label-mono" style={revealStyle(chapterProgress, 0.3, 0.4)}>Scroll to enter the experience</p>
            </div>
          )}

          {chapter === "brand" && (
            <div className="fa-journey-panel fa-journey-panel--brand" style={{ opacity: 1 - smoothStep(0.9, 0.995, chapterProgress) }}>
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>EIC Presents</p>
              <h1 className="fa-main-title" style={revealStyle(chapterProgress, 0.08, 0.22)}><span>Founders’</span><em>Affair</em></h1>
              <p className="fa-brand-subtitle" style={revealStyle(chapterProgress, 0.25, 0.36)}>Ideas. People. Opportunities.</p>
              <span className="fa-brand-rule" style={revealStyle(chapterProgress, 0.36, 0.43)} />
              <p className="fa-brand-caption label-mono" style={revealStyle(chapterProgress, 0.43, 0.54)}>Build it. Run it. Move it. Sell it. Fund it.</p>
            </div>
          )}

          {chapter === "manifesto" && (
            <div className="fa-journey-panel fa-journey-panel--manifesto">
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>The simulation</p>
              <h2 className="fa-statement" style={revealStyle(chapterProgress, 0.1, 0.24)}>Build the company.<br />Move the market.<br /><em>Win the investors.</em></h2>
              <p className="fa-journey-description" style={revealStyle(chapterProgress, 0.28, 0.39)}>Five people. Five C-suite roles. One company to build, run and sell in two days.</p>
              <p className="fa-journey-side-note label-mono" style={revealStyle(chapterProgress, 0.42, 0.52)}>Every decision has consequences.</p>
            </div>
          )}

          {chapter === "roles" && (
            <div className="fa-journey-panel fa-journey-panel--roles">
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>Five roles. One company.</p>
              <h2 className="fa-panel-heading" style={revealStyle(chapterProgress, 0.1, 0.22)}>Take the seat.<br /><em>Make the call.</em></h2>
              <div className="fa-role-grid" style={revealStyle(chapterProgress, 0.25, 0.4)}>
                <div><b>CEO</b><span>Strategy</span></div>
                <div><b>CFO</b><span>Finance</span></div>
                <div><b>CMO</b><span>Brand</span></div>
                <div><b>COO</b><span>Operations</span></div>
                <div><b>CTO</b><span>Innovation</span></div>
              </div>
              <p className="fa-journey-description" style={revealStyle(chapterProgress, 0.43, 0.54)}>Five executive roles. One team. A company that has to survive every decision.</p>
            </div>
          )}

          {chapter === "days" && (
            <div className="fa-journey-panel fa-journey-panel--days">
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>One company. Two days.</p>
              <h2 className="fa-panel-heading" style={revealStyle(chapterProgress, 0.1, 0.22)}>Build it.<br /><em>Then get funded.</em></h2>
              <div className="fa-day-grid" style={revealStyle(chapterProgress, 0.25, 0.4)}>
                <article>
                  <span className="fa-day-label label-mono">DAY 01</span>
                  <h3>Build and move the market</h3>
                  <p>Build, decide, survive, move the market.</p>
                  <span className="fa-day-activities">Acquisition Floor · Boardroom Crisis · Stock Market</span>
                </article>
                <article>
                  <span className="fa-day-label label-mono">DAY 02</span>
                  <h3>Build the brand and get funded</h3>
                  <p>Brand, sell, pitch, get funded.</p>
                  <span className="fa-day-activities">Brand War · Investor Marketplace</span>
                </article>
              </div>
              <p className="fa-capital-note label-mono" style={revealStyle(chapterProgress, 0.42, 0.51)}>$100,000 in simulated starting capital. Spend it wisely.</p>
              <p className="fa-journey-description" style={revealStyle(chapterProgress, 0.51, 0.61)}>The simulations are connected. A decision in one stage can change the next.</p>
            </div>
          )}

          {chapter === "steps" && (
            <div className="fa-journey-panel fa-journey-panel--steps">
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>The road to the win</p>
              <h2 className="fa-panel-heading" style={revealStyle(chapterProgress, 0.1, 0.21)}>Eight steps.<br /><em>One winner.</em></h2>
              <div className="fa-steps-grid" style={revealStyle(chapterProgress, 0.23, 0.38)}>
                <div><span>01</span><b>Acquire</b><small>Buy your foundation</small></div>
                <div><span>02</span><b>Operate</b><small>Boardroom decisions</small></div>
                <div><span>03</span><b>Move the market</b><small>Decisions hit your stock</small></div>
                <div><span>04</span><b>Manage</b><small>React to the market</small></div>
                <div><span>05</span><b>Build the brand</b><small>Earn belief</small></div>
                <div><span>06</span><b>Pitch</b><small>Take it to the marketplace</small></div>
                <div><span>07</span><b>Get funded</b><small>Win the cheques</small></div>
                <div><span>08</span><b>Win</b><small>Highest total cheque value</small></div>
              </div>
              <p className="fa-journey-description" style={revealStyle(chapterProgress, 0.45, 0.56)}>Each simulation has its own winner. The overall winner is decided across all eight steps.</p>
            </div>
          )}

          {chapter === "finale" && (
            <div className="fa-journey-panel fa-journey-panel--finale">
              <p className="fa-journey-kicker label-mono" style={revealStyle(chapterProgress, 0.02, 0.12)}>Not just a college event.</p>
              <h2 className="fa-finale-quote" style={revealStyle(chapterProgress, 0.1, 0.23)}>“For these two days, this wasn’t a college event.<br /><em>This was my company.</em>”</h2>
              <p className="fa-finale-manifesto" style={revealStyle(chapterProgress, 0.28, 0.39)}>BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.</p>
              <div className="fa-contact-row" style={revealStyle(chapterProgress, 0.4, 0.51)}>
                <a href="mailto:foundersaffair@gmail.com">foundersaffair@gmail.com</a>
                <a href="https://www.instagram.com/eic.foundersaffair/" target="_blank" rel="noreferrer">@eic.foundersaffair ↗</a>
              </div>
              <span className="fa-registration-pending label-mono" style={revealStyle(chapterProgress, 0.53, 0.63)}>Registration details to be announced</span>
            </div>
          )}
        </div>

        <div className="fa-journey-bottom label-mono">
          <span>FOUNDERS’ AFFAIR <i>—</i> EIC</span>
          <span className="fa-journey-progress"><i style={{ transform: "scaleX(" + progress + ")" }} /></span>
          <span>{String(Math.round(progress * 100)).padStart(3, "0")}<i> / 100</i></span>
        </div>
        {progress < 0.9 && <a className="fa-journey-scroll-cue label-mono" href="#about"><span /> Scroll to travel</a>}


      </div>
      <span id="about" className="fa-journey-anchor" style={{ top: "45%" }} aria-hidden="true" />
      <span id="team" className="fa-journey-anchor" style={{ top: "57%" }} aria-hidden="true" />
      <span id="how" className="fa-journey-anchor" style={{ top: "69%" }} aria-hidden="true" />
      <span id="experiences" className="fa-journey-anchor" style={{ top: "80%" }} aria-hidden="true" />
      <span id="contact" className="fa-journey-anchor" style={{ top: "94%" }} aria-hidden="true" />
    </section>
  );
}
