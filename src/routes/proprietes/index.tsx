import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHero } from "@/components/layout-bits";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/motion";
import { getLenis } from "@/components/smooth-scroll";
import { useFavorites } from "@/hooks/use-favorites";
import { images, locations, properties, propertyTypes, type Transaction } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type PropertySearch = {
  transaction?: Transaction;
  lieu?: string;
  type?: string;
  prixMax?: number;
  surfaceMin?: number;
  chambres?: number;
  tri?: string;
};

export const Route = createFileRoute("/proprietes/")({
  validateSearch: (search: Record<string, unknown>): PropertySearch => ({
    transaction: search["transaction"] === "location" ? "location" : "vente",
    lieu: typeof search["lieu"] === "string" ? (search["lieu"] as string) : "",
    type: typeof search["type"] === "string" ? (search["type"] as string) : "",
    prixMax: Number(search["prixMax"]) || 0,
    surfaceMin: Number(search["surfaceMin"]) || 0,
    chambres: Number(search["chambres"]) || 0,
    tri: typeof search["tri"] === "string" ? (search["tri"] as string) : "recent",
  }),
  head: () => ({
    meta: [
      { title: "Propriétés à vendre et à louer à Agadir   STE MABANIS" },
      {
        name: "description",
        content:
          "Parcourez les villas, appartements, penthouses et bureaux proposés par STE MABANIS à Agadir, Founty, la Marina et Taghazout. Filtres par prix, surface et chambres.",
      },
      { property: "og:title", content: "Propriétés à vendre et à louer à Agadir" },
      {
        property: "og:description",
        content: "Le portefeuille complet de STE MABANIS, filtrable par quartier, type et budget.",
      },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/proprietes/" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { favorites } = useFavorites();
  const resultsRef = useRef<HTMLElement>(null);

  const scrollToResults = () => {
    const el = resultsRef.current;
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -88 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const update = (patch: Partial<PropertySearch>) => {
    navigate({
      search: (prev: PropertySearch) => ({ ...prev, ...patch }),
      resetScroll: false,
    });
    // A filter change lands on the results section top, not the top of the page.
    if (!filtersOpen) scrollToResults();
  };

  const results = useMemo(() => {
    let list = properties.filter((p) => p.transaction === search.transaction);
    if (search.lieu) list = list.filter((p) => p.locationSlug === search.lieu);
    if (search.type) list = list.filter((p) => p.type === search.type);
    const { prixMax, surfaceMin, chambres } = search;
    if (prixMax) list = list.filter((p) => p.price <= prixMax);
    if (surfaceMin) list = list.filter((p) => p.surface >= surfaceMin);
    if (chambres) list = list.filter((p) => p.bedrooms >= chambres);
    if (onlyFavorites) list = list.filter((p) => favorites.includes(p.slug));

    const sorted = [...list];
    if (search.tri === "prix-asc") sorted.sort((a, b) => a.price - b.price);
    else if (search.tri === "prix-desc") sorted.sort((a, b) => b.price - a.price);
    else if (search.tri === "surface") sorted.sort((a, b) => b.surface - a.surface);
    else sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return sorted;
  }, [search, onlyFavorites, favorites]);

  const activeCount =
    (search.lieu ? 1 : 0) +
    (search.type ? 1 : 0) +
    (search.prixMax ? 1 : 0) +
    (search.surfaceMin ? 1 : 0) +
    (search.chambres ? 1 : 0);

  const filters = (
    <div className="space-y-6">
      <Field label="Quartier">
        <select
          value={search.lieu}
          onChange={(e) => update({ lieu: e.target.value })}
          className="h-11 w-full rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Tous les quartiers</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Type de bien">
        <select
          value={search.type}
          onChange={(e) => update({ type: e.target.value })}
          className="h-11 w-full rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Tous les types</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Budget maximum">
        <select
          value={String(search.prixMax)}
          onChange={(e) => update({ prixMax: Number(e.target.value) })}
          className="h-11 w-full rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-gold"
        >
          <option value="0">Sans limite</option>
          {(search.transaction === "vente"
            ? [1500000, 3000000, 5000000, 10000000]
            : [8000, 15000, 25000]
          ).map((v) => (
            <option key={v} value={v}>
              {new Intl.NumberFormat("fr-MA").format(v)} MAD
              {search.transaction === "location" ? " / mois" : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label={`Surface minimum : ${search.surfaceMin || 0} m²`}>
        <input
          type="range"
          min={0}
          max={450}
          step={10}
          value={search.surfaceMin}
          onChange={(e) => update({ surfaceMin: Number(e.target.value) })}
          className="w-full accent-[var(--gold)]"
        />
      </Field>

      <Field label="Chambres">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update({ chambres: n })}
              className={cn(
                "h-10 min-w-11 rounded-md border px-3 text-sm transition-colors",
                search.chambres === n
                  ? "border-gold bg-gold text-navy"
                  : "border-line hover:border-navy",
              )}
            >
              {n === 0 ? "Toutes" : `${n}+`}
            </button>
          ))}
        </div>
      </Field>

      <button
        type="button"
        onClick={() => update({ lieu: "", type: "", prixMax: 0, surfaceMin: 0, chambres: 0 })}
        className="text-xs tracking-[0.16em] text-muted-foreground uppercase underline underline-offset-4 hover:text-navy"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="Portefeuille"
        lead="Nos"
        trail="propriétés"
        intro="Chaque bien a été visité avant d'être publié. Villas, appartements, riads, penthouses et locaux professionnels sur Agadir et le littoral : aucun bien n'entre ici sans vérification du titre foncier."
        image={images.property2}
      />

      <section ref={resultsRef} className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[100rem]">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-6 border-b border-line">
            {(["vente", "location"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ transaction: t, prixMax: 0 })}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-sm tracking-[0.14em] uppercase transition-colors",
                  search.transaction === t
                    ? "border-gold text-navy"
                    : "border-transparent text-muted-foreground hover:text-navy",
                )}
              >
                {t === "vente" ? "Acheter" : "Louer"}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3 pb-3">
              <button
                type="button"
                onClick={() => setOnlyFavorites((v) => !v)}
                className={cn(
                  "rounded-md border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors",
                  onlyFavorites ? "border-gold bg-gold text-navy" : "border-line hover:border-navy",
                )}
              >
                Favoris ({favorites.length})
              </button>
              <select
                value={search.tri}
                onChange={(e) => update({ tri: e.target.value })}
                className="h-9 rounded-md border border-line bg-background px-3 text-xs outline-none focus:border-gold"
                aria-label="Trier les résultats"
              >
                <option value="recent">Plus récents</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="surface">Plus grande surface</option>
              </select>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-xs tracking-[0.14em] uppercase lg:hidden"
              >
                <SlidersHorizontal className="size-3.5" /> Filtres
                {activeCount ? ` (${activeCount})` : ""}
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-14">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="eyebrow">Filtres avancés</p>
                <div className="mt-6">{filters}</div>
              </div>
            </aside>

            <div>
              <p className="text-sm text-muted-foreground">
                {results.length} bien{results.length > 1 ? "s" : ""} correspondant
                {results.length > 1 ? "s" : ""} à votre recherche
              </p>

              {results.length ? (
                <div className="mt-6 grid gap-8 sm:grid-cols-2 2xl:grid-cols-3">
                  {/* Delay is capped so a long result list does not wait a second to appear. */}
                  {results.map((p, i) => (
                    <Reveal key={p.slug} delay={Math.min(i, 5) * 70}>
                      <PropertyCard property={p} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-md border border-line bg-card p-10 text-center">
                  <h2 className="display text-3xl">Aucun bien ne correspond encore</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                    Élargissez vos critères ou confiez-nous votre recherche : une partie de notre
                    portefeuille ne passe jamais en ligne.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-6 inline-block bg-navy px-6 py-3 text-[0.7rem] tracking-[0.18em] text-white uppercase hover:bg-gold hover:text-navy"
                  >
                    Décrire ma recherche
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          filtersOpen ? "visible" : "invisible pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-navy/60 transition-opacity duration-300",
            filtersOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setFiltersOpen(false)}
        />
        {/* `data-lenis-prevent` : sans lui, le défilement inertiel capte le
            geste au-dessus du tiroir et fait bouger la page derrière. */}
        <div
          data-lenis-prevent
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto overscroll-contain bg-background p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            filtersOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="eyebrow">Filtres</p>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
          {filters}
          <button
            type="button"
            onClick={() => {
              setFiltersOpen(false);
              scrollToResults();
            }}
            className="mt-8 w-full bg-navy py-4 text-[0.7rem] tracking-[0.18em] text-white uppercase"
          >
            Voir les {results.length} résultats
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}
