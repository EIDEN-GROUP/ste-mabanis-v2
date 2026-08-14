import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { EASE, MaskReveal, Reveal } from "@/components/motion";
import { images } from "@/lib/site-data";

const DIGITS = [
  { char: "4", tone: "text-white" },
  { char: "0", tone: "text-gold" },
  { char: "4", tone: "text-white" },
];

const MARQUEE = ["Page introuvable", "Erreur 404", "STE Mabanis", "Agadir"];

/** Assez de mots pour couvrir un écran large avant que la boucle ne reparte. */
const TRACK = [...MARQUEE, ...MARQUEE, ...MARQUEE];

/**
 * Page 404 : le nombre est posé à cheval sur le bord haut de la photo, comme
 * dans la maquette de référence.
 *
 * Le fond reste sombre   l'en-tête du site traverse chaque page en transparence
 * et son texte est blanc tant qu'on n'a pas scrollé : sur un fond crème, la
 * barre disparaîtrait.
 */
export function NotFound() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 24, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 110, damping: 24, mass: 0.6 });
  const numberX = useTransform(sx, (v) => v * 26);
  const numberY = useTransform(sy, (v) => v * 14);
  const photoX = useTransform(sx, (v) => v * -14);
  const photoY = useTransform(sy, (v) => v * -9);
  const markX = useTransform(sx, (v) => v * 38);
  const markY = useTransform(sy, (v) => v * 22);

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white"
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
        my.set((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Le pictogramme en filigrane, assez pâle pour ne rien disputer au texte. */}
      <motion.div
        className="pointer-events-none absolute top-1/2 -right-[18%] w-[85%] -translate-y-1/2 opacity-[0.045] sm:-right-[10%] sm:w-[55%]"
        style={{ x: markX, y: markY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.045 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
      >
        <LogoMark />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[68rem] flex-1 px-5 pt-32 pb-14 text-center sm:px-8 sm:pt-36 lg:px-12 lg:pt-40">
        <Reveal>
          <p className="eyebrow flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-gold" />
            Erreur 404
            <span className="h-px w-8 bg-gold" />
          </p>
        </Reveal>

        {/* Photo + nombre : le 404 est centré sur l'arête haute de l'image. */}
        <div className="relative mt-16 sm:mt-20">
          <MaskReveal className="overflow-hidden rounded-md" delay={120}>
            <motion.img
              src={images.heroAgadir}
              alt=""
              width={1920}
              height={1000}
              className="aspect-[14/3] w-full object-cover sm:aspect-[14/2]"
              style={{ x: photoX, y: photoY }}
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: EASE }}
            />
          </MaskReveal>

          {/* Voile bas : la légende reste lisible quelle que soit la photo. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />

          {/* Le demi-décalage vit sur le conteneur (propriété `translate`), la
              dérive au pointeur sur l'enfant (propriété `transform`) : deux
              propriétés distinctes, donc aucune n'écrase l'autre. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center">
            <motion.span
              className="flex"
              style={{
                x: numberX,
                y: numberY,
                filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))",
              }}
            >
              {DIGITS.map((digit, i) => (
                <span key={i} className="block overflow-hidden py-[0.06em]">
                  <motion.span
                    className={`display block text-[clamp(5.5rem,20vw,15rem)] leading-[0.82] ${digit.tone}`}
                    initial={{ y: "115%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.15, ease: EASE, delay: 0.3 + i * 0.11 }}
                  >
                    {digit.char}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </div>
        </div>

        <Reveal delay={140}>
          <h1 className="display mt-12 text-[clamp(2rem,5.5vw,4rem)] sm:mt-14">Page introuvable</h1>
        </Reveal>

        <Reveal delay={220}>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/60 sm:text-base">
            La page que vous cherchez a été déplacée, ou le bien qu'elle présentait n'est plus au
            portefeuille. Reprenons depuis l'accueil.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="btn-sheen group inline-flex items-center justify-center gap-3 rounded-md bg-gold px-8 py-4 text-[0.8rem] font-medium text-navy transition-colors duration-500 hover:bg-white"
            >
              Retour à l'accueil
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
            <Link
              to="/proprietes"
              className="inline-flex items-center justify-center gap-3 rounded-md border border-white/25 px-8 py-4 text-[0.8rem] font-medium text-white transition-colors duration-500 hover:border-white hover:bg-white/10"
            >
              Voir les biens
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
