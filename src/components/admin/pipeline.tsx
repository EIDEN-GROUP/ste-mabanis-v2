import { useState } from "react";
import { PIPELINE_STAGES, type Lead, type PipelineStage } from "@/lib/admin/types";
import type { AdminProperty, Client } from "@/lib/admin/types";
import { formatMoney, label, STAGE_LABELS } from "@/lib/admin/format";
import { LeadCard } from "./cards";
import { cn } from "@/lib/utils";

/**
 * Kanban pipeline. Columns scroll horizontally on small screens with snap
 * points, so a phone gets one readable column at a time instead of a squeeze.
 * Drag-and-drop is pointer-only; the select on each card is the accessible
 * path to the same action.
 */
export function Pipeline({
  leads,
  clients,
  properties,
  onMove,
  className,
}: {
  leads: Lead[];
  clients: Map<string, Client>;
  properties: Map<string, AdminProperty>;
  onMove?: (leadId: string, stage: PipelineStage) => void;
  className?: string;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<PipelineStage | null>(null);

  const byStage = (stage: PipelineStage) => leads.filter((l) => l.stage === stage);

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] snap-x snap-mandatory lg:snap-none",
        className,
      )}
    >
      {PIPELINE_STAGES.map((stage) => {
        const items = byStage(stage);
        const total = items.reduce((s, l) => s + l.value, 0);
        const isOver = over === stage;

        return (
          <section
            key={stage}
            onDragOver={(e) => {
              if (!dragging) return;
              e.preventDefault();
              setOver(stage);
            }}
            onDragLeave={() => setOver((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) onMove?.(dragging, stage);
              setDragging(null);
              setOver(null);
            }}
            className={cn(
              "flex w-[17rem] shrink-0 snap-start flex-col border bg-admin-bg/60 transition-colors duration-300 sm:w-[19rem] lg:w-auto lg:flex-1 lg:min-w-[15rem]",
              isOver ? "border-gold bg-gold/5" : "border-line",
            )}
          >
            <header className="flex items-center gap-2 border-b border-line px-3.5 py-3">
              <h3 className="min-w-0 flex-1 truncate text-[0.65rem] tracking-[0.16em] text-navy uppercase">
                {label(STAGE_LABELS, stage)}
              </h3>
              <span className="shrink-0 bg-sand px-1.5 py-0.5 text-[0.62rem] font-medium text-navy tabular-nums">
                {items.length}
              </span>
            </header>

            <p className="border-b border-line px-3.5 py-2 text-[0.68rem] text-muted-foreground tabular-nums">
              {formatMoney(total, true)}
            </p>

            <div className="flex flex-1 flex-col gap-2.5 p-2.5">
              {items.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground/70">Vide</p>
              ) : (
                items.map((lead, i) => (
                  <div key={lead.id} className="space-y-1.5">
                    <LeadCard
                      lead={lead}
                      client={clients.get(lead.clientId)}
                      property={lead.propertyId ? properties.get(lead.propertyId) : undefined}
                      index={i}
                      draggable={Boolean(onMove)}
                      onDragStart={() => setDragging(lead.id)}
                      className={cn(dragging === lead.id && "opacity-40")}
                    />
                    {onMove ? (
                      // aria-label rather than a visually-hidden <span>: an
                      // absolutely-positioned sr-only element inside this
                      // horizontal scroller escapes its clipping and stretches
                      // the page.
                      <select
                        aria-label="Déplacer vers une autre étape"
                        value={stage}
                        onChange={(e) => onMove(lead.id, e.target.value as PipelineStage)}
                        className="min-h-9 w-full border border-line bg-admin-surface px-2 py-1 text-[0.68rem] text-muted-foreground outline-none focus:border-gold"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {label(STAGE_LABELS, s)}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
