import { useEffect, useState } from "react";

const links = [
  { href: "#about", label: "Overview" },
  { href: "#team", label: "The team" },
  { href: "#how", label: "The journey" },
  { href: "#experiences", label: "Key moments" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header
      className={`theme-dark fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ${
        scrolled
          ? "border-b border-line bg-base/95 py-3"
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1600px] items-center justify-between px-5 md:px-10"
        aria-label="Primary"
      >
        <a
          href="#top"
          className="font-display text-lg font-extrabold uppercase tracking-tight text-ink"
        >
          Founder's
          <span className="font-sans font-normal italic normal-case text-ink-accent"> affair</span>
        </a>
        <span className="label-mono hidden text-ink-muted lg:block">Two-day simulation</span>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="label-mono link-underline text-ink-2 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              data-cursor="cta"
              className="label-mono rounded-full bg-copper px-5 py-2.5 text-on-accent transition-colors hover:bg-ink"
            >
              Register interest
            </a>
          </li>
        </ul>
        <button
          className="label-mono text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      <div
        id="mobile-menu"
        className={`theme-brand fixed inset-0 top-0 -z-10 flex flex-col justify-end px-5 pb-12 transition-[clip-path] duration-700 md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!open}
      >
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="font-display-x block text-6xl text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
