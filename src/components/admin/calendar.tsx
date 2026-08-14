import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "@/lib/admin/types";
import { formatTime } from "@/lib/admin/format";
import { SEED_NOW } from "@/lib/admin/seed";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Monday-first offset for the first cell of the grid. */
function leadingBlanks(d: Date) {
  return (startOfMonth(d).getDay() + 6) % 7;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Month grid with a day detail panel. Day and week views arrive with Phase 3;
 * the month view is what the shell needs to prove the layout and motion.
 */
export function Calendar({
  appointments,
  className,
}: {
  appointments: Appointment[];
  className?: string;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(SEED_NOW));
  const [selected, setSelected] = useState<Date>(SEED_NOW);

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const blanks = leadingBlanks(cursor);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const d = new Date(a.startsAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [appointments]);

  const keyFor = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const selectedItems = (byDay.get(keyFor(selected)) ?? []).sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    // min-w-0: as a grid/flex child it must be allowed to shrink below the
    // min-content width of its header row.
    // overflow-hidden keeps the day grid's cell borders inside the rounded corner.
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-md border border-line bg-admin-surface",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <h3 className="display min-w-0 flex-1 truncate text-lg capitalize">
          {cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Mois précédent"
          className="grid size-9 place-items-center rounded-md border border-line text-navy transition-colors hover:border-gold"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Mois suivant"
          className="grid size-9 place-items-center rounded-md border border-line text-navy transition-colors hover:border-gold"
        >
          <ChevronRight className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-7 border-b border-line">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: blanks }, (_, i) => (
          <div
            key={`blank-${i}`}
            className="aspect-square border-r border-b border-line/60 last:border-r-0"
          />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), i + 1);
          const items = byDay.get(keyFor(date)) ?? [];
          const isToday = sameDay(date, SEED_NOW);
          const isSelected = sameDay(date, selected);

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(date)}
              aria-current={isSelected ? "date" : undefined}
              className={cn(
                "relative flex aspect-square min-h-11 flex-col items-center justify-center gap-1 border-r border-b border-line/60 transition-colors duration-200",
                isSelected ? "bg-gold/12" : "hover:bg-sand",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-md text-sm tabular-nums",
                  isToday && "bg-navy text-white",
                  isSelected && !isToday && "text-navy",
                )}
              >
                {i + 1}
              </span>
              {items.length ? (
                <span className="flex gap-0.5">
                  {items.slice(0, 3).map((a) => (
                    <span key={a.id} className="size-1 rounded-full bg-gold" />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="border-t border-line p-4">
        <p className="eyebrow">
          {selected.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {selectedItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun rendez-vous ce jour.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedItems.map((a, i) => (
              <li
                key={a.id}
                style={{ ["--i" as string]: i }}
                className="stagger-in flex items-center gap-3 rounded-md border border-line px-3 py-2.5"
              >
                <span className="text-xs font-medium text-navy tabular-nums">
                  {formatTime(a.startsAt)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
