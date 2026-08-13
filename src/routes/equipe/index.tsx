import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail } from "lucide-react";
import { PageHero, Section } from "@/components/layout-bits";
import { Reveal } from "@/components/motion";
import { agents, images, propertiesByAgent } from "@/lib/site-data";

export const Route = createFileRoute("/equipe/")({
  head: () => ({
    meta: [
      { title: "Nos conseillers immobiliers à Agadir — STE MABANIS" },
      {
        name: "description",
        content:
          "Rencontrez les conseillers STE MABANIS : prestige, résidentiel, gestion locative et expertise. Un interlocuteur référent par dossier.",
      },
      { property: "og:title", content: "Nos conseillers immobiliers à Agadir" },
      {
        property: "og:description",
        content: "Quatre spécialistes, une même exigence : vous dire les choses telles qu'elles sont.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Équipe"
        title="Vous n'aurez jamais à réexpliquer votre dossier."
        intro="Un conseiller référent vous suit du premier appel à la remise des clés, épaulé par l'ensemble de l'agence."
        image={images.teamOffice}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          {agents.map((a, i) => (
            <Reveal key={a.slug} delay={i * 80} className="border border-line bg-card p-8">
              <div className="flex items-start gap-5">
                <span className="display grid size-16 shrink-0 place-items-center bg-navy text-2xl text-gold">
                  {a.initials}
                </span>
                <div>
                  <h2 className="display text-3xl">
                    <Link to="/equipe/$slug" params={{ slug: a.slug }} className="link-underline">
                      {a.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    {a.role}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-foreground/85">{a.bio}</p>
              <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Spécialités
                  </dt>
                  <dd className="mt-1">{a.expertise}</dd>
                </div>
                <div>
                  <dt className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Langues
                  </dt>
                  <dd className="mt-1">{a.languages}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-gold">
                  <Phone className="size-3.5 text-gold" /> {a.phone}
                </a>
                <a href={`mailto:${a.email}`} className="inline-flex items-center gap-2 hover:text-gold">
                  <Mail className="size-3.5 text-gold" /> {a.email}
                </a>
                <span className="ml-auto text-xs text-muted-foreground">
                  {propertiesByAgent(a.slug).length} biens suivis
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
