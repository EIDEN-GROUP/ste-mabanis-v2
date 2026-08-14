import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Facebook, AtSign, Instagram } from "lucide-react";
import { Counter, EASE } from "@/components/motion";
import { socials } from "@/lib/site-data";

/** Lucide has no Threads glyph; the @ mark stands in for the handle. */
const SOCIAL_ICONS = {
  Instagram,
  Threads: AtSign,
  Facebook,
} as const;

const heroStats = [
  { value: 18, suffix: " ans", label: "sur le Grand Agadir" },
  { value: 640, suffix: "+", label: "transactions signées" },
  { value: 180, suffix: "", label: "lots en gestion" },
];

/** Each block arrives a beat after the previous one. */
const step = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.13 },
});

/**
 * `children` est le panneau de recherche en version téléphone : il vit à
 * l'intérieur du hero, sur la vidéo. À partir de lg il disparaît d'ici, la page
 * d'accueil en posant une seconde copie à cheval sur le bord bas du hero.
 */
export function HomeHero({ children }: { children?: ReactNode }) {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy">
      {/* Fond vidéo */}
      <div className="absolute inset-0 -z-10">
        <video
          className="size-full object-cover"
          src="/hero-villa.mp4"
          poster="/hero-villa-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
        />
        {/* Voile noir : la lisibilité passe avant l'image */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      {/* Rail signature   desktop */}
      <div className="absolute inset-y-0 left-0 z-10 hidden w-12 flex-col items-center justify-between border-r border-white/10 py-32 xl:flex">
        <span className="text-[0.6rem] tracking-[0.3em] text-white/45 [writing-mode:vertical-rl]">
          AGADIR   MAROC
        </span>
        <div className="flex flex-col items-center gap-4">
          {socials.map((social) => {
            const Icon = SOCIAL_ICONS[social.label];
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="grid size-8 place-items-center text-white/45 transition-colors duration-500 hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
          <span className="h-16 w-px bg-white/20" />
        </div>
      </div>

      {/* Le panneau de recherche mange le bas de l'écran sur téléphone : les
          marges y sont resserrées pour que l'ensemble tienne sur une vue. */}
      <div className="relative mx-auto flex w-full max-w-[100rem] flex-1 flex-col px-5 pt-20 pb-8 sm:px-8 sm:pt-32 sm:pb-14 lg:px-12 lg:pt-36 lg:pb-36 xl:pl-24">
        <div className="flex flex-1 flex-col justify-center py-3 sm:py-6">
          <motion.p
            className="flex items-center gap-4 text-[0.7rem] font-medium tracking-[0.3em] text-white/70 uppercase"
            {...step(0)}
          >
            <span className="h-px w-10 bg-gold" />
            Bienvenue chez STE MABANIS
          </motion.p>

          {/* La règle de titre du site vit maintenant dans l'utilitaire `display`. */}
          <motion.h1
            className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5.4rem)] leading-[0.98] font-bold tracking-[-0.02em] text-white uppercase sm:mt-7"
            {...step(1)}
          >
            L’élégance immobilière
            <span className="block text-gold"> à Agadir.</span>
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-[0.9rem] leading-relaxed text-white/65 sm:mt-7 sm:text-base"
            {...step(2)}
          >
            Des propriétés d’exception au cœur d’Agadir et du Souss-Massa. Depuis 2024, STE MABANIS
            sélectionne et accompagne des projets immobiliers où emplacement, architecture et
            qualité de vie se rencontrent.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center"
            {...step(3)}
          >
            <Link
              to="/proprietes"
              className="btn-sheen group inline-flex items-center justify-center gap-3 rounded-md bg-gold px-8 py-4 text-[0.8rem] font-medium text-navy transition-colors duration-500 hover:bg-white"
            >
              Découvrir nos biens
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
            <Link
              to="/vendre"
              className="inline-flex items-center justify-center gap-3 rounded-md border border-white/35 px-8 py-4 text-[0.8rem] font-medium text-white transition-colors duration-500 hover:border-white hover:bg-white/10"
            >
              Estimation gratuite
            </Link>
          </motion.div>

          {children ? <div className="mt-6 sm:mt-8 lg:hidden">{children}</div> : null}
        </div>

        {/* Chiffres */}
        {/* <motion.dl
          className="mt-auto grid grid-cols-3 gap-4 border-t border-white/12 pt-8 sm:gap-10"
          {...step(4)}
        >
          {heroStats.map((s) => (
            <div key={s.label}>
              <dt className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dt>
              <dd className="mt-1.5 text-[0.62rem] leading-snug tracking-[0.16em] text-white/50 uppercase sm:text-[0.68rem]">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl> */}
      </div>
    </section>
  );
}
