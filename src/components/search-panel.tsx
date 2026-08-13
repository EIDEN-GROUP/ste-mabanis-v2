import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { locations, propertyTypes } from "@/lib/site-data";

export function SearchPanel({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<"vente" | "location">("vente");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  const submit = () => {
    navigate({
      to: "/proprietes",
      search: {
        transaction,
        lieu: location || "",
        type: type || "",
        prixMax: budget ? Number(budget) : 0,
        chambres: 0,
        surfaceMin: 0,
        tri: "recent",
      },
    });
  };

  return (
    <div className={compact ? "bg-transparent" : "bg-card/95 p-5 shadow-elegant backdrop-blur sm:p-7"}>
      <div className="flex gap-1 border-b border-line">
        {(["vente", "location"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTransaction(t)}
            className={`px-4 py-2.5 text-[0.7rem] tracking-[0.16em] uppercase transition-colors ${
              transaction === t
                ? "border-b-2 border-gold text-navy"
                : "border-b-2 border-transparent text-muted-foreground hover:text-navy"
            }`}
          >
            {t === "vente" ? "Acheter" : "Louer"}
          </button>
        ))}
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
            Quartier
          </span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 border border-line bg-background px-3 text-sm outline-none focus:border-gold"
          >
            <option value="">Tous les quartiers</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
            Type de bien
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 border border-line bg-background px-3 text-sm outline-none focus:border-gold"
          >
            <option value="">Tous les types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
            Budget maximum
          </span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-11 border border-line bg-background px-3 text-sm outline-none focus:border-gold"
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
          </select>
        </label>

        <div className="flex flex-col justify-end gap-1.5">
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-11 items-center justify-center gap-2 bg-navy px-5 text-[0.7rem] tracking-[0.16em] text-white uppercase transition-colors hover:bg-gold hover:text-navy"
          >
            <Search className="size-4" />
            Rechercher
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Vous ne trouvez pas ?{" "}
        <Link to="/contact" className="link-underline text-navy">
          Confiez-nous votre recherche
        </Link>
        , nous avons aussi des biens hors marché.
      </p>
    </div>
  );
}
