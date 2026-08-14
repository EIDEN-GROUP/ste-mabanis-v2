import { createFileRoute, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Reveal, TextReveal } from "@/components/motion";
import { PropertyCard } from "@/components/property-card";
import { getLocation, propertiesByLocation } from "@/lib/site-data";

export const Route = createFileRoute("/quartiers/$slug")({
  loader: ({ params }) => {
    const location = getLocation(params.slug);
    if (!location) throw notFound();
    return { location, listings: propertiesByLocation(location.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Quartier introuvable   STE MABANIS" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const l = loaderData.location;
    const title = `Immobilier à ${l.name} (${l.city})   STE MABANIS`;
    return {
      meta: [
        { title },
        { name: "description", content: `${l.intro} Prix constatés : ${l.priceRange}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: l.intro },
      ],
    };
  },
  component: LocationPage,
});

function LocationPage() {
  const { location, listings } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow={location.city}
        title={location.name}
        intro={location.intro}
        image={location.image}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <h2 className="display rule-gold text-3xl">
              <TextReveal text="Le quartier" delay={60} />
            </h2>
            <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-foreground/85">
              {location.editorial.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100} className="space-y-8">
            <div className="rounded-md border border-line bg-card p-7">
              <p className="eyebrow">Art de vivre</p>
              <ul className="mt-4 space-y-2.5">
                {location.lifestyle.map((l: string) => (
                  <li key={l} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy p-7 text-white">
              <p className="eyebrow">Investissement</p>
              <p className="display mt-3 text-3xl text-gold">{location.priceRange}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{location.investment}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {listings.length ? (
        <Section tone="sand">
          <SectionHeading eyebrow="Disponibilités" title={`Nos biens à ${location.name}`} />
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((p: import("@/lib/site-data").Property, i: number) => (
              <Reveal key={p.slug} delay={i * 70}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
