import { useEffect, useRef } from "react";

const loop = [
  ["Decision", "The team chooses what its company does next."],
  ["Company impact", "That decision shapes the company and its position."],
  ["Market reaction", "The simulated market responds to company activity."],
  ["CFO responds", "The CFO and designated market participant act under the event rules."],
  ["Consequences", "Teams see how the response changes their situation."],
  ["Feedback", "The outcome becomes context for the next decision."],
];

/** Horizontal market loop: mouse drag on desktop, native swipe on touch. */
export function Gallery() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false,
      startX = 0,
      startScroll = 0,
      moved = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const step = (dir: number) =>
    track.current?.scrollBy({
      left: dir * track.current.clientWidth * 0.6,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });

  return (
    <section
      id="market"
      className="theme-ivory overflow-hidden py-24 md:py-36"
      aria-label="How company decisions connect to the simulated stock market"
    >
      <div className="mx-auto mb-12 flex max-w-[1600px] items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <span className="label-mono text-ink-muted">(Day 1 / The feedback loop)</span>
          <h2 className="font-display-x mt-4 text-5xl text-ink md:text-8xl">
            Every move
            <br />
            moves the market.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-ink-2">
            The simulated stock market runs alongside company management, connecting team decisions
            to market reaction.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="Previous market-loop steps"
            className="label-mono h-12 w-12 rounded-full border border-line-strong text-ink transition-colors hover:bg-brand hover:text-primary-foreground"
          >
            &#8592;
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next market-loop steps"
            className="label-mono h-12 w-12 rounded-full border border-line-strong text-ink transition-colors hover:bg-brand hover:text-primary-foreground"
          >
            &#8594;
          </button>
        </div>
      </div>

      <div
        ref={track}
        data-cursor="drag"
        tabIndex={0}
        aria-label="Scrollable market feedback loop. Use arrow buttons or scroll horizontally."
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-5 select-none md:px-10"
      >
        {loop.map(([title, detail], i) => (
          <article
            key={title}
            className="min-h-72 w-[78vw] shrink-0 snap-start border-t border-line-strong py-6 md:w-[30vw] md:py-8"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-line-accent font-display text-2xl font-bold text-ink">
              {i + 1}
            </span>
            <h3 className="mt-7 font-display text-2xl font-bold text-ink md:text-3xl">{title}</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-ink-2">{detail}</p>
          </article>
        ))}
      </div>
      <p className="label-mono mx-auto mt-8 max-w-[1600px] px-5 text-ink-accent md:px-10">
        Decision &#8594; Company impact &#8594; Market reaction &#8594; CFO responds &#8594;
        Consequences &#8594; Feedback
      </p>
    </section>
  );
}
