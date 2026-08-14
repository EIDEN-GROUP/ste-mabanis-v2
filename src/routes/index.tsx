import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, TextReveal, MaskReveal, Magnetic } from "@/components/motion";
import { Section, SectionHeading } from "@/components/layout-bits";
import { PropertyCard } from "@/components/property-card";
import { HomeHero } from "@/components/home/hero";
import { HeroSearch } from "@/components/home/hero-search";
import { QuartiersShowcase } from "@/components/home/quartiers";
import { TestimonialsSection } from "@/components/home/testimonials";
import { CinematicServices } from "@/components/home/services-cinematic";
import { BlogSection } from "@/components/home/blog-section";
import { images, properties } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STE MABANIS | Immobilier de caractère à Agadir & Souss-Massa" },
      {
        name: "description",
        content:
          "Villas, appartements et investissements sélectionnés à Agadir, Founty, la Marina et Taghazout. Vente, location, estimation et gestion locative depuis 2024.",
      },
      {
        property: "og:title",
        content: "STE MABANIS | Immobilier de caractère à Agadir",
      },
      {
        property: "og:description",
        content:
          "Une agence indépendante d'Agadir : biens sélectionnés, estimation argumentée, accompagnement de A à Z.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = properties.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      {/* Phones get the search panel inside the hero, over the video */}
      <HomeHero>
        <HeroSearch />
      </HomeHero>

      {/* From lg the panel straddles the hero's bottom edge instead */}
      <div className="relative z-30 mx-auto hidden max-w-[100rem] px-5 sm:px-8 lg:-mt-[5.5rem] lg:block lg:px-12">
        <HeroSearch />
      </div>

      {/* 01 Sélection */}
      <Section className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Sélection du moment"
          title="Des biens d'exception, à Agadir."
          intro="Une poignée d'adresses que nous avons visitées, vérifiées et que nous défendons personnellement auprès de nos acquéreurs."
          action={
            <Link
              to="/proprietes"
              className="link-underline inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase"
            >
              Tout le portefeuille <ArrowUpRight className="size-4 text-gold" />
            </Link>
          }
        />
        {/* Snap carousel on phones, grid from sm up four stacked cards is too much scroll. */}
        <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4 xl:gap-8 [&::-webkit-scrollbar]:hidden">
          {featured.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 90}
              className="w-[82%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <PropertyCard
                property={p}
                className="h-full transition-shadow duration-700 hover:shadow-elegant"
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 03 Services : Acheter / Vendre / Louer / Investir */}
      <CinematicServices />

      {/* 02 Quartiers */}
      <Section tone="navy" className="bg-ink overflow-hidden pt-0!">
        <div className="mx-auto grid max-w-[100rem] gap-8 lg:grid-cols-[40%_60%] lg:items-center lg:gap-12">
          <p className="max-w-[30rem] text-[clamp(1.9rem,6vw,3.75rem)] leading-[1.05] font-bold uppercase tracking-[-0.02em]">
            <TextReveal text="Une expertise " />{" "}
            <span className="text-white/40">
              <TextReveal text="de chaque quartier." delay={220} />
            </span>
          </p>
          <Reveal delay={260}>
            <div className="lg:max-w-10/12">
              <p className="text-white">
                <TextReveal
                  text="Une connaissance approfondie d’Agadir et de ses quartiers pour vous guider vers les adresses qui correspondent réellement à votre projet."
                  delay={220}
                  className="text-[clamp(1.05rem,2.2vw,1.5rem)]"
                />
              </p>
              <Link
                to="/quartiers"
                className="btn-sheen group mt-6 inline-flex items-center justify-center gap-3 rounded-md bg-gold px-7 py-3.5 text-[0.68rem] tracking-[0.18em] font-medium uppercase text-navy transition-colors duration-500 hover:bg-white"
              >
                Tous les quartiers
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={120} className="mt-12">
          <QuartiersShowcase />
        </Reveal>
      </Section>

      {/* 05 Preuve sociale */}
      <TestimonialsSection />

      {/* 06 Blog & Resources */}
      <BlogSection />
    </>
  );
}
