import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Zap, AlarmClock, CalendarClock, Send, History, PhoneCall } from "lucide-react";
import {
  automationsQuery,
  inactiveLeadsQuery,
  appointmentsQuery,
  useSetAutomation,
  useCreateCallbackTask,
} from "@/lib/admin/queries";
import type { AutomationRuleKey } from "@/lib/admin/types";
import { relativeTime } from "@/lib/admin/format";
import {
  StatCard,
  Panel,
  AdminButton,
  EmptyState,
  Switch,
  toast,
} from "@/components/admin/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/automatisations")({
  head: () => ({
    meta: [
      { title: "Automatisations   STE MABANIS" },
      { name: "description", content: "Règles automatiques de l'agence." },
    ],
  }),
  component: AutomationsPage,
});

const RULE_LABELS: Record<AutomationRuleKey, string> = {
  leadFirstContact: "Premier contact",
  visitConfirmTask: "Confirmation de visite",
  soldClosesTransaction: "Clôture de transaction",
  inactiveLeadRelance: "Relance des leads inactifs",
};

function AutomationsPage() {
  const { data: automations } = useQuery(automationsQuery());
  const { data: inactive = [] } = useQuery(inactiveLeadsQuery());
  const { data: appointments = [] } = useQuery(appointmentsQuery());
  const setAutomation = useSetAutomation();
  const createCallback = useCreateCallbackTask();

  const rules = automations?.rules ?? [];
  const runs = automations?.runs ?? [];

  const pendingConfirmations = useMemo(() => {
    const soon = new Date(Date.now() + 48 * 3_600_000).toISOString();
    return appointments
      .filter(
        (a) =>
          a.kind === "viewing" &&
          a.status === "scheduled" &&
          a.startsAt >= new Date().toISOString() &&
          a.startsAt <= soon,
      )
      .slice(0, 8);
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Moteur d'automatisation</p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Chaque règle déclenche tâches et notifications quand un événement se produit. Désactiver
            une règle n'efface pas son historique.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-xs text-muted-foreground">
          <Zap className="size-3.5 text-gold" />
          {rules.filter((r) => r.enabled).length}/{rules.length} règles actives
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rules.map((rule) => (
          <Panel key={rule.key} className="p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-sand text-gold">
                <Zap className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-navy">{rule.title}</h3>
                  <Switch
                    checked={rule.enabled}
                    onChange={(v) => setAutomation.mutate({ key: rule.key, enabled: v })}
                    label={rule.title}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {rule.description}
                </p>
                <p className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {rule.runs} déclenchement{rule.runs > 1 ? "s" : ""}
                  </span>
                  {rule.lastRun ? (
                    <span className="tabular-nums">Dernier : {relativeTime(rule.lastRun)}</span>
                  ) : (
                    <span>Jamais déclenchée</span>
                  )}
                </p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <header className="flex items-center gap-3 border-b border-line px-5 py-4">
            <History className="size-4 text-gold" />
            <h2 className="display flex-1 text-lg">Journal des exécutions</h2>
          </header>
          {runs.length === 0 ? (
            <EmptyState
              title="Aucune exécution"
              description="Les prochains événements apparaîtront ici."
            />
          ) : (
            <ul className="divide-y divide-line">
              {runs.slice(0, 14).map((run) => (
                <li key={run.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
                      run.rule === "inactiveLeadRelance"
                        ? "border-negative/40 text-negative"
                        : "border-gold/50 text-gold",
                    )}
                  >
                    <Zap className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{run.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {run.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {relativeTime(run.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <header className="flex items-center gap-3 border-b border-line px-5 py-4">
            <PhoneCall className="size-4 text-gold" />
            <h2 className="display flex-1 text-lg">Relance des leads inactifs</h2>
          </header>
          {inactive.length === 0 ? (
            <EmptyState
              title="Aucun lead inactif"
              description="Tous les leads ont été contactés dans les 3 derniers jours."
              icon={PhoneCall}
            />
          ) : (
            <ul className="divide-y divide-line">
              {inactive.slice(0, 6).map(({ lead, client, daysInactive }) => (
                <li key={lead.id} className="flex items-center gap-3 px-5 py-3.5">
                  <AlarmClock className="size-4 shrink-0 text-negative" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inactif depuis {daysInactive} jour{daysInactive > 1 ? "s" : ""}
                    </p>
                  </div>
                  <AdminButton
                    variant="outline"
                    onClick={() =>
                      createCallback.mutate(lead.id, {
                        onSuccess: () =>
                          toast.success(
                            "Relance planifiée",
                            "La tâche est apparue dans le tableau des tâches.",
                          ),
                      })
                    }
                  >
                    <Send className="size-3.5" />
                  </AdminButton>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <CalendarClock className="size-4 text-gold" />
          <h2 className="display flex-1 text-lg">Visites à confirmer (48 h)</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {pendingConfirmations.length}
          </span>
        </header>
        {pendingConfirmations.length === 0 ? (
          <EmptyState
            title="Aucune visite à confirmer"
            description="Les visites planifiées non confirmées apparaîtront ici."
            icon={CalendarClock}
          />
        ) : (
          <ul className="divide-y divide-line">
            {pendingConfirmations.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.startsAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    ·{" "}
                    {new Date(a.startsAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="rounded-md border border-gold/50 px-2.5 py-1 text-[0.58rem] tracking-[0.12em] text-gold uppercase">
                  À confirmer
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
