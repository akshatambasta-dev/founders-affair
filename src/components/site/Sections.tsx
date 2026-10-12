import { useState, type FormEvent } from "react";
import { useInView } from "@/hooks/use-in-view";

const roles = [
  ["CEO", "Chief Executive Officer", "Leads the company, sets strategy, and makes the final call."],
  [
    "CFO",
    "Chief Financial Officer",
    "Manages capital and financial decisions; participates in the simulated stock market.",
  ],
  [
    "CMO",
    "Chief Marketing Officer",
    "Shapes the brand, advertising, positioning, and customer strategy.",
  ],
  ["COO", "Chief Operating Officer", "Drives execution, operations, and supply-chain decisions."],
  [
    "CTO",
    "Chief Technology Officer",
    "Leads product development, technology, innovation, and scalability.",
  ],
];

export function About() {
  const ref = useInView<HTMLDivElement>();
  return (
    <section id="about" className="theme-dark px-5 py-24 md:px-10 md:py-40">
      <div ref={ref} className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-5">
          <span className="label-mono col-span-12 text-ink-muted md:col-span-3">
            (The simulation)
          </span>
          <div className="col-span-12 md:col-span-9">
            <h2 className="font-display-x text-5xl leading-[0.95] text-ink md:text-8xl">
              <span className="reveal-line">
                <span>Every team</span>
              </span>
              <span className="reveal-line">
                <span style={{ transitionDelay: "100ms" }}>
                  becomes a <span className="bg-copper px-1 text-on-accent">company.</span>
                </span>
              </span>
            </h2>
            <p className="fade-up mt-8 max-w-3xl text-xl leading-relaxed text-ink-2">
              Founder&apos;s Affair is an immersive business simulation. Teams of five take
              executive roles, acquire a product, manage capital and crises, build a brand, pitch,
              and seek simulated investor backing.
            </p>
          </div>
        </div>

        <div id="team" className="mt-20 scroll-mt-24 border-t border-line pt-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="label-mono text-ink-accent">Five roles. One team.</span>
              <h3 className="font-display-x mt-3 text-4xl text-ink md:text-6xl">
                Run the company.
              </h3>
            </div>
            <span className="label-mono text-ink-muted">CEO / CFO / CMO / COO / CTO</span>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map(([abbr, title, detail], i) => (
              <article
                key={abbr}
                className="fade-up border-t border-line pt-5"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-6 grid aspect-square max-w-36 place-items-center rounded-full border border-line-accent text-3xl font-bold text-ink md:text-4xl">
                  {abbr}
                </div>
                <h4 className="font-display text-xl font-bold text-ink">{title}</h4>
                <p className="mt-3 text-ink-2">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const words = ["BUILD IT.", "RUN IT.", "MOVE IT.", "SELL IT.", "FUND IT."];
  const row = [...words, ...words];
  return (
    <div
      className="theme-brand overflow-hidden border-y border-line py-6"
      aria-label="Build it. Run it. Move it. Sell it. Fund it."
    >
      <div className="animate-marquee flex w-max gap-10" aria-hidden="true">
        {[...row, ...row].map((word, i) => (
          <span
            key={i}
            className="font-display-x flex items-center gap-10 text-4xl text-ink md:text-7xl"
          >
            {word} <span className="text-ink-accent">&#10022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const stages = [
  {
    day: "Day 1",
    title: "Acquire",
    detail:
      "Compete in a product auction with limited information. Decide how much of your simulated $100,000 starting capital to commit; the cash you keep shapes what you can do next.",
  },
  {
    day: "Day 1",
    title: "Operate",
    detail:
      "Take your C-suite roles and run the company. Make executive decisions together and manage the business you have acquired.",
  },
  {
    day: "Day 1",
    title: "Move the market",
    detail:
      "Company decisions feed into simulated market performance. The CFO and designated market participant respond under the event rules.",
  },
  {
    day: "Day 1",
    title: "Manage",
    detail:
      "Respond to boardroom crises such as rival moves, supplier increases, regulation, or operational outages. Decide how the company will handle the risk.",
  },
  {
    day: "Day 2",
    title: "Build the brand",
    detail:
      "Create a colour palette, logo, and tagline for your product, then develop a digital advertisement and a strategy to reach customers.",
  },
  {
    day: "Day 2",
    title: "Pitch",
    detail:
      "Enter the Brand War. Make people believe in the company you built: communicate its value, brand, and strategy, and respond to challenges where applicable.",
  },
  {
    day: "Day 2",
    title: "Get funded",
    detail:
      "Present your business at a company stall. Investors use simulated capital to write cheques to the companies they choose to support.",
  },
  {
    day: "Day 2",
    title: "Win",
    detail:
      "The team with the highest total value of simulated investor cheques wins. Cheques represent the event competition metric, not real-world investment or a cash prize.",
  },
];

export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="how" className="theme-ivory scroll-mt-20 px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-4">
          <span className="label-mono text-ink-muted">(The two-day journey)</span>
          <h2 className="font-display-x mt-4 text-5xl text-ink md:text-7xl">
            Two days.
            <br />
            Eight moves.
          </h2>
          <p className="mt-6 max-w-sm text-ink-2">
            Day 1 is about acquiring and running the business. Day 2 is about building its brand,
            pitching, and competing for simulated investor cheques.
          </p>
        </div>
        <ol className="col-span-12 border-t border-line-strong md:col-span-8">
          {stages.map((stage, i) => {
            const isOpen = open === i;
            return (
              <li key={stage.title} className="border-b border-line-strong">
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`stage-${i}`}
                    className="group flex w-full items-center gap-4 py-6 text-left md:gap-6 md:py-7"
                  >
                    <span className="label-mono w-8 shrink-0 text-ink-muted">0{i + 1}</span>
                    <span className="flex-1 font-display text-xl font-bold uppercase tracking-tight text-ink transition-colors group-hover:text-ink-link md:text-3xl">
                      {stage.title}
                    </span>
                    <span className="label-mono hidden text-ink-muted sm:block">{stage.day}</span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-transform duration-500 ${isOpen ? "rotate-45 bg-brand text-primary-foreground" : ""}`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`stage-${i}`}
                  className={`grid transition-[grid-template-rows] duration-700 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden pl-12 pr-4 text-lg text-ink-2 sm:pr-16">
                    <p className="pb-7">{stage.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const [status, setStatus] = useState<"idle" | "error" | "sent">("idle");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    if (!String(data.get("name") || "").trim() || !/^\S+@\S+\.\S+$/.test(email))
      return setStatus("error");
    setStatus("sent");
    e.currentTarget.reset();
  };
  return (
    <section id="contact" className="theme-brand scroll-mt-20 px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-7">
          <span className="label-mono text-ink-muted">(Your move)</span>
          <h2 className="font-display-x mt-4 text-[14vw] text-ink md:text-[8vw]">
            Build it.
            <br />
            Run it.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-ink-2">
            For these two days, this wasn&apos;t a college event. This was my company.
          </p>
          <p className="label-mono mt-8 text-ink-accent">
            Register your interest in Founder&apos;s Affair.
          </p>
        </div>
        <form onSubmit={submit} noValidate className="col-span-12 space-y-6 self-end md:col-span-5">
          {[
            { name: "name", label: "Your name", type: "text", autocomplete: "name" },
            { name: "email", label: "Email", type: "email", autocomplete: "email" },
            {
              name: "company",
              label: "Team or institution (optional)",
              type: "text",
              autocomplete: "organization",
            },
          ].map((field) => (
            <label key={field.name} className="block">
              <span className="label-mono text-ink-muted">{field.label}</span>
              <input
                name={field.name}
                type={field.type}
                autoComplete={field.autocomplete}
                className="mt-2 w-full border-b border-line-strong bg-transparent py-3 text-lg text-ink outline-none transition-colors focus:border-ink"
              />
            </label>
          ))}
          <button
            type="submit"
            data-cursor="cta"
            className="label-mono rounded-full bg-copper px-8 py-4 text-on-accent transition-colors hover:bg-ink"
          >
            Register interest &#8594;
          </button>
          <p role="status" aria-live="polite" className="label-mono min-h-5">
            {status === "sent" && <span className="text-ink">Thanks for your interest.</span>}
            {status === "error" && (
              <span className="text-ink-accent">Please add your name and a valid email.</span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="theme-dark px-5 pb-8 pt-20 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <p className="font-display-x text-[12vw] leading-none text-ink md:text-[10vw]">
          Founder&apos;s Affair
        </p>
        <p className="label-mono mt-8 border-t border-line pt-6 text-ink-muted">
          Build it. Run it. Move it. Sell it. Fund it.
        </p>
        <div className="label-mono mt-6 flex flex-wrap justify-between gap-4 text-ink-muted">
          <span>Founder&apos;s Affair</span>
          <a href="#top" className="link-underline hover:text-ink">
            Back to top &#8593;
          </a>
        </div>
      </div>
    </footer>
  );
}
