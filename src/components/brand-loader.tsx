import { motion } from "framer-motion";
import { LogoMark } from "@/components/logo-mark";
import { EASE } from "@/components/motion";
import type { IntroPhase } from "@/hooks/use-brand-intro";
import { cn } from "@/lib/utils";

/** Courbe de rideau   la même que le menu plein écran de l'en-tête. */
const CURTAIN = [0.76, 0, 0.24, 1] as const;

/** Le menu balaie en trois lames ; le rideau d'ouverture reprend le geste. */
const SLICES = 3;

const WORDMARK = "STE MABANIS";

/**
 * Rideau d'ouverture : le pictogramme se construit du sol vers le ciel, un
 * reflet doré le traverse, puis l'écran se replie en trois lames décalées  
 * exactement le geste du menu   en découvrant la page du bas vers le haut.
 */
export function BrandLoader({ phase }: { phase: IntroPhase }) {
  if (phase === "done") return null;

  const out = phase === "out";

  return (
    <div
      aria-hidden
      className={cn("fixed inset-0 z-[100] overflow-hidden", out && "pointer-events-none")}
    >
      {/* Les lames : origine en haut, donc elles remontent et la page se
          découvre par le bas. Le pixel de trop évite un liseré entre elles. */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: SLICES }, (_, i) => (
          <motion.span
            key={i}
            className="-mr-px h-full flex-1 origin-top bg-navy"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: out ? 0 : 1 }}
            transition={{ duration: 0.75, ease: CURTAIN, delay: out ? 0.12 + i * 0.08 : 0 }}
          />
        ))}
      </div>

      {/* Halo doré très dilué : la nuit du fond n'est pas tout à fait plate. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 46% at 50% 42%, color-mix(in oklab, var(--gold) 15%, transparent), transparent 72%)",
        }}
        animate={{ opacity: out ? 0 : 1 }}
        transition={{ duration: 0.3, ease: EASE }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Le contenu s'efface avant les lames, comme les colonnes du menu. */}
        <motion.div
          className="relative flex flex-col items-center px-8"
          animate={out ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="relative w-36 sm:w-48">
            {/* Le tracé fantôme reste là pendant que le bâtiment se remplit. */}
            <LogoMark className="opacity-[0.14]" />

            {/* Le remplissage monte du sol : les montagnes d'abord, la tour ensuite. */}
            <motion.div
              className="absolute inset-0"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.15, ease: EASE, delay: 0.12 }}
            >
              <LogoMark />
            </motion.div>

            {/* Reflet doré qui balaie la façade une seule fois. */}
            <motion.span
              className="pointer-events-none absolute inset-y-[-15%] w-1/3 -skew-x-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--gold) 60%, transparent), transparent)",
                filter: "blur(7px)",
              }}
              initial={{ x: "-180%", opacity: 0 }}
              animate={{ x: "300%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.25, ease: [0.65, 0, 0.35, 1], delay: 0.75 }}
            />
          </div>

          {/* Le nom se lève lettre par lettre derrière son masque. */}
          <div className="mt-7 flex overflow-hidden text-[0.6rem] font-medium tracking-[0.42em] text-white/75 uppercase sm:text-[0.68rem]">
            {WORDMARK.split("").map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                className="inline-block"
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.45 + i * 0.04 }}
              >
                {letter === " " ? " " : letter}
              </motion.span>
            ))}
          </div>

          {/* Le fil doré tient lieu de barre de progression. */}
          <div className="mt-5 h-px w-36 bg-white/15 sm:w-48">
            <motion.div
              className="h-full origin-left bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.55, ease: [0.65, 0, 0.35, 1], delay: 0.25 }}
            />
          </div>

          <motion.p
            className="mt-4 text-[0.58rem] tracking-[0.32em] text-white/40 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          >
            Agadir · Immobilier
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
