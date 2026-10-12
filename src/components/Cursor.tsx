import { useEffect, useRef } from "react";

/**
 * Custom desktop cursor. Position is driven by rAF + transforms (no React
 * re-renders). State is read from the nearest [data-cursor] ancestor.
 * pointer-events: none — never intercepts clicks, drags or scrolling.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current!;
    const label = labelRef.current!;
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, dragging = false;
    let current = "";

    const setState = (s: string, text = "") => {
      const next = dragging && s === "drag" ? "dragging" : s;
      if (next === current) return;
      current = next;
      el.dataset["state"] = next;
      label.textContent = next === "dragging" ? "DRAGGING" : text;
    };

    const resolve = (target: EventTarget | null) => {
      const t = (target as Element | null)?.closest?.("[data-cursor], a, button, summary, input, textarea, select");
      if (!t) return setState("");
      const kind = t.getAttribute("data-cursor");
      if (kind === "view") return setState("view", t.getAttribute("data-cursor-label") || "VIEW PROJECT");
      if (kind === "drag") return setState("drag", t.getAttribute("data-cursor-label") || "DRAG");
      if (kind === "cta") return setState("cta");
      if (kind === "text" || t.matches("input, textarea, select")) return setState("");
      setState("link");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      el.classList.add("is-visible");
      resolve(e.target);
    };
    const onLeave = () => el.classList.remove("is-visible");
    const onDown = () => { dragging = true; if (current === "drag") setState("drag"); };
    const onUp = (e: PointerEvent) => { dragging = false; current = ""; resolve(e.target); };

    const tick = () => {
      const k = reduce ? 1 : 0.35;
      cx += (x - cx) * k; cy += (y - cy) * k;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={ref} className="fa-cursor" aria-hidden="true">
      <div className="fa-cursor__dot">
        <span ref={labelRef} className="fa-cursor__label" />
      </div>
    </div>
  );
}
