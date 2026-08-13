import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Reveal, Counter } from "@/components/motion";
import { agents, images, stats, values } from "@/lib/site-data";

export const Route = createFileRoute("/agence")({
  head: () => ({
    meta: [
      { title: "L'agence STE MABANIS — Immobilier à Agadir depuis 2008" },
      {
        name: "description",
        content:
          "Histoire, vision, valeurs et expertise de STE MABANIS, agence immobilière indépendante installée à Agadir depuis 2008.",
      },
      { property: "og:title", content: "L'agence STE MABANIS — Agadir depuis 2008" },
      {
        property: "og:description",
        content: "Une agence indépendante, franche sur les prix et rigoureuse sur le juridique.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="L'agence"
        title="Née à Agadir, restée à Agadir."
        intro="STE MABANIS — Ste Gestion et Services — a ouvert son premier bureau à Talborjt en 2008. Nous n'avons jamais cherché à couvrir tout le Maroc : nous préférons connaître un territoire par cœur."
        image={images.teamOffice}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">Notre histoire</p>
            <h2 className="display mt-4 text-[clamp(2rem,4vw,3.25rem)]">
              Dix-huit ans à apprendre une ville
            </h2>
            <div className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-foreground/85">
              <p>
                L'agence est née d'un constat simple : à Agadir, on vendait beaucoup de biens sans
                jamais les avoir visités, et on estimait au doigt mouillé. Nous avons décidé de
                faire l'inverse — visiter chaque bien, vérifier chaque titre, argumenter chaque
                prix.
              </p>
              <p>
                De trois personnes en 2008, l'équipe est passée à onze collaborateurs répartis
                entre transaction, gestion locative et expertise. Le portefeuille a suivi : plus de
                640 transactions accompagnées et 180 lots gérés pour le compte de propriétaires
                résidents et non-résidents.
              </p>
              <p>
                Notre vision n'a pas bougé : être l'agence que l'on recommande à sa famille, celle
                qui dit non à un mandat surévalué plutôt que d'immobiliser un bien six mois.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="zoom-frame">
            <img
              src={images.locationAgadir}
              alt="Vue aérienne de la baie d'Agadir"
              loading="lazy"
              width={1280}
              height={960}
              className="aspect-4/5 w-full object-cover"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="border-t border-gold/40 pt-6">
              <p className="display text-5xl text-gold sm:text-6xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-sm text-white/65">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeading
          eyebrow="Nos valeurs"
          title="Ce sur quoi nous ne transigeons pas"
        />
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 70} className="bg-sand p-7">
              <h3 className="display rule-gold text-2xl">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="L'équipe"
          title="Onze personnes, quatre visages que vous croiserez le plus"
          action={
            <Link
              to="/equipe"
              className="link-underline text-[0.72rem] tracking-[0.18em] uppercase"
            >
              Voir toute l'équipe
            </Link>
          }
        />
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
          {agents.map((a, i) => (
            <Reveal key={a.slug} delay={i * 70} className="bg-background p-7">
              <span className="display grid size-14 place-items-center bg-navy text-xl text-gold">
                {a.initials}
              </span>
              <h3 className="display mt-4 text-2xl">
                <Link to="/equipe/$slug" params={{ slug: a.slug }} className="link-underline">
                  {a.name}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.role}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
