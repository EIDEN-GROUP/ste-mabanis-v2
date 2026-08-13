import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { EmptyState, LoadingState } from "./primitives";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: string;
  /** Rendered in the desktop table cell and as the mobile card's value. */
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
  /** Hide below this breakpoint on the desktop table. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  /** Promote to the mobile card's title line instead of a labelled row. */
  primary?: boolean;
};

const HIDE: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

/**
 * One dataset, two presentations: a real table from `md` up, and a stack of
 * cards below it. The spec asks for cards rather than a squeezed table on
 * phones, so the `<table>` is not merely scrolled — it is replaced.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  isLoading,
  empty,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  empty?: { title: string; description?: string; action?: ReactNode };
  className?: string;
}) {
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), "fr") * dir;
    });
  }, [rows, columns, sort]);

  const toggleSort = (id: string) =>
    setSort((s) =>
      s?.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null,
    );

  if (isLoading) return <LoadingState rows={6} className={className} />;

  if (!rows.length) {
    return (
      <EmptyState
        title={empty?.title ?? "Aucun résultat"}
        {...(empty?.description ? { description: empty.description } : {})}
        {...(empty?.action ? { action: empty.action } : {})}
        className={className}
      />
    );
  }

  const primary = columns.find((c) => c.primary) ?? columns[0]!;
  const secondary = columns.filter((c) => c.id !== primary.id);

  return (
    <div className={className}>
      {/* ---------- md+ : table ---------- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => {
                const active = sort?.id === col.id;
                const Icon = !active
                  ? ChevronsUpDown
                  : sort.dir === "asc"
                    ? ChevronUp
                    : ChevronDown;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-[0.6rem] font-medium tracking-[0.16em] text-muted-foreground uppercase",
                      col.hideBelow && HIDE[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        aria-label={`Trier par ${col.header}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-navy",
                          active && "text-navy",
                        )}
                      >
                        {col.header}
                        <Icon className={cn("size-3", active ? "text-gold" : "opacity-45")} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ ["--i" as string]: Math.min(i, 12) }}
                className={cn(
                  "stagger-in border-b border-line transition-colors duration-200 last:border-0",
                  onRowClick && "cursor-pointer hover:bg-sand",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-4 py-3.5 align-middle",
                      col.hideBelow && HIDE[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- below md : cards ---------- */}
      <ul className="space-y-3 md:hidden">
        {sorted.map((row, i) => (
          <li key={getRowId(row)} style={{ ["--i" as string]: Math.min(i, 12) }}>
            <div
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={cn(
                "stagger-in border border-line bg-admin-surface p-4",
                onRowClick && "cursor-pointer transition-colors active:bg-sand",
              )}
            >
              <div className="text-sm font-medium text-navy">{primary.cell(row)}</div>
              <dl className="mt-3 space-y-2 border-t border-line pt-3">
                {secondary.map((col) => (
                  <div key={col.id} className="flex items-start justify-between gap-4">
                    <dt className="text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                      {col.header}
                    </dt>
                    <dd className="min-w-0 text-right text-sm">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
