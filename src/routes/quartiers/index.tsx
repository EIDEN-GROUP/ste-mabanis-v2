import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout-bits";
import { MaskReveal, Reveal } from "@/components/motion";
import { images, locations, propertiesByLocation } from "@/lib/site-data";

export const Route = createFileRoute("/quartiers/")({
  head: () => ({
    meta: [
      { title: "Quartiers d'Agadir : où acheter ou louer   STE MABANIS" },
      {
        name: "description",
        content:
          "Founty, Marina, Taghazout, Hay Mohammadi, centre-ville : prix au m², ambiance et potentiel d'investissement quartier par quartier.",
      },
      { property: "og:title", content: "Quartiers d'Agadir : où acheter ou louer" },
      {
        property: "og:description",
        content: "Le guide honnête des secteurs d'Agadir, avec fourchettes de prix réelles.",
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Quartiers"
        lead="Les"
        trail="quartiers"
        intro="Le bon quartier vaut mieux que le beau salon. Nos repères de prix viennent de transactions réellement signées sur le Grand Agadir, pas d'annonces en vitrine."
        image={images.locationAgadir}
      />

      <Section>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((l, i) => (
            <Reveal key={l.slug} delay={i * 70}>
              <Link
                to="/quartiers/$slug"
                params={{ slug: l.slug }}
                className="zoom-frame group block rounded-md bg-card shadow-card"
              >
                <MaskReveal delay={i * 70 + 60} className="overflow-hidden rounded-t-md">
                  <img
                    src={l.image}
                    alt={l.name}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="aspect-4/3 w-full object-cover"
                  />
                </MaskReveal>
                <div className="p-6">
                  <p className="text-[0.6rem] tracking-[0.2em] text-gold uppercase">{l.city}</p>
                  <h2 className="display mt-2 text-2xl">{l.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{l.intro}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
                    <span className="tracking-[0.12em] text-blue uppercase">{l.priceRange}</span>
                    <span className="text-muted-foreground">
                      {propertiesByLocation(l.slug).length} bien(s)
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
