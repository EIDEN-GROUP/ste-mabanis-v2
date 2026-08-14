import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE } from "@/components/motion";
import { images } from "@/lib/site-data";

const ways = [
  {
    word: "Acheter",
    to: "/proprietes" as const,
    image: images.property1,
    text: "Une sélection resserrée de villas, appartements et terrains à Agadir, Founty, la Marina et Taghazout   chaque bien visité et vérifié avant d'être proposé.",
  },
  {
    word: "Vendre",
    to: "/vendre" as const,
    image: images.teamOffice,
    text: "Une valeur vénale argumentée à partir des transactions réellement signées dans le Souss-Massa. Rapport remis sous 72 h, sans engagement.",
  },
  {
    word: "Gérer",
    to: "/agence" as const,
    image: images.locationMarina,
    text: "Gestion locative complète pour propriétaires résidents et MRE : loyers, entretien, fiscalité locale et reporting trimestriel.",
  },
];

/**
 * One full-bleed row per métier. The row is navy at rest; on hover its photo
 * rises behind the text, the word gets underlined and the arrow slides in.
 * Driven by `group-hover` rather than React state   hover is a CSS concern,
 * and this way it costs no render. Touch devices never hover, so there the
 * photo stays faintly visible instead of never showing at all.
 */
export function WaysToWork() {
  return (
    <div className="border-t border-white/12">
      {ways.map((w, i) => (
        <motion.div
          key={w.word}
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
        >
          <Link
            to={w.to}
            className="group relative block overflow-hidden border-b border-white/12 outline-none"
          >
            <img
              src={w.image}
              alt=""
              aria-hidden
              loading="lazy"
              width={1600}
              height={900}
              className="absolute inset-0 size-full scale-[1.06] object-cover opacity-25 transition-[opacity,scale] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-focus-visible:scale-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            />
            <div className="absolute inset-0 bg-navy opacity-75 transition-opacity duration-700 lg:opacity-100 lg:group-hover:opacity-55 lg:group-focus-visible:opacity-55" />

            <div className="relative grid grid-cols-[2.25rem_1fr] items-center gap-x-5 gap-y-6 px-5 py-10 sm:px-8 lg:grid-cols-[2.5rem_15rem_1fr_auto] lg:gap-x-10 lg:px-12 lg:py-14">
              <span className="grid size-9 place-items-center rounded-md border border-white/25 text-[0.7rem] text-white/70 transition-colors duration-500 group-hover:border-gold group-hover:text-gold">
                {i + 1}
              </span>

              <p className="text-[0.86rem] leading-relaxed text-white/65 transition-colors duration-500 group-hover:text-white/90 lg:text-[0.9rem]">
                {w.text}
              </p>

              <span className="col-span-2 lg:col-span-1">
                <span className="relative inline-block">
                  <span className="display block text-[clamp(3rem,8.5vw,8.5rem)] leading-[0.9] text-white">
                    {w.word}
                  </span>
                  {/* Le trait se déroule depuis la gauche, comme dans la référence. */}
                  <span className="absolute -bottom-1 left-0 block h-[3px] w-full origin-left scale-x-0 bg-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                </span>
              </span>

              <ArrowRight
                className="hidden size-14 shrink-0 -translate-x-6 text-white opacity-0 transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block"
                strokeWidth={1.25}
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
