import { useEffect } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Counter, MaskReveal, Reveal, TextReveal } from "@/components/motion";
import { AgencyServices } from "@/components/agence/agency-services";
import { AgencyTeam } from "@/components/agence/agency-team";
import { AgencyValues } from "@/components/agence/agency-values";
import { getLenis } from "@/components/smooth-scroll";
import { images, stats } from "@/lib/site-data";

export const Route = createFileRoute("/agence")({
  head: () => ({
    meta: [
      { title: "L'agence STE MABANIS | Équipe, services et valeurs à Agadir" },
      {
        name: "description",
        content:
          "Histoire, valeurs, services et conseillers de STE MABANIS, agence immobilière indépendante créée à Agadir en octobre 2024. Achat, vente, location, estimation et gestion locative.",
      },
      { property: "og:title", content: "L'agence STE MABANIS | Agadir depuis 2024" },
      {
        property: "og:description",
        content:
          "Une agence indépendante, franche sur les prix et rigoureuse sur le juridique. Sept métiers, quatre conseillers, un seul interlocuteur par dossier.",
      },
    ],
  }),
  component: AboutPage,
});

/** The page gathers what used to be three: hence an in-page table of contents. */
const SECTIONS = [
  { id: "histoire", label: "Notre histoire" },
  { id: "valeurs", label: "Nos valeurs" },
  { id: "services", label: "Nos services" },
  { id: "equipe", label: "L'équipe" },
] as const;

/** Lenis owns the scroll position, so hand the target to it when it is running. */
function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: -88, duration: 1.4 });
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: "smooth" });
}

function AboutPage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  // /agence#services and /agence#equipe are the redirect targets of the two old
  // pages, so arrivals have to land on the right band   clear of the fixed
  // header. Two other scrollers fire first on arrival: the root layout snaps
  // Lenis to the top, and the router jumps the fragment flush to the viewport
  // top. Hence the second frame   it lands after both, so the offset holds.
  useEffect(() => {
    if (!hash) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => scrollToSection(hash));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [hash]);

  return (
    <>
      <PageHero
        eyebrow="L'agence Agadir depuis 2024"
        lead="Notre"
        trail="agence"
        intro="STE Gestion et Services Mabanis a été officiellement créée le 30 octobre 2024, à Agadir. Nous ne cherchons pas à couvrir tout le Maroc : nous préférons connaître un territoire par cœur."
        image={images.heroAgadir}
      >
        <nav aria-label="Sections de la page" className="mt-9 flex flex-wrap gap-2.5">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section.id);
              }}
              className="btn-sheen group inline-flex items-center gap-2.5 rounded-md border border-white/30 px-5 py-2.5 text-[0.66rem] tracking-[0.16em] text-white/80 uppercase transition-colors duration-500 hover:border-gold hover:text-white"
            >
              {section.label}
              <ArrowDown className="size-3.5 text-gold transition-transform duration-500 group-hover:translate-y-0.5" />
            </a>
          ))}
        </nav>
      </PageHero>

      {/* 01   Histoire : le grand portrait à gauche, le texte et le détail à droite. */}
      <Section id="histoire" className="scroll-mt-[5.5rem]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-16 xl:gap-20">
          <MaskReveal className="zoom-frame rounded-md">
            <img
              src={images.officeMandat}
              alt="Un mandat de gestion locative STE MABANIS sur le bureau de l'agence"
              loading="lazy"
              width={1254}
              height={1254}
              className="aspect-3/4 w-full object-cover"
            />
          </MaskReveal>

          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-4">
                <span className="h-px w-8 bg-gold" />
                Notre histoire
              </p>
            </Reveal>
            <h2 className="display mt-5 text-[clamp(2rem,4.2vw,3.5rem)] leading-[0.98]">
              <TextReveal text="Créée en 2024," delay={80} />{" "}
              <span className="text-foreground/30">
                <TextReveal text="ancrée à Agadir" delay={220} />
              </span>
            </h2>

            <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-end sm:gap-10">
              <div>
                <Reveal delay={160}>
                  <div className="space-y-4 text-[0.98rem] leading-relaxed text-foreground/85">
                    <p>
                      STE Gestion et Services Mabanis a été officiellement créée le 30 octobre 2024.
                      L'agence est née d'un constat simple : à Agadir, on vendait beaucoup de biens
                      sans jamais les avoir visités, et on estimait au doigt mouillé. Nous avons
                      décidé de faire l'inverse visiter chaque bien, vérifier chaque titre,
                      argumenter chaque prix.
                    </p>
                    <p>
                      Depuis, l'agence travaille en ligne autant qu'en rendez-vous : annonces tenues
                      à jour, dossiers numérisés, réponses le jour même. Près de deux ans après
                      l'immatriculation, c'est cette façon de faire qui nous définit, bien plus que
                      la taille du portefeuille.
                    </p>
                    <p>
                      Notre ambition n'a pas bougé : être l'agence que l'on recommande à sa famille,
                      celle qui dit non à un mandat surévalué plutôt que d'immobiliser un bien six
                      mois.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={240}>
                  <Link
                    to="/contact"
                    className="btn-sheen group mt-8 inline-flex items-center gap-3 rounded-md border border-navy/25 px-7 py-3.5 text-[0.68rem] font-medium tracking-[0.18em] text-navy uppercase transition-colors duration-500 hover:border-navy hover:bg-navy hover:text-white"
                  >
                    Échanger avec nous
                    <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </Reveal>
              </div>

              <MaskReveal delay={220} className="zoom-frame rounded-md">
                <img
                  src={images.agenceImage}
                  alt="Clé à l'étiquette MABANIS sur la porte d'un bien remis à son acquéreur"
                  loading="lazy"
                  width={1512}
                  height={1000}
                  className="aspect-square w-full object-cover"
                />
              </MaskReveal>
            </div>
          </div>
        </div>
      </Section>

      {/* 02   Chiffres */}
      <section className="bg-ink px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[100rem]">
          <Reveal>
            <p className="eyebrow flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              L'agence en chiffres
            </p>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="border-t border-gold/40 pt-6">
                <p className="display text-5xl text-gold sm:text-6xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03   Valeurs. The band runs edge to edge, so the heading keeps the
          container and the panels sit outside it. */}
      <section id="valeurs" className="scroll-mt-[5.5rem] bg-sand pt-16 sm:pt-24 lg:pt-32 pb-0!">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="Nos valeurs"
            title="Ce sur quoi nous ne transigeons pas"
            intro="Quatre principes qui décident, à chaque dossier, de ce que nous acceptons et de ce que nous refusons."
          />
        </div>
        <Reveal delay={120}>
          <AgencyValues className="mt-12 sm:mt-14 lg:mt-16" />
        </Reveal>
      </section>

      {/* 04   Services (l'ancienne page /services) */}
      <AgencyServices />

      {/* 05   Équipe. Le rail déborde à droite, donc le titre garde le conteneur. */}
      {/* <section id="equipe" className="scroll-mt-[5.5rem] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="L'équipe"
            title="Vous n'aurez jamais à réexpliquer votre dossier."
            intro="Un conseiller référent qui vous suit du premier appel à la remise des clés, épaulé par l'ensemble de l'agence."
            action={
              <Link
                to="/contact"
                className="link-underline inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase"
              >
                Prendre rendez-vous <ArrowUpRight className="size-4 text-gold" />
              </Link>
            }
          />
        </div>
        <AgencyTeam className="mt-12 sm:mt-14" />
      </section> */}
    </>
  );
}
