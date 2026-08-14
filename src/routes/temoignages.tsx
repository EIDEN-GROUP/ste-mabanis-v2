import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout-bits";
import { Reveal, TextReveal } from "@/components/motion";
import { images, testimonials } from "@/lib/site-data";

export const Route = createFileRoute("/temoignages")({
  head: () => ({
    meta: [
      { title: "Témoignages clients   STE MABANIS Agadir" },
      {
        name: "description",
        content:
          "Acheteurs, vendeurs, investisseurs et propriétaires racontent leur expérience avec l'agence STE MABANIS à Agadir.",
      },
      { property: "og:title", content: "Témoignages clients   STE MABANIS" },
      {
        property: "og:description",
        content: "Ce que disent nos clients, y compris quand nous les avons contredits.",
      },
    ],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Témoignages"
        lead="Ils"
        trail="témoignent"
        intro="Ce qu'on retient, une fois les clés remises. Nous publions les retours tels qu'ils nous sont transmis, y compris ceux qui commencent par « j'ai râlé »."
        image={images.editorial1}
      />

      <Section>
        <div className="columns-1 gap-8 md:columns-2 xl:columns-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 60}
              className="mb-8 break-inside-avoid bg-card p-8 shadow-card"
            >
              <p className="quote text-3xl text-gold">“</p>
              <p className="mt-2 text-[1.02rem] leading-relaxed">{t.quote}</p>
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role} · {t.location}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 rounded-md bg-navy p-10 text-center text-white sm:p-16">
          <h2 className="display text-[clamp(1.9rem,4vw,3rem)]">
            <TextReveal text="Le prochain témoignage sera peut-être le vôtre." delay={80} />
          </h2>
          <Link
            to="/contact"
            className="mt-8 inline-block rounded-md bg-gold px-7 py-4 text-[0.7rem] tracking-[0.18em] text-navy uppercase"
          >
            Démarrer mon projet
          </Link>
        </Reveal>
      </Section>
    </>
  );
}
