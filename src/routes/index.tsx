import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Experiences } from "@/components/site/Experiences";
import { Gallery } from "@/components/site/Gallery";
import { About, Contact, Footer, Marquee, Services } from "@/components/site/Sections";
import { Intro } from "@/components/site/Intro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Founders’ Affair — Business Conclave" },
      {
        name: "description",
        content:
          "Founders’ Affair is an entrepreneurial business simulation hosted by the Entrepreneurship & Innovation Cell.",
      },
      { property: "og:title", content: "Founders’ Affair — Business Conclave" },
      {
        property: "og:description",
        content: "Ideas. People. Opportunities. A business conclave hosted by EIC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Intro />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Experiences />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
