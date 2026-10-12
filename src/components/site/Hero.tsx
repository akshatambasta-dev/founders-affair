import { useEffect, useRef } from "react";

/** Oversized wordmark; the words reveal in sequence and drift apart on scroll. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const w1 = useRef<HTMLSpanElement>(null);
  const w2 = useRef<HTMLSpanElement>(null);
  const sub = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    // The intro is intentionally omitted from the landing page, so reveal the
    // headline immediately instead of waiting for its event or a long fallback.
    el.classList.add("is-in");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (reduce) return;
        const h = el.offsetHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / h));
        if (w1.current) w1.current.style.transform = `translate3d(${-p * 18}vw, ${p * 30}vh, 0)`;
        if (w2.current) w2.current.style.transform = `translate3d(${p * 12}vw, ${p * 12}vh, 0)`;
        if (sub.current) {
          sub.current.style.transform = `translate3d(0, ${p * -60}px, 0)`;
          sub.current.style.opacity = String(1 - p * 1.6);
        }
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      className="theme-dark relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-8 pt-24 md:px-10 md:pt-28"
    >
      <div
        className="fade-up mx-auto grid w-full max-w-[1600px] grid-cols-2 label-mono text-ink-muted"
        style={{ transitionDelay: "180ms" }}
      >
        <span>(Two-day business simulation)</span>
        <span className="text-right">Teams of five</span>
      </div>

      <h1 className="font-display-x mx-auto mt-8 flex w-full max-w-[1600px] flex-1 flex-col justify-center text-ink">
        <span className="sr-only">Founder&apos;s Affair</span>
        <span ref={w1} className="block will-change-transform" aria-hidden="true">
          <span className="reveal-line text-[19vw] md:text-[15.5vw]">
            <span>Founder&apos;s</span>
          </span>
        </span>
        <span ref={w2} className="block self-end will-change-transform" aria-hidden="true">
          <span className="reveal-line text-[19vw] md:text-[15.5vw]">
            <span style={{ transitionDelay: "140ms" }}>
              <em className="font-sans font-normal italic normal-case tracking-tight text-ink-accent">
                a
              </em>
              ffair
            </span>
          </span>
        </span>
      </h1>

      <div
        ref={sub}
        className="mx-auto mt-10 grid w-full max-w-[1600px] grid-cols-12 items-end gap-5"
      >
        <div className="col-span-12 md:col-span-5">
          <p
            className="fade-up label-mono mb-3 text-ink-accent"
            style={{ transitionDelay: "260ms" }}
          >
            Build it. Run it. Move it. Sell it. Fund it.
          </p>
          <p
            className="fade-up max-w-xl text-lg leading-snug text-ink-2"
            style={{ transitionDelay: "340ms" }}
          >
            Teams of five take C-suite roles and spend two days building, deciding, surviving
            crises, moving their stock, and convincing investors to fund them.
          </p>
        </div>
        <a
          href="#how"
          className="label-mono fade-up col-span-6 hidden items-center gap-2 text-ink-muted md:col-span-3 md:flex"
          style={{ transitionDelay: "420ms" }}
        >
          <span className="animate-cue">↓</span> Follow the journey
        </a>
        <div
          className="fade-up col-span-12 flex flex-wrap gap-3 md:col-span-4 md:justify-end"
          style={{ transitionDelay: "400ms" }}
        >
          <a
            href="#experiences"
            className="label-mono rounded-full border border-line-strong px-6 py-3.5 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-base"
          >
            Explore the simulation →
          </a>
          <a
            href="#contact"
            data-cursor="cta"
            className="label-mono rounded-full bg-copper px-6 py-3.5 text-on-accent transition-colors hover:bg-ink"
          >
            Register interest
          </a>
        </div>
      </div>
    </section>
  );
}
