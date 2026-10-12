import { useEffect, useRef, useState } from "react";

/**
 * Opening wordmark sequence (plays once per session).
 * A: masked wordmark + counter → B: letter-spacing settles, copper block slides
 * behind "affair" → C: block expands to a full-screen wipe, which lifts to
 * reveal the hero (hero lines start rising underneath at the same moment).
 * Failsafes: inline script skips it for repeat visits / reduced motion, and a
 * CSS animation hides the overlay after 5s if JS never runs.
 */
const BOOT = `try{var m=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!m&&!sessionStorage.getItem('fa-intro')){document.documentElement.classList.add('fa-intro-pending')}}catch(e){}`;

export function markIntroDone() {
  const w = window as unknown as { __faIntroDone?: boolean };
  if (w.__faIntroDone) return;
  w.__faIntroDone = true;
  document.documentElement.classList.remove("fa-intro-pending");
  try {
    sessionStorage.setItem("fa-intro", "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("fa:intro-done"));
}

export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLSpanElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current!;
    if (!document.documentElement.classList.contains("fa-intro-pending")) {
      markIntroDone();
      setGone(true);
      return;
    }
    const k = window.innerWidth < 768 ? 0.7 : 1;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms * k));
    let raf = 0,
      finished = false;

    // Counter 000 → 100
    const t0 = performance.now(),
      dur = 1500 * k;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(100 * (1 - Math.pow(1 - p, 3)));
      if (count.current) count.current.textContent = String(v).padStart(3, "0");
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const expand = () => {
      const w = wipe.current!,
        b = block.current!.getBoundingClientRect();
      const vw = window.innerWidth,
        vh = window.innerHeight;
      w.style.transition = "none";
      w.style.clipPath = `inset(${b.top}px ${vw - b.right}px ${vh - b.bottom}px ${b.left}px)`;
      w.style.opacity = "1";
      void w.offsetWidth;
      w.style.transition = "";
      el.classList.add("is-expand");
    };
    const exit = () => {
      if (finished) return;
      finished = true;
      el.classList.add("is-exit");
      markIntroDone();
      timers.push(window.setTimeout(() => setGone(true), 1000));
    };

    at(60, () => el.classList.add("is-a"));
    at(700, () => el.classList.add("is-b"));
    at(1650, expand);
    at(2350, exit);

    skipRef.current = () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      exit();
    };
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fa-intro theme-dark" aria-hidden="true">
      <script dangerouslySetInnerHTML={{ __html: BOOT }} suppressHydrationWarning />
      <div className="fa-intro__mark font-display-x text-ink">
        <span className="fa-intro__mask">
          <span className="fa-intro__w1">Founder's</span>
        </span>
        <span className="fa-intro__mask fa-intro__aff">
          <span ref={block} className="fa-intro__block" />
          <span className="fa-intro__w2">affair</span>
        </span>
      </div>
      <div className="fa-intro__meta label-mono text-ink-muted">
        <span>
          A two-day simulation
          <br />
          Teams of five
        </span>
      </div>
      <span ref={count} className="fa-intro__count font-display-x text-ink">
        000
      </span>
      <button
        type="button"
        onClick={() => skipRef.current()}
        className="fa-intro__skip label-mono"
        aria-label="Skip intro"
        tabIndex={0}
      >
        Skip
      </button>
      <div ref={wipe} className="fa-intro__wipe" />
    </div>
  );
}
