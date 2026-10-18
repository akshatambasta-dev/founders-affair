import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Founders’ Affair — Business Conclave" },
      {
        name: "description",
        content:
          "Founders’ Affair is a two-day entrepreneurial business simulation hosted by the Entrepreneurship & Innovation Cell.",
      },
      { property: "og:title", content: "Founders’ Affair — Business Conclave" },
      {
        property: "og:description",
        content: "Build the company. Move the market. Win the investors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
    </main>
  );
}
