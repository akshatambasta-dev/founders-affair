import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Experiences } from "@/components/site/Experiences";
import { Gallery } from "@/components/site/Gallery";
import { About, Contact, Footer, Marquee, Services } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Founder's Affair — Two-Day Business Simulation" },
      {
        name: "description",
        content:
          "A two-day entrepreneurial business simulation. Teams of five acquire a product, run a company, build a brand, pitch, and compete for simulated investor cheques.",
      },
      { property: "og:title", content: "Founder's Affair — Two-Day Business Simulation" },
      {
        property: "og:description",
        content: "Teams of five become competing companies in a two-day business simulation.",
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
