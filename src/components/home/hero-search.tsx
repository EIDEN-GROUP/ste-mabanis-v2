import { useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { EASE } from "@/components/motion";
import { locations, propertyTypes } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * Le panneau monte d'un bloc, puis ses champs arrivent l'un après l'autre.
 *
 * Les états sont les mêmes pour tout le monde   ils partent dans le HTML du
 * serveur, donc ils ne peuvent pas dépendre du navigateur. Seule la durée écoute
 * la préférence « mouvement réduit » : à zéro, le panneau est simplement là.
 */
const panelVariants = (reduced: boolean) => ({
  hidden: { opacity: 0, y: 36, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: reduced
      ? { duration: 0 }
      : {
          duration: 1,
          ease: EASE,
          // Le hero finit sa séquence vers 0.55 s : le panneau enchaîne juste après.
          delay: 0.6,
          delayChildren: 0.78,
          staggerChildren: 0.08,
        },
  },
});

const itemVariants = (reduced: boolean) => ({
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: reduced ? { duration: 0 } : { duration: 0.7, ease: EASE } },
});

/** Label · champ arrondi · légende   la trame de la maquette. */
function Field({
  label,
  hint,
  value,
  onChange,
  children,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.label
      variants={itemVariants(Boolean(reduced))}
      className="flex min-w-0 flex-col gap-1.5 px-1 py-0.5 sm:gap-2 sm:py-1 lg:flex-1 lg:px-5"
    >
      <span className="text-[0.78rem] font-semibold text-navy">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="peer h-10 w-full cursor-pointer sm:h-11 appearance-none rounded-md border border-line bg-white pr-10 pl-4 text-sm text-navy transition-[border-color,box-shadow] duration-300 outline-none hover:border-navy/30 focus:border-gold focus:ring-2 focus:ring-gold/25"
        >
          {children}
        </select>
        {/* Le chevron se retourne dès que le champ prend le focus. */}
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-navy/40 transition-transform duration-300 peer-focus:rotate-180 peer-focus:text-gold" />
      </span>
      {/* La légende ne survit pas au format téléphone : trois lignes de plus feraient
          descendre le bouton hors de l'écran. Elle se relaie en fondu quand elle change. */}
      <span className="hidden h-4 overflow-hidden lg:block">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={hint}
            className="block truncate text-[0.72rem] text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {hint}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.label>
  );
}

export function HeroSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  // Le panneau est monté deux fois (mobile dans le hero, desktop à cheval sur son
  // bord) : l'identifiant garde les deux pastilles animées indépendantes.
  const tabId = useId();
  const [transaction, setTransaction] = useState<"vente" | "location">("vente");
  const [lieu, setLieu] = useState("");
  const [type, setType] = useState("");
  const [prixMax, setPrixMax] = useState("");

  const submit = () =>
    navigate({
      to: "/proprietes",
      search: {
        transaction,
        lieu,
        type,
        prixMax: prixMax ? Number(prixMax) : 0,
        chambres: 0,
        surfaceMin: 0,
        tri: "recent",
      },
    });

  const lieuLabel = locations.find((l) => l.slug === lieu)?.city ?? "Tout le Grand Agadir";

  return (
    <motion.div
      className={cn("w-full", className)}
      variants={panelVariants(Boolean(reduced))}
      initial="hidden"
      animate="show"
    >
      <div className="rounded-md bg-white p-3.5 shadow-[0_30px_70px_-32px_rgba(7,26,47,0.55)] sm:p-5">
        {/* Acheter / Louer   le fond navy tient aussi bien sur la vidéo que sur la page */}
        <motion.div
          variants={itemVariants(Boolean(reduced))}
          className="mb-3 inline-flex rounded-md bg-navy/90 p-1 backdrop-blur-sm sm:mb-4"
        >
          {(
            [
              { key: "vente", label: "Acheter" },
              { key: "location", label: "Louer" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTransaction(t.key)}
              aria-pressed={transaction === t.key}
              className="relative rounded-sm px-5 py-2 text-[0.75rem] font-medium sm:px-6 sm:py-2.5 sm:text-[0.78rem]"
            >
              {/* La pastille blanche glisse d'un onglet à l'autre au lieu de clignoter. */}
              {transaction === t.key ? (
                <motion.span
                  layoutId={`hero-search-tab-${tabId}`}
                  className="absolute inset-0 rounded-sm bg-white"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 36, mass: 0.6 }
                  }
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  transaction === t.key ? "text-navy" : "text-white/65 hover:text-white",
                )}
              >
                {t.label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Deux colonnes sur téléphone (le bouton complète la ligne du budget),
            une seule rangée divisée à partir de lg. */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:flex lg:items-center lg:gap-0 lg:divide-x lg:divide-line">
          <Field label="Localisation" hint={lieuLabel} value={lieu} onChange={setLieu}>
            <option value="">Tout le Grand Agadir</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Field>

          <Field
            label="Type de bien"
            hint={type || "Villas, appartements, riads…"}
            value={type}
            onChange={setType}
          >
            <option value="">Tous les types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Field>

          <Field
            label="Budget"
            hint={transaction === "vente" ? "Prix d'achat maximum" : "Loyer mensuel maximum"}
            value={prixMax}
            onChange={setPrixMax}
          >
            <option value="">Sans limite</option>
            {transaction === "vente" ? (
              <>
                <option value="1500000">1 500 000 MAD</option>
                <option value="3000000">3 000 000 MAD</option>
                <option value="5000000">5 000 000 MAD</option>
                <option value="10000000">10 000 000 MAD</option>
              </>
            ) : (
              <>
                <option value="8000">8 000 MAD / mois</option>
                <option value="15000">15 000 MAD / mois</option>
                <option value="25000">25 000 MAD / mois</option>
              </>
            )}
          </Field>

          <motion.div
            variants={itemVariants(Boolean(reduced))}
            className="flex items-end px-1 pb-0.5 sm:pb-1 lg:block lg:shrink-0 lg:pb-0 lg:pl-5"
          >
            <motion.button
              type="button"
              onClick={submit}
              whileHover={reduced ? {} : { y: -2 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="btn-sheen group flex h-10 w-full items-center justify-center gap-2.5 rounded-md bg-navy px-4 text-[0.8rem] font-medium text-white transition-colors duration-500 hover:bg-gold hover:text-navy sm:h-11 lg:h-auto lg:w-auto lg:px-8 lg:py-4"
            >
              <Search className="size-4 transition-transform duration-500 group-hover:scale-110" />
              Rechercher
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
