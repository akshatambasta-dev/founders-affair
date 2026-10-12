import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { experiences } from "@/lib/experiences";

export const Route = createFileRoute("/experiences/$slug")({
  loader: ({ params }) => {
    const experience = experiences.find((item) => item.slug === params.slug);
    if (!experience) throw notFound();
    return experience;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Event stage"} | Founder's Affair` },
      {
        name: "description",
        content: loaderData?.description ?? "A stage in the Founder's Affair business simulation.",
      },
      { property: "og:title", content: `${loaderData?.title ?? "Event stage"} | Founder's Affair` },
      {
        property: "og:description",
        content: loaderData?.description ?? "A stage in the Founder's Affair business simulation.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const stage = Route.useLoaderData();
  const index = experiences.findIndex((item) => item.slug === stage.slug);
  const next = experiences[(index + 1) % experiences.length]!;
  return (
    <main className="theme-dark min-h-screen px-5 pb-20 pt-8 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="label-mono flex justify-between text-ink-muted">
          <Link to="/" hash="experiences" className="link-underline hover:text-ink">
            &#8592; All key moments
          </Link>
          <span>
            {stage.num} / {String(experiences.length).padStart(2, "0")}
          </span>
        </div>
        <p className="label-mono mt-16 text-ink-accent">{stage.category}</p>
        <h1 className="font-display-x mt-4 text-[16vw] text-ink md:text-[10vw]">{stage.title}</h1>
        <div className="mt-12 flex min-h-64 items-end justify-between border-y border-line py-8 md:min-h-80 md:py-12">
          <p className="max-w-4xl font-display text-3xl font-semibold leading-tight text-ink md:text-6xl">
            {stage.description}
          </p>
          <span className="label-mono hidden text-ink-accent md:block">{stage.num}</span>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <p className="text-xl leading-relaxed text-ink-2 md:col-span-7 md:text-2xl">
            {stage.long}
          </p>
          <div className="md:col-span-4 md:col-start-9">
            <Link
              to="/"
              hash="contact"
              data-cursor="cta"
              className="label-mono inline-block rounded-full bg-copper px-8 py-4 text-on-accent transition-colors hover:bg-ink"
            >
              Register interest &#8594;
            </Link>
          </div>
        </div>
        <Link
          to="/experiences/$slug"
          params={{ slug: next.slug }}
          data-cursor="view"
          data-cursor-label="NEXT"
          className="group mt-24 block border-t border-line pt-8"
        >
          <span className="label-mono text-ink-muted">Next moment</span>
          <span className="font-display-x mt-2 block text-5xl text-ink transition-colors group-hover:text-ink-link md:text-8xl">
            {next.title}
          </span>
        </Link>
      </div>
    </main>
  );
}
