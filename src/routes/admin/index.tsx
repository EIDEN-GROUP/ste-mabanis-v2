import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  UserPlus,
  CalendarCheck,
  Wallet,
  TrendingUp,
  Percent,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { dashboardQuery, prioritiesQuery } from "@/lib/admin/queries";
import { formatMoney, formatNumber, label, SOURCE_LABELS, STAGE_LABELS } from "@/lib/admin/format";
import {
  Panel,
  PanelHeader,
  StatCard,
  LoadingState,
  EmptyState,
} from "@/components/admin/primitives";
import {
  AreaTrendChart,
  CategoryBarChart,
  ChartLegend,
  DonutChart,
  TrendChart,
} from "@/components/admin/charts";
import { ACTION_ROLES, type AdminAction } from "@/lib/admin/permissions";
import { useAgentScope, useAgentsForRole, useSession } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord   STE MABANIS" },
      { name: "description", content: "Indicateurs, pipeline et priorités du jour." },
    ],
  }),
  component: DashboardPage,
});

const URGENCY = {
  overdue: { tone: "text-negative border-negative/35", icon: AlertTriangle, word: "En retard" },
  today: { tone: "text-status-offer border-status-offer/35", icon: Clock, word: "Aujourd'hui" },
  soon: { tone: "text-muted-foreground border-line", icon: Clock, word: "À suivre" },
} as const;

const ACTION_LABELS: Record<AdminAction, string> = {
  "screen.design": "Fiche design",
  "screen.rapports": "Rapports",
  "screen.automatisations": "Automatisations",
  "screen.marketing": "Campagnes",
  "screen.portail-client": "Portail client",
  "screen.matching": "Matching",
  "screen.crm": "CRM / Leads",
  "screen.agenda": "Agenda",
  "screen.transactions": "Transactions",
  "screen.documents": "Documents",
  "screen.taches": "Tâches",
  "screen.proprietes": "Propriétés",
  "screen.clients": "Clients",
  "property.create": "Créer un bien",
  "property.edit": "Modifier un bien",
  "property.delete": "Supprimer un bien",
  "client.create": "Créer un client",
  "client.edit": "Modifier un client",
  "client.delete": "Supprimer un client",
  "lead.move": "Déplacer un lead",
  "lead.convert": "Convertir un lead",
  "lead.delete": "Supprimer un lead",
  "appointment.manage": "Gérer les visites",
  "transaction.manage": "Gérer les transactions",
  "transaction.delete": "Supprimer une transaction",
  "document.manage": "Gérer les documents",
  "task.manage": "Gérer les tâches",
  "report.export": "Exporter les rapports",
  "campaign.manage": "Gérer les campagnes",
  "automation.toggle": "Activer les automatisations",
  "match.send": "Envoyer des biens",
};

const ROLE_COLUMNS: { role: "directrice" | "commercial" | "assistant"; label: string }[] = [
  { role: "directrice", label: "Directrice" },
  { role: "commercial", label: "Commercial" },
  { role: "assistant", label: "Assistant" },
];

function DashboardPage() {
  const { role, roleInfo, agentId } = useSession();
  const scope = useAgentScope();
  const commercialAgents = useAgentsForRole("commercial");
  const { data, isPending } = useQuery(dashboardQuery());
  const { data: priorities = [], isPending: prioritiesPending } = useQuery(
    prioritiesQuery(scope ?? undefined),
  );

  if (isPending || !data) {
    return (
      <div className="space-y-6">
        <LoadingState variant="cards" rows={6} />
        <LoadingState variant="chart" />
      </div>
    );
  }

  const { kpis } = data;
  const isDirectrice = role === "directrice";
  const agentName = commercialAgents.find((a) => a.id === agentId)?.name;

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------- greeting */}
      <section>
        <p className="eyebrow">Tableau de bord</p>
        <h2 className="display mt-1 text-2xl">
          Bonjour{agentName ? `, ${agentName}` : `, ${roleInfo.label}`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{roleInfo.tagline}</p>
      </section>

      {/* ---------------------------------------------------------- KPIs */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            index={0}
            label="Biens actifs"
            value={formatNumber(kpis.activelistings)}
            delta={kpis.deltas["activelistings"]}
            hint="en ligne"
            icon={Building2}
          />
          <StatCard
            index={1}
            label="Nouveaux leads"
            value={formatNumber(kpis.newLeads30d)}
            delta={kpis.deltas["newLeads30d"]}
            hint="30 jours"
            icon={UserPlus}
          />
          <StatCard
            index={2}
            label="Visites"
            value={formatNumber(kpis.viewings30d)}
            delta={kpis.deltas["viewings30d"]}
            hint="30 jours"
            icon={CalendarCheck}
          />
          <StatCard
            index={3}
            label="Pipeline"
            value={formatMoney(kpis.pipelineValue, true)}
            delta={kpis.deltas["pipelineValue"]}
            hint="en cours"
            icon={Wallet}
          />
          {isDirectrice ? (
            <StatCard
              index={4}
              label="Honoraires"
              value={formatMoney(kpis.revenueYtd, true)}
              delta={kpis.deltas["revenueYtd"]}
              hint="cumul"
              icon={TrendingUp}
            />
          ) : null}
          <StatCard
            index={5}
            label="Conversion"
            value={`${kpis.conversionRate}%`}
            delta={kpis.deltas["conversionRate"]}
            hint="leads gagnés"
            icon={Percent}
          />
        </div>
      </section>

      {/* ------------------------------------------ priorities + pipeline */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Panel className="overflow-hidden xl:col-span-1">
          <PanelHeader eyebrow="À traiter" title="Priorités du jour" />
          {prioritiesPending ? (
            <LoadingState rows={4} className="p-4" />
          ) : priorities.length === 0 ? (
            <EmptyState title="Rien d'urgent" description="Toutes les échéances sont tenues." />
          ) : (
            <ul>
              {priorities.map((p, i) => {
                const u = URGENCY[p.urgency];
                const Icon = u.icon;
                return (
                  <li key={p.id} style={{ ["--i" as string]: i }} className="stagger-in">
                    <Link
                      to={p.href}
                      className="flex items-start gap-3 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-sand"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
                          u.tone,
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-navy">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {u.word} · {p.detail}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground/50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className="xl:col-span-2">
          <PanelHeader eyebrow="Acquisition" title="Leads et visites" />
          <div className="p-4">
            <TrendChart
              data={data.leadsSeries as unknown as Record<string, string | number>[]}
              xKey="month"
              series={[
                { key: "leads", name: "Leads" },
                { key: "viewings", name: "Visites" },
              ]}
              height={280}
            />
          </div>
        </Panel>
      </section>

      {/* ------------------------------------------------------- charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Audience" title="Vues du site" />
          <div className="p-4">
            <AreaTrendChart
              data={data.viewsSeries as unknown as Record<string, string | number>[]}
              xKey="month"
              dataKey="views"
              name="Vues"
              formatter={formatNumber}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Honoraires" title="Revenus par mois" />
          <div className="p-4">
            <CategoryBarChart
              data={data.revenueSeries as unknown as Record<string, string | number>[]}
              xKey="month"
              dataKey="revenue"
              name="Honoraires"
              formatter={(v) => formatMoney(v, true)}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="CRM" title="Pipeline par étape" />
          <div className="p-4">
            <CategoryBarChart
              data={data.pipelineByStage.map((p) => ({
                label: label(STAGE_LABELS, p.label),
                value: p.value,
              }))}
              xKey="label"
              dataKey="value"
              name="Leads"
              horizontal
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Origine" title="Sources des leads" />
          <div className="p-4">
            <DonutChart
              data={data.sourceBreakdown.map((s) => ({
                label: label(SOURCE_LABELS, s.label),
                value: s.value,
              }))}
            />
            <ChartLegend
              items={data.sourceBreakdown.map((s) => ({
                label: label(SOURCE_LABELS, s.label),
                value: String(s.value),
              }))}
            />
          </div>
        </Panel>
      </section>

      {/* ------------------------------------------------ roles & permissions */}
      <section>
        <Panel>
          <PanelHeader
            eyebrow="Rôles et permissions"
            title="Qui peut faire quoi"
            action={
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-gold" />
                {roleInfo.label}
              </span>
            }
          />
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 pr-4 text-[0.62rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Action
                  </th>
                  {ROLE_COLUMNS.map((c) => (
                    <th
                      key={c.role}
                      className="py-2 px-3 text-center text-[0.62rem] font-medium tracking-[0.14em] uppercase"
                    >
                      <span className={cn(c.role === role && "text-gold")}>{c.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ACTION_ROLES) as AdminAction[]).map((action) => (
                  <tr
                    key={action}
                    className="border-b border-line/60 transition-colors last:border-0"
                  >
                    <td className="py-1.5 pr-4 text-navy">{ACTION_LABELS[action]}</td>
                    {ROLE_COLUMNS.map((c) => (
                      <td key={c.role} className="py-1.5 px-3 text-center">
                        {ACTION_ROLES[action].includes(c.role) ? (
                          <span className="text-gold">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  );
}
