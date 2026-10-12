import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { experiences } from "@/lib/experiences";
import { useInView } from "@/hooks/use-in-view";

export function Experiences() {
  const head = useInView<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Floating stage preview follows pointer within the list (desktop only).
  useEffect(() => {
    const list = listRef.current;
    if (
      !list ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    function tick() {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      if (previewRef.current)
        previewRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      if (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) raf = requestAnimationFrame(tick);
      else raf = 0;
    }
    list.addEventListener("pointermove", move);
    return () => {
      list.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="experiences" className="theme-dark px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div ref={head} className="mb-12 flex items-end justify-between border-b border-line pb-6">
          <div>
            <span className="label-mono text-ink-muted">(Key moments in the simulation)</span>
            <h2 className="font-display-x mt-4 text-5xl text-ink md:text-8xl">
              <span className="reveal-line">
                <span>Pressure.</span>
              </span>
              <span className="reveal-line">
                <span style={{ transitionDelay: "100ms" }}>Decisions. Belief.</span>
              </span>
            </h2>
          </div>
          <span className="label-mono hidden text-ink-muted md:block">Five key moments</span>
        </div>

        <div ref={listRef} className="relative" onPointerLeave={() => setActive(null)}>
          <div
            ref={previewRef}
            className={`pointer-events-none absolute left-0 top-0 z-10 hidden aspect-[4/3] w-[28vw] max-w-[420px] flex-col justify-between border border-line-accent bg-surface p-7 transition-opacity duration-300 md:flex ${active === null ? "opacity-0" : "opacity-100"}`}
            aria-hidden="true"
          >
            <span className="label-mono text-ink-accent">
              {active === null ? "" : experiences[active]?.category}
            </span>
            <span className="font-display-x text-5xl text-ink">
              {active === null ? "" : experiences[active]?.title}
            </span>
            <span className="label-mono text-ink-muted">
              {active === null ? "" : experiences[active]?.num}
            </span>
          </div>

          <ul>
            {experiences.map((experience, i) => (
              <li key={experience.slug} className="border-b border-line">
                <Link
                  to="/experiences/$slug"
                  params={{ slug: experience.slug }}
                  data-cursor="view"
                  onPointerEnter={() => setActive(i)}
                  className={`group grid grid-cols-12 items-center gap-4 py-8 transition-opacity duration-500 md:py-12 ${active !== null && active !== i ? "md:opacity-35" : ""}`}
                >
                  <span className="label-mono col-span-2 text-ink-muted md:col-span-1">
                    {experience.num}
                  </span>
                  <div className="col-span-10 md:col-span-7">
                    <h3 className="font-display-x text-4xl text-ink transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-ink-link md:text-7xl">
                      {experience.title}
                    </h3>
                    <p className="label-mono mt-3 text-ink-accent">{experience.category}</p>
                  </div>
                  <p className="col-span-12 text-ink-2 md:col-span-4">{experience.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
