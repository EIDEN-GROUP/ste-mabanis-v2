import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Reveal } from "@/components/motion";
import { images, services } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services immobiliers à Agadir — STE MABANIS" },
      {
        name: "description",
        content:
          "Achat, vente, location, estimation, investissement, gestion locative et accompagnement personnalisé à Agadir par STE MABANIS.",
      },
      { property: "og:title", content: "Services immobiliers à Agadir — STE MABANIS" },
      {
        property: "og:description",
        content: "Sept métiers, un seul interlocuteur, de l'estimation à la gestion du bien.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Tout se traite en interne, du premier appel à la dixième année."
        intro="Nous n'externalisons ni l'estimation, ni la commercialisation, ni la gestion. C'est plus exigeant, et c'est la seule façon de tenir nos engagements."
        image={images.editorial1}
      />

      <Section>
        <div className="grid gap-px bg-line md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60} className="bg-background p-8">
              <p className="text-[0.6rem] tracking-[0.2em] text-gold">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="display mt-3 text-3xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <ul className="mt-5 space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <SectionHeading
          tone="navy"
          eyebrow="Passer à l'action"
          title="Par quoi souhaitez-vous commencer ?"
          action={
            <div className="flex flex-wrap gap-3">
              <Link
                to="/vendre"
                className="bg-gold px-6 py-3.5 text-[0.7rem] tracking-[0.18em] text-navy uppercase"
              >
                Estimer mon bien
              </Link>
              <Link
                to="/contact"
                className="border border-white/30 px-6 py-3.5 text-[0.7rem] tracking-[0.18em] uppercase"
              >
                Parler à un conseiller
              </Link>
            </div>
          }
        />
      </Section>
    </>
  );
}
