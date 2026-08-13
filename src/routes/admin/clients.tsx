import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Search,
  Activity as ActivityIcon,
  KanbanSquare,
  CalendarDays,
  Pencil,
  Building2,
  PhoneCall,
  MessageSquare,
  MailOpen,
  Eye,
  Handshake,
  FilePlus2,
  StickyNote,
  ListChecks,
} from "lucide-react";
import {
  clientsQuery,
  clientQuery,
  agentsQuery,
  leadsQuery,
  appointmentsQuery,
  activitiesQuery,
  useCreateClient,
  useUpdateClient,
} from "@/lib/admin/queries";
import type { ClientQuery } from "@/lib/admin/repository";
import type { Client, ClientRole, LeadTemperature } from "@/lib/admin/types";
import {
  formatMoney,
  formatNumber,
  label,
  ROLE_LABELS,
  SOURCE_LABELS,
  TEMPERATURE_LABELS,
  relativeTime,
} from "@/lib/admin/format";
import { DataTable, type Column } from "@/components/admin/data-table";
import { RoleBadge, TemperatureBadge } from "@/components/admin/status-badge";
import { Drawer, Modal, AdminButton, EmptyState, toast } from "@/components/admin/primitives";
import { useAgentScope } from "@/lib/admin/session";
import type { Activity, Appointment, Lead } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients — STE MABANIS" },
      { name: "description", content: "Portefeuille clients et CRM." },
    ],
  }),
  component: ClientsPage,
});

const ROLES: ClientRole[] = ["buyer", "seller", "tenant", "landlord", "investor"];
const TEMPS: LeadTemperature[] = ["cold", "warm", "hot"];

const ACTIVITY_ICONS = {
  call: PhoneCall,
  email: MailOpen,
  whatsapp: MessageSquare,
  viewing: Eye,
  offer: Handshake,
  stage_change: ListChecks,
  document: FilePlus2,
  note: StickyNote,
} as const;

function ClientsPage() {
  const [query, setQuery] = useState<ClientQuery>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // A commercial workspace is scoped to one agent's book of business.
  const scope = useAgentScope();

  const { data: clients = [], isPending } = useQuery(clientsQuery(query));
  const { data: agents = [] } = useQuery(agentsQuery());
  const { data: selected } = useQuery(clientQuery(selectedId ?? ""));
  const { data: activities = [] } = useQuery(
    activitiesQuery(selectedId ? { clientId: selectedId } : {}),
  );
  const { data: leads = [] } = useQuery(leadsQuery());
  const { data: appointments = [] } = useQuery(appointmentsQuery());

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? "—";

  const visibleClients = scope ? clients.filter((c) => c.agentId === scope) : clients;

  const toggle = (key: keyof ClientQuery, value: string) => {
    const current = (query[key] as string[] | undefined) ?? [];
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    setQuery((q) => ({ ...q, [key]: next.length ? next : undefined }));
  };

  const columns: Column<Client>[] = [
    {
      id: "client",
      header: "Client",
      primary: true,
      sortValue: (c) => `${c.lastName} ${c.firstName}`,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="display grid size-10 shrink-0 place-items-center border border-line bg-sand text-sm text-navy">
            {c.firstName[0]}
            {c.lastName[0]}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-navy">
              {c.firstName} {c.lastName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{c.email}</span>
          </span>
        </div>
      ),
    },
    {
      id: "roles",
      header: "Rôles",
      sortValue: (c) => c.roles.join(","),
      cell: (c) => (
        <span className="flex flex-wrap gap-1">
          {c.roles.map((r) => (
            <RoleBadge key={r} role={r} />
          ))}
        </span>
      ),
    },
    {
      id: "temperature",
      header: "Score",
      hideBelow: "sm",
      sortValue: (c) => c.score,
      cell: (c) => <TemperatureBadge temperature={c.temperature} score={c.score} />,
    },
    {
      id: "budget",
      header: "Budget",
      hideBelow: "lg",
      sortValue: (c) => c.budgetMin ?? 0,
      cell: (c) =>
        c.budgetMin ? (
          <span className="text-sm text-navy/80 tabular-nums">
            {formatMoney(c.budgetMin, true)} – {formatMoney(c.budgetMax ?? 0, true)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "source",
      header: "Source",
      hideBelow: "xl",
      sortValue: (c) => c.source,
      cell: (c) => <span className="text-sm text-navy/80">{label(SOURCE_LABELS, c.source)}</span>,
    },
    {
      id: "contact",
      header: "Dernier contact",
      hideBelow: "md",
      sortValue: (c) => c.lastContactedAt ?? "",
      cell: (c) => (
        <span className="text-sm text-muted-foreground">
          {c.lastContactedAt ? relativeTime(c.lastContactedAt) : "Jamais"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">CRM</p>
          <h2 className="display mt-1 text-2xl">
            {isPending
              ? "…"
              : `${formatNumber(visibleClients.length)} client${visibleClients.length > 1 ? "s" : ""}`}
          </h2>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <Plus className="size-3.5" />
          Nouveau client
        </AdminButton>
      </div>

      {/* Filters: search inline, chips below (wrap on mobile). */}
      <div className="space-y-3">
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={query.search ?? ""}
            onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value || undefined }))}
            placeholder="Nom, email, téléphone…"
            aria-label="Rechercher un client"
            className="h-11 w-full border border-line bg-admin-surface pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-gold"
          />
        </label>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="mr-1 text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
              Rôles
            </legend>
            {ROLES.map((r) => {
              const on = query.roles?.includes(r) ?? false;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle("roles", r)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-8 border px-2.5 py-1 text-[0.66rem] tracking-[0.1em] uppercase transition-colors",
                    on
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-line text-muted-foreground hover:border-gold/60",
                  )}
                >
                  {label(ROLE_LABELS, r)}
                </button>
              );
            })}
          </fieldset>

          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="mr-1 text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
              Température
            </legend>
            {TEMPS.map((t) => {
              const on = query.temperature?.includes(t) ?? false;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle("temperature", t)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-8 border px-2.5 py-1 text-[0.66rem] tracking-[0.1em] uppercase transition-colors",
                    on
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-line text-muted-foreground hover:border-gold/60",
                  )}
                >
                  {label(TEMPERATURE_LABELS, t)}
                </button>
              );
            })}
          </fieldset>
        </div>
      </div>

      <DataTable
        rows={visibleClients}
        columns={columns}
        getRowId={(c) => c.id}
        onRowClick={(c) => setSelectedId(c.id)}
        isLoading={isPending}
        empty={{
          title: "Aucun client trouvé",
          description: "Modifiez vos filtres ou créez une nouvelle fiche client.",
          action: (
            <AdminButton onClick={() => setCreating(true)}>
              <Plus className="size-3.5" />
              Nouveau client
            </AdminButton>
          ),
        }}
      />

      <ClientDrawer
        client={selected ?? null}
        agents={agents}
        agentName={agentName}
        activities={activities}
        leads={leads.filter((l) => l.clientId === selectedId)}
        appointments={appointments.filter((a) => a.clientId === selectedId)}
        onClose={() => setSelectedId(null)}
      />

      {creating ? (
        <ClientFormModal
          agents={agents.map((a) => ({ id: a.id, name: a.name }))}
          defaultAgentId={scope ?? undefined}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- client drawer */

function ClientDrawer({
  client,
  agents,
  agentName,
  activities,
  leads,
  appointments,
  onClose,
}: {
  client: Client | null;
  agents: { id: string; name: string }[];
  agentName: (id: string) => string;
  activities: Activity[];
  leads: Lead[];
  appointments: Appointment[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"activity" | "leads" | "appointments" | "edit">("activity");
  const updateClient = useUpdateClient();

  if (!client) return null;

  const saveTemperature = (t: LeadTemperature) =>
    updateClient.mutate({ id: client.id, patch: { temperature: t } });

  return (
    <Drawer
      open={Boolean(client)}
      onClose={onClose}
      title={`${client.firstName} ${client.lastName}`}
      footer={
        <>
          <AdminButton variant="outline" onClick={() => setTab("edit")}>
            <Pencil className="size-3.5" />
            Modifier
          </AdminButton>
          <AdminButton variant="outline" className="flex-1" onClick={onClose}>
            Fermer
          </AdminButton>
        </>
      }
    >
      {tab === "edit" ? (
        <ClientFormModal
          client={client}
          agents={agents.map((a) => ({ id: a.id, name: a.name }))}
          onClose={() => setTab("activity")}
        />
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <span className="display grid size-14 shrink-0 place-items-center border border-line bg-sand text-xl text-navy">
              {client.firstName[0]}
              {client.lastName[0]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {client.roles.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {label(SOURCE_LABELS, client.source)}
                {client.city ? ` · ${client.city}` : ""} · {agentName(client.agentId)}
              </p>
            </div>
            <TemperatureBadge temperature={client.temperature} score={client.score} />
          </div>

          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              { icon: Mail, value: client.email },
              { icon: Phone, value: client.phone || "—" },
              { icon: MapPin, value: client.city ?? "—" },
              {
                icon: Wallet,
                value: client.budgetMin
                  ? `${formatMoney(client.budgetMin)} – ${formatMoney(client.budgetMax ?? 0)}`
                  : "Budget non renseigné",
              },
            ].map(({ icon: Icon, value }) => (
              <div
                key={value}
                className="flex items-center gap-2.5 border border-line bg-admin-bg/50 px-3 py-2.5 text-sm text-navy/80"
              >
                <Icon className="size-3.5 shrink-0 text-gold" />
                <span className="min-w-0 truncate">{value}</span>
              </div>
            ))}
          </dl>

          <section>
            <p className="eyebrow mb-2.5">Température</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => saveTemperature(t)}
                  aria-pressed={client.temperature === t}
                  className={cn(
                    "min-h-10 border text-[0.66rem] tracking-[0.12em] uppercase transition-colors",
                    client.temperature === t
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-line text-muted-foreground hover:border-gold/60",
                  )}
                >
                  {label(TEMPERATURE_LABELS, t)}
                </button>
              ))}
            </div>
          </section>

          {client.notes ? (
            <p className="border border-line bg-admin-bg/50 px-3.5 py-3 text-sm text-navy/80">
              {client.notes}
            </p>
          ) : null}

          <div className="flex gap-2">
            {(
              [
                { key: "activity", label: "Activité", icon: ActivityIcon },
                { key: "leads", label: "Leads", icon: KanbanSquare },
                { key: "appointments", label: "RDV", icon: CalendarDays },
              ] as const
            ).map(({ key, label: l, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={cn(
                  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 border text-[0.66rem] tracking-[0.12em] uppercase transition-colors",
                  tab === key
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-line text-muted-foreground hover:border-gold/60",
                )}
              >
                <Icon className="size-3.5" />
                {l}
              </button>
            ))}
          </div>

          {tab === "activity" ? (
            <ActivityTimeline activities={activities} />
          ) : tab === "leads" ? (
            leads.length ? (
              <ul className="space-y-2">
                {leads.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center gap-3 border border-line bg-admin-bg/50 px-3.5 py-3 text-sm"
                  >
                    <Building2 className="size-4 shrink-0 text-gold" />
                    <span className="min-w-0 flex-1 truncate text-navy/80">
                      {lead.nextAction ?? "Lead sans prochaine action"}
                    </span>
                    <TemperatureBadge temperature={lead.temperature} score={lead.score} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Aucun lead"
                description="Ce client n'a pas encore de lead ouvert."
              />
            )
          ) : appointments.length ? (
            <ul className="space-y-2">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border border-line bg-admin-bg/50 px-3.5 py-3 text-sm"
                >
                  <CalendarDays className="size-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate text-navy/80">{a.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Date(a.startsAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Aucun rendez-vous"
              description="Aucun rendez-vous enregistré pour ce client."
            />
          )}
        </div>
      )}
    </Drawer>
  );
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return (
      <EmptyState
        title="Aucune activité"
        description="La timeline se remplit au fil des échanges."
      />
    );
  }
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICONS[a.kind as keyof typeof ACTIVITY_ICONS] ?? StickyNote;
        return (
          <li key={a.id} className="relative">
            <span className="absolute top-0.5 -left-[1.62rem] grid size-6 place-items-center border border-line bg-admin-surface text-gold">
              <Icon className="size-3" />
            </span>
            <p className="text-sm font-medium text-navy">{a.subject}</p>
            {a.body ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
            ) : null}
            <p className="mt-1 text-[0.62rem] text-muted-foreground/70">
              {relativeTime(a.createdAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------ client form */

type ClientFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: ClientRole[];
  temperature: LeadTemperature;
  score: string;
  source: string;
  city: string;
  budgetMin: string;
  budgetMax: string;
  notes: string;
  agentId: string;
};

function ClientFormModal({
  client,
  agents,
  defaultAgentId,
  onClose,
}: {
  client?: Client | undefined;
  agents: { id: string; name: string }[];
  defaultAgentId?: string | undefined;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ClientFormState>(() => ({
    firstName: client?.firstName ?? "",
    lastName: client?.lastName ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    roles: client?.roles ?? ["buyer"],
    temperature: client?.temperature ?? "cold",
    score: client ? String(client.score) : "20",
    source: client?.source ?? "site_web",
    city: client?.city ?? "",
    budgetMin: client?.budgetMin ? String(client.budgetMin) : "",
    budgetMax: client?.budgetMax ? String(client.budgetMax) : "",
    notes: client?.notes ?? "",
    agentId: client?.agentId ?? defaultAgentId ?? agents[0]?.id ?? "",
  }));
  const [saving, setSaving] = useState(false);

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const set = <K extends keyof ClientFormState>(key: K, value: ClientFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleRole = (r: ClientRole) => {
    const current = form.roles;
    const next = current.includes(r) ? current.filter((x) => x !== r) : [...current, r];
    set("roles", next.length ? next : ["buyer"]);
  };

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("Informations requises", "Nom, prénom et email sont obligatoires.");
      return;
    }
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      roles: form.roles,
      temperature: form.temperature,
      score: Number(form.score) || 0,
      source: form.source as Client["source"],
      city: form.city.trim() || undefined,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      notes: form.notes.trim() || undefined,
      agentId: form.agentId || undefined,
    };
    setSaving(true);
    try {
      if (client) {
        await updateClient.mutateAsync({ id: client.id, patch: payload });
        toast.success("Client mis à jour");
      } else {
        await createClient.mutateAsync(payload);
        toast.success("Client créé");
      }
      onClose();
    } catch (err) {
      toast.error("Enregistrement impossible", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    lbl: string,
    value: string,
    onChange: (v: string) => void,
    opts: { type?: string; required?: boolean; placeholder?: string } = {},
  ) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
        {lbl}
        {opts.required ? " *" : ""}
      </span>
      <input
        type={opts.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={opts.required}
        placeholder={opts.placeholder}
        className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
      />
    </label>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={client ? "Modifier le client" : "Nouveau client"}
      description={
        client
          ? "Les modifications alimentent la timeline."
          : "La fiche démarre froide, le score s'affine au fil des échanges."
      }
      size="lg"
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Annuler
          </AdminButton>
          <AdminButton onClick={() => void submit()} disabled={saving}>
            {saving ? "Enregistrement…" : client ? "Enregistrer" : "Créer la fiche"}
          </AdminButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Prénom", form.firstName, (v) => set("firstName", v), { required: true })}
        {field("Nom", form.lastName, (v) => set("lastName", v), { required: true })}
        {field("Email", form.email, (v) => set("email", v), { type: "email", required: true })}
        {field("Téléphone", form.phone, (v) => set("phone", v), {
          type: "tel",
          placeholder: "+212 6…",
        })}
        {field("Ville", form.city, (v) => set("city", v))}
        {field("Budget min (MAD)", form.budgetMin, (v) => set("budgetMin", v), { type: "number" })}
        {field("Budget max (MAD)", form.budgetMax, (v) => set("budgetMax", v), { type: "number" })}
        {field("Score", form.score, (v) => set("score", v), { type: "number" })}

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Source
          </span>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          >
            {Object.entries(SOURCE_LABELS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Température
          </span>
          <select
            value={form.temperature}
            onChange={(e) => set("temperature", e.target.value as LeadTemperature)}
            className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          >
            {TEMPS.map((t) => (
              <option key={t} value={t}>
                {label(TEMPERATURE_LABELS, t)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Agent
          </span>
          <select
            value={form.agentId}
            onChange={(e) => set("agentId", e.target.value)}
            className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Rôles
          </legend>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const on = form.roles.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-9 border px-3 py-1.5 text-[0.66rem] tracking-[0.1em] uppercase transition-colors",
                    on
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-line text-muted-foreground hover:border-gold/60",
                  )}
                >
                  {label(ROLE_LABELS, r)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Notes
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Financement, contraintes, préférences…"
            className="border border-line bg-admin-bg/40 px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>
      </div>
    </Modal>
  );
}
