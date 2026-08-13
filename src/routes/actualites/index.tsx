import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout-bits";
import { Reveal } from "@/components/motion";
import { articles, images } from "@/lib/site-data";

export const Route = createFileRoute("/actualites/")({
  head: () => ({
    meta: [
      { title: "Actualités & guides immobiliers Agadir — STE MABANIS" },
      {
        name: "description",
        content:
          "Analyses de marché, guides d'achat, conseils aux vendeurs et actualité immobilière d'Agadir par les conseillers STE MABANIS.",
      },
      { property: "og:title", content: "Actualités & guides immobiliers d'Agadir" },
      {
        property: "og:description",
        content: "Comprendre le marché gadiri avant d'acheter, de vendre ou d'investir.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHero
        eyebrow="Actualités & insights"
        title="Le marché expliqué par ceux qui le pratiquent."
        intro="Pas de communiqués : des chiffres issus de nos transactions et des conseils que nous donnons déjà à nos clients."
        image={images.locationAgadir}
      />

      <Section>
        {lead ? (
          <Reveal>
            <Link
              to="/actualites/$slug"
              params={{ slug: lead.slug }}
              className="zoom-frame group grid gap-8 lg:grid-cols-2 lg:items-center"
            >
              <div className="overflow-hidden">
                <img
                  src={lead.image}
                  alt={lead.title}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-4/3 w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[0.62rem] tracking-[0.2em] text-gold uppercase">
                  {lead.category} · {lead.date} · {lead.readTime}
                </p>
                <h2 className="display mt-4 text-[clamp(2rem,4vw,3.5rem)]">{lead.title}</h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">{lead.excerpt}</p>
                <span className="link-underline mt-6 inline-block text-[0.7rem] tracking-[0.18em] uppercase">
                  Lire l'article
                </span>
              </div>
            </Link>
          </Reveal>
        ) : null}

        <div className="mt-16 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={i * 70}>
              <Link to="/actualites/$slug" params={{ slug: a.slug }} className="zoom-frame group block">
                <div className="overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>
                <p className="mt-5 text-[0.6rem] tracking-[0.2em] text-gold uppercase">
                  {a.category} · {a.readTime}
                </p>
                <h3 className="display mt-2 text-2xl">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
