import { useEffect, useState } from "react";

/** Brief host-first opening; skipped on repeat visits and for reduced-motion users. */
export function Intro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("fa-intro") === "1";
    } catch {
      // Storage may be disabled; the intro can still run for this page view.
    }
    if (reduced || seen) return;

    setVisible(true);
    const finish = window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("fa-intro", "1"); } catch {}
    }, 2600);
    return () => window.clearTimeout(finish);
  }, []);

  if (!visible) return null;
  return (
    <div className="fa-opening" role="presentation">
      <div className="fa-opening__host">
        <span className="fa-opening__emblem">EIC</span>
        <span>Entrepreneurship<br />& Innovation Cell</span>
      </div>
      <span className="fa-opening__rule" />
      <div className="fa-opening__title">
        <span>FOUNDERS’</span>
        <em>AFFAIR</em>
      </div>
      <p className="fa-opening__subtitle">A BUSINESS CONCLAVE</p>
    </div>
  );
}
