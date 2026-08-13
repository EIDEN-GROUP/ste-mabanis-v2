import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Reveal, Counter } from "@/components/motion";
import { LeadForm } from "@/components/lead-form";
import { images, locations, propertyTypes } from "@/lib/site-data";

export const Route = createFileRoute("/vendre")({
  head: () => ({
    meta: [
      { title: "Vendre son bien à Agadir — Estimation gratuite | STE MABANIS" },
      {
        name: "description",
        content:
          "Estimation gratuite sous 72 h, reportage photo professionnel, diffusion coordonnée : délai médian de vente de 74 jours en mandat exclusif.",
      },
      { property: "og:title", content: "Vendre son bien à Agadir avec STE MABANIS" },
      {
        property: "og:description",
        content: "Une estimation argumentée, une commercialisation préparée, un suivi hebdomadaire.",
      },
    ],
  }),
  component: SellPage,
});

const steps = [
  { title: "Estimation", text: "Visite du bien, analyse des comparables signés, rapport écrit remis sous 72 heures." },
  { title: "Préparation", text: "Conseils de mise en valeur, reportage photo professionnel, plan coté et descriptif rédigé." },
  { title: "Diffusion", text: "Mise en ligne simultanée, activation de notre fichier acquéreurs et des partenaires." },
  { title: "Visites", text: "Visites accompagnées et qualifiées, compte rendu hebdomadaire, retours d'acheteurs transmis bruts." },
  { title: "Négociation", text: "Défense de votre prix, vérification de la solvabilité, rédaction du compromis avec le notaire." },
  { title: "Signature", text: "Coordination notaire et banque jusqu'à la remise des clés, puis suivi après-vente." },
];

function SellPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendre"
        title="Le bon prix, dès le premier jour."
        intro="Un bien mal positionné perd en moyenne 9 % de sa valeur finale. Notre travail commence donc par une estimation que nous savons défendre."
        image={images.property1}
      />

      <Section>
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            { value: 74, suffix: " j", label: "délai médian de vente en exclusivité" },
            { value: 62, suffix: "", label: "mandats exclusifs signés en 2025" },
            { value: 2, suffix: ",4 %", label: "écart moyen entre prix d'annonce et prix signé" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="border-t border-gold/40 pt-6">
              <p className="display text-5xl text-blue">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeading
          eyebrow="Notre méthode"
          title="Six étapes, aucune improvisation"
          intro="Chaque mandat suit le même protocole, du studio de 45 m² à la villa front d'océan."
        />
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 60} className="bg-sand p-7">
              <p className="text-[0.6rem] tracking-[0.2em] text-gold">
                Étape {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="display mt-2 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">Pourquoi nous confier votre bien</p>
            <h2 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)]">
              Un vendeur informé négocie mieux
            </h2>
            <ul className="mt-8 space-y-3.5">
              {[
                "Estimation gratuite, écrite et argumentée sous 72 heures",
                "Reportage photo et plan coté pris en charge par l'agence",
                "Fichier de plus de 900 acquéreurs qualifiés",
                "Sélection des visiteurs : pas de défilé inutile chez vous",
                "Compte rendu hebdomadaire, y compris quand ça ne bouge pas",
                "Accompagnement notarial et fiscal jusqu'à la signature",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-white/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <LeadForm
              tone="navy"
              intent="valuation"
              submitLabel="Demander mon estimation gratuite"
              note="Sans engagement. Nous vous rappelons pour convenir d'une visite d'évaluation."
              fields={[
                { name: "nom", label: "Nom et prénom", required: true },
                { name: "telephone", label: "Téléphone", type: "tel", required: true },
                { name: "email", label: "E-mail", type: "email", required: true, full: true },
                {
                  name: "type",
                  label: "Type de bien",
                  type: "select",
                  options: propertyTypes,
                  required: true,
                },
                {
                  name: "quartier",
                  label: "Quartier",
                  type: "select",
                  options: locations.map((l) => l.name),
                  required: true,
                },
                { name: "surface", label: "Surface approximative (m²)", full: true },
                {
                  name: "message",
                  label: "Précisions utiles",
                  type: "textarea",
                  placeholder: "Année de construction, travaux récents, échéance de vente…",
                },
              ]}
            />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
