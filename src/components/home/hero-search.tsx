import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { locations, propertyTypes } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Label · champ arrondi · légende — la trame de la maquette. */
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
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 px-1 py-1 sm:px-5">
      <span className="text-[0.78rem] font-semibold text-navy">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-md border border-line bg-white pr-10 pl-4 text-sm text-navy transition-colors duration-300 outline-none hover:border-navy/30 focus:border-gold"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-navy/40" />
      </span>
      {/* La légende ne survit pas au format téléphone : trois lignes de plus feraient
          descendre le bouton hors de l'écran. */}
      <span className="hidden truncate text-[0.72rem] text-muted-foreground sm:block">{hint}</span>
    </label>
  );
}

export function HeroSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
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
    <div className={cn("w-full", className)}>
      <div className="rounded-md bg-white p-4 shadow-[0_30px_70px_-32px_rgba(7,26,47,0.55)] sm:p-5">
        {/* Acheter / Louer — le fond navy tient aussi bien sur la vidéo que sur la page */}
        <div className="mb-4 inline-flex rounded-md bg-navy/90 p-1 backdrop-blur-sm">
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
              className={cn(
                "rounded-sm px-6 py-2.5 text-[0.78rem] font-medium transition-colors duration-500",
                transaction === t.key ? "bg-white text-navy" : "text-white/65 hover:text-white",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-0 lg:divide-x lg:divide-line sm:gap-4">
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

          <div className="shrink-0 lg:pl-5">
            <button
              type="button"
              onClick={submit}
              className="btn-sheen group flex w-full items-center justify-center gap-2.5 rounded-md bg-navy px-8 py-4 text-[0.8rem] font-medium text-white transition-colors duration-500 hover:bg-gold hover:text-navy lg:w-auto"
            >
              <Search className="size-4" />
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
