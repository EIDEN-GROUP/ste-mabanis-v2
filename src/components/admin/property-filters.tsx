import { useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/admin/types";
import { label, PROPERTY_STATUS_LABELS } from "@/lib/admin/format";
import type { PropertyQuery } from "@/lib/admin/repository";
import { Drawer, AdminButton } from "./primitives";
import { cn } from "@/lib/utils";

/**
 * Filters live inline on desktop and inside a drawer on mobile — the spec's
 * "drawer-style filters" rule. Both render the same `<Fields>` body.
 */
export function PropertyFilters({
  value,
  onChange,
  className,
}: {
  value: PropertyQuery;
  onChange: (next: PropertyQuery) => void;
  className?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCount =
    (value.status?.length ?? 0) + (value.transaction ? 1 : 0) + (value.sort ? 1 : 0);

  const fields = <Fields value={value} onChange={onChange} />;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={value.search ?? ""}
            onChange={(e) => onChange({ ...value, search: e.target.value || undefined })}
            placeholder="Référence, titre, quartier…"
            aria-label="Rechercher un bien"
            className="h-11 w-full border border-line bg-admin-surface pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-gold"
          />
        </label>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative inline-flex h-11 shrink-0 items-center gap-2 border border-line bg-admin-surface px-4 text-[0.68rem] tracking-[0.14em] text-navy uppercase transition-colors hover:border-gold lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filtres
          {activeCount > 0 ? (
            <span className="grid size-[1.1rem] place-items-center bg-gold text-[0.6rem] text-navy tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-4 hidden lg:block">{fields}</div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filtres"
        footer={
          <>
            <AdminButton
              variant="outline"
              className="flex-1"
              onClick={() => onChange({ search: value.search })}
            >
              Réinitialiser
            </AdminButton>
            <AdminButton className="flex-1" onClick={() => setDrawerOpen(false)}>
              Voir les résultats
            </AdminButton>
          </>
        }
      >
        {fields}
      </Drawer>
    </div>
  );
}

function Fields({
  value,
  onChange,
}: {
  value: PropertyQuery;
  onChange: (next: PropertyQuery) => void;
}) {
  const toggleStatus = (s: PropertyStatus) => {
    const current = value.status ?? [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    onChange({ ...value, status: next.length ? next : undefined });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="eyebrow mb-3">Statut</legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_STATUSES.map((s) => {
            const on = value.status?.includes(s) ?? false;
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                aria-pressed={on}
                className={cn(
                  "min-h-9 border px-3 py-1.5 text-[0.68rem] tracking-[0.1em] uppercase transition-colors duration-300",
                  on
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-line text-muted-foreground hover:border-gold/60",
                )}
              >
                {label(PROPERTY_STATUS_LABELS, s)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Transaction</legend>
        <div className="flex flex-wrap gap-2">
          {(["vente", "location"] as const).map((t) => {
            const on = value.transaction === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...value, transaction: on ? undefined : t })}
                aria-pressed={on}
                className={cn(
                  "min-h-9 border px-3 py-1.5 text-[0.68rem] tracking-[0.1em] uppercase transition-colors duration-300",
                  on
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-line text-muted-foreground hover:border-gold/60",
                )}
              >
                {t === "vente" ? "À vendre" : "À louer"}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Tri</legend>
        <select
          value={value.sort ?? "recent"}
          onChange={(e) => onChange({ ...value, sort: e.target.value as PropertyQuery["sort"] })}
          className="h-11 w-full border border-line bg-admin-surface px-3 text-sm outline-none focus:border-gold lg:w-56"
        >
          <option value="recent">Plus récents</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="price_asc">Prix croissant</option>
          <option value="views">Plus vus</option>
        </select>
      </fieldset>

      {(value.status?.length || value.transaction) && (
        <button
          type="button"
          onClick={() => onChange({ search: value.search })}
          className="inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-navy"
        >
          <X className="size-3.5" />
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
