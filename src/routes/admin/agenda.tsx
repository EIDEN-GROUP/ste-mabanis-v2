import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Clock, CalendarDays, CheckCircle2, Eye } from "lucide-react";
import {
  appointmentsQuery,
  agentsQuery,
  clientsQuery,
  propertiesQuery,
  useCreateAppointment,
  useUpdateAppointment,
  useSetAppointmentStatus,
  useSaveViewingReport,
} from "@/lib/admin/queries";
import type { Appointment, AppointmentKind, AppointmentStatus } from "@/lib/admin/types";
import { APPOINTMENT_LABELS, formatDate, formatTime, label } from "@/lib/admin/format";
import { SEED_NOW } from "@/lib/admin/seed";
import { Calendar } from "@/components/admin/calendar";
import { StatCard, Modal, AdminButton } from "@/components/admin/primitives";
import { useAgentScope } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda   STE MABANIS" },
      { name: "description", content: "Planning des rendez-vous et visites." },
    ],
  }),
  component: AgendaPage,
});

type View = "jour" | "semaine" | "mois";

const KIND_TONE: Record<AppointmentKind, string> = {
  viewing: "border-gold/50 text-gold",
  valuation: "border-blue/40 text-blue",
  signature: "border-positive/40 text-positive",
  call: "border-line text-navy/70",
  meeting: "border-status-archived text-navy/60",
};

const STATUS_TONE: Record<AppointmentStatus, string> = {
  scheduled: "border-line text-navy/75",
  confirmed: "border-gold/50 text-gold",
  done: "border-positive/40 text-positive",
  cancelled: "border-negative/40 text-negative",
  no_show: "border-negative/40 text-negative",
};

const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 20 * 60;
const DAY_SPAN_MIN = DAY_END_MIN - DAY_START_MIN;

function minutesOf(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AgendaPage() {
  const [view, setView] = useState<View>("semaine");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // A commercial workspace only sees the appointments its agent runs.
  const scope = useAgentScope();

  const { data: appointments = [] } = useQuery(appointmentsQuery());
  const { data: clients = [] } = useQuery(clientsQuery({}));
  const { data: properties = [] } = useQuery(propertiesQuery({}));
  const { data: agents = [] } = useQuery(agentsQuery());

  const visibleAppointments = scope
    ? appointments.filter((a) => a.agentId === scope)
    : appointments;
  const scopedClients = scope ? clients.filter((c) => c.agentId === scope) : clients;

  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const propertiesById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);

  const today = visibleAppointments.filter((a) => sameDay(new Date(a.startsAt), SEED_NOW));
  const week = visibleAppointments.filter((a) => {
    const d = new Date(a.startsAt);
    return (
      sameDay(d, SEED_NOW) || (d > SEED_NOW && d < new Date(SEED_NOW.getTime() + 7 * 86_400_000))
    );
  });
  const doneWeek = week.filter((a) => a.status === "done");

  const selected = visibleAppointments.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aujourd'hui"
          value={String(today.length)}
          hint="Rendez-vous du jour"
          icon={Clock}
          index={0}
        />
        <StatCard
          label="7 prochains jours"
          value={String(week.filter((a) => a.status !== "done").length)}
          hint={"Dont visites : " + String(week.filter((a) => a.kind === "viewing").length)}
          icon={CalendarDays}
          index={1}
        />
        <StatCard
          label="Terminés cette semaine"
          value={String(doneWeek.length)}
          hint="Visites débriefées"
          icon={CheckCircle2}
          index={2}
        />
        <StatCard
          label="Visites à venir"
          value={String(
            visibleAppointments.filter((a) => a.kind === "viewing" && a.status !== "done").length,
          )}
          hint="Toutes périodes"
          icon={Eye}
          index={3}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-md border border-line">
          {(["jour", "semaine", "mois"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase transition-colors",
                view === v ? "bg-navy text-white" : "text-muted-foreground hover:text-navy",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Nouveau rendez-vous
        </AdminButton>
      </div>

      {view === "mois" ? (
        <Calendar appointments={visibleAppointments} />
      ) : (
        <Timeline view={view} appointments={visibleAppointments} onSelect={setSelectedId} />
      )}

      <AppointmentModal
        appointment={selected}
        client={selected ? (clientsById.get(selected.clientId ?? "") ?? null) : null}
        property={selected ? (propertiesById.get(selected.propertyId ?? "") ?? null) : null}
        agent={selected ? (agentsById.get(selected.agentId) ?? null) : null}
        onClose={() => setSelectedId(null)}
      />

      {creating ? (
        <AppointmentFormModal
          clients={scopedClients}
          properties={properties}
          agents={agents}
          defaultAgentId={scope ?? undefined}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- timeline */

function Timeline({
  view,
  appointments,
  onSelect,
}: {
  view: View;
  appointments: Appointment[];
  onSelect: (id: string) => void;
}) {
  const days = useMemo(() => {
    if (view === "jour") return [SEED_NOW];
    const monday = startOfWeek(SEED_NOW);
    return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 86_400_000));
  }, [view]);

  const hours = Array.from({ length: DAY_SPAN_MIN / 60 }, (_, i) => DAY_START_MIN / 60 + i);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-admin-surface">
      <div
        className={cn("grid border-b border-line", view === "jour" ? "grid-cols-1" : "grid-cols-7")}
      >
        {days.map((d) => {
          const isToday = sameDay(d, SEED_NOW);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "border-r border-line py-3 text-center last:border-r-0",
                isToday && "bg-gold/8",
              )}
            >
              <p className="text-[0.58rem] tracking-[0.16em] text-muted-foreground uppercase">
                {d.toLocaleDateString("fr-FR", { weekday: "short" })}
              </p>
              <p className={cn("display mt-0.5 text-lg", isToday && "text-gold")}>{d.getDate()}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <div
          className="relative min-w-[720px]"
          style={{ height: `${(DAY_SPAN_MIN / 60) * 3.5}rem` }}
        >
          <div className="grid h-full grid-cols-7">
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className="relative border-r border-line/60 last:border-r-0"
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-line/50 text-right pr-2"
                    style={{ top: `${((h * 60 - DAY_START_MIN) / DAY_SPAN_MIN) * 100}%` }}
                  >
                    <span className="align-top text-[0.55rem] text-muted-foreground tabular-nums">
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
                {appointments
                  .filter((a) => sameDay(new Date(a.startsAt), d))
                  .map((a) => {
                    const start = minutesOf(a.startsAt);
                    const end = Math.max(start + 30, minutesOf(a.endsAt));
                    const top = ((start - DAY_START_MIN) / DAY_SPAN_MIN) * 100;
                    const height = ((end - start) / DAY_SPAN_MIN) * 100;
                    const cancelled = a.status === "cancelled" || a.status === "no_show";
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => onSelect(a.id)}
                        className={cn(
                          "absolute inset-x-1 flex flex-col gap-0.5 overflow-hidden rounded-md border-l-2 bg-sand px-2 py-1 text-left transition-colors hover:border-gold hover:bg-gold/10",
                          cancelled && "opacity-60",
                        )}
                        style={{ top: `${top}%`, height: `max(${height}%, 1.75rem)` }}
                      >
                        <span className="text-[0.6rem] font-medium text-navy tabular-nums">
                          {formatTime(a.startsAt)}
                        </span>
                        <span className="truncate text-[0.65rem] text-navy/80">{a.title}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- appointment drawer */

function AppointmentModal({
  appointment,
  client,
  property,
  agent,
  onClose,
}: {
  appointment: Appointment | null;
  client: { id: string; firstName: string; lastName: string } | null;
  property: { id: string; title: string; reference: string } | null;
  agent: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [interest, setInterest] = useState(appointment?.report?.interest ?? 3);
  const [outcome, setOutcome] = useState(appointment?.report?.outcome ?? "");
  const [nextAction, setNextAction] = useState(appointment?.report?.nextAction ?? "");

  const setStatus = useSetAppointmentStatus();
  const saveReport = useSaveViewingReport();

  if (!appointment) return null;

  const actions = ["confirmed", "done", "cancelled", "no_show"] as const;

  return (
    <Modal
      open
      onClose={onClose}
      title={appointment.title}
      footer={[
        <AdminButton key="edit" variant="outline" onClick={() => setEditing(true)}>
          Modifier
        </AdminButton>,
        appointment.status === "scheduled" ? (
          <AdminButton
            key="status"
            onClick={() => setStatus.mutate({ id: appointment.id, status: "confirmed" })}
          >
            Confirmer
          </AdminButton>
        ) : null,
      ]}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] uppercase",
              KIND_TONE[appointment.kind],
            )}
          >
            {label(APPOINTMENT_LABELS, appointment.kind)}
          </span>
          <span
            className={cn(
              "border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] uppercase",
              STATUS_TONE[appointment.status],
            )}
          >
            {label(
              {
                scheduled: "Planifié",
                confirmed: "Confirmé",
                done: "Terminé",
                cancelled: "Annulé",
                no_show: "Absence",
              },
              appointment.status,
            )}
          </span>
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Quand</dt>
            <dd className="text-navy">
              {formatDate(appointment.startsAt)} · {formatTime(appointment.startsAt)} –{" "}
              {formatTime(appointment.endsAt)}
            </dd>
          </div>
          {client ? (
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Client</dt>
              <dd className="text-navy">
                {client.firstName} {client.lastName}
              </dd>
            </div>
          ) : null}
          {property ? (
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Bien</dt>
              <dd className="text-navy">
                {property.title}{" "}
                <span className="text-muted-foreground">({property.reference})</span>
              </dd>
            </div>
          ) : null}
          {agent ? (
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Agent</dt>
              <dd className="text-navy">{agent.name}</dd>
            </div>
          ) : null}
          {appointment.location ? (
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Lieu</dt>
              <dd className="text-navy">{appointment.location}</dd>
            </div>
          ) : null}
        </dl>

        <div>
          <p className="eyebrow">Statut</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus.mutate({ id: appointment.id, status: s });
                  if (s === "done") setReporting(true);
                }}
                className={cn(
                  "border px-3 py-1.5 text-[0.62rem] tracking-[0.12em] uppercase transition-colors",
                  appointment.status === s
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-muted-foreground hover:border-gold hover:text-navy",
                )}
              >
                {label(
                  {
                    scheduled: "Planifié",
                    confirmed: "Confirmé",
                    done: "Terminé",
                    cancelled: "Annulé",
                    no_show: "Absence",
                  },
                  s,
                )}
              </button>
            ))}
          </div>
        </div>

        {appointment.report ? (
          <div className="rounded-md border border-line bg-sand/60 p-4">
            <p className="eyebrow">Débrief de visite</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-2",
                      i < (appointment.report?.interest ?? 0) ? "bg-gold" : "bg-line",
                    )}
                  />
                ))}
              </span>
              <span className="text-xs text-muted-foreground">{appointment.report.interest}/5</span>
            </div>
            <p className="mt-2 text-sm text-navy">{appointment.report.outcome}</p>
            {appointment.report.nextAction ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Suivi : {appointment.report.nextAction}
              </p>
            ) : null}
          </div>
        ) : null}

        {reporting ? (
          <form
            className="space-y-4 rounded-md border border-line p-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveReport.mutate(
                {
                  id: appointment.id,
                  report: {
                    interest,
                    outcome: outcome.trim() || "Visite effectuée",
                    ...(nextAction.trim() ? { nextAction: nextAction.trim() } : {}),
                  },
                },
                { onSuccess: () => setReporting(false) },
              );
            }}
          >
            <p className="eyebrow">Nouveau débrief</p>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Intérêt du client</p>
              <div className="mt-2 flex gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInterest(i)}
                    aria-label={`Intérêt ${i}/5`}
                    className={cn(
                      "size-8 border text-xs",
                      i === 0 ? "" : "",
                      i <= interest
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line text-muted-foreground",
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground uppercase">Conclusion</span>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={3}
                className="rounded-md border border-line bg-admin-bg/40 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground uppercase">Prochaine action</span>
              <input
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
              />
            </label>
            <AdminButton type="submit">Enregistrer le débrief</AdminButton>
          </form>
        ) : null}
      </div>

      {editing ? (
        <AppointmentFormModal
          appointment={appointment}
          clients={client ? [client] : []}
          properties={property ? [property] : []}
          agents={agent ? [agent] : []}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </Modal>
  );
}

/* ------------------------------------------------------- appointment form modal */

function AppointmentFormModal({
  appointment,
  clients,
  properties,
  agents,
  defaultAgentId,
  onClose,
}: {
  appointment?: Appointment | undefined;
  clients: { firstName: string; lastName: string; id: string }[];
  properties: { title: string; id: string }[];
  agents: { name: string; id: string }[];
  defaultAgentId?: string | undefined;
  onClose: () => void;
}) {
  const isEdit = Boolean(appointment);
  const start = appointment
    ? new Date(appointment.startsAt)
    : new Date(SEED_NOW.getTime() + 86_400_000);
  const [kind, setKind] = useState<AppointmentKind>(appointment?.kind ?? "viewing");
  const [title, setTitle] = useState(appointment?.title ?? "");
  const [date, setDate] = useState(toLocalInput(start));
  const [from, setFrom] = useState(toLocalTime(start));
  const [to, setTo] = useState(toLocalTime(new Date(start.getTime() + 60 * 60 * 1000)));
  const [clientId, setClientId] = useState(appointment?.clientId ?? "");
  const [propertyId, setPropertyId] = useState(appointment?.propertyId ?? "");
  const [agentId, setAgentId] = useState(appointment?.agentId ?? defaultAgentId ?? "");
  const [location, setLocation] = useState(appointment?.location ?? "");

  const create = useCreateAppointment();
  const update = useUpdateAppointment();

  const submit = async () => {
    const startsAt = new Date(`${date}T${from}`).toISOString();
    const endsAt = new Date(`${date}T${to}`).toISOString();
    if (isEdit && appointment) {
      await update.mutateAsync({
        id: appointment.id,
        patch: {
          kind,
          title: title.trim() || "Rendez-vous",
          startsAt,
          endsAt,
          clientId: clientId || undefined,
          propertyId: propertyId || undefined,
          agentId: agentId || undefined,
          location: location.trim() || undefined,
        },
      });
    } else {
      await create.mutateAsync({
        kind,
        title: title.trim() || "Rendez-vous",
        startsAt,
        endsAt,
        clientId: clientId || undefined,
        propertyId: propertyId || undefined,
        agentId: agentId || undefined,
        location: location.trim() || undefined,
      });
    }
    onClose();
  };

  const fieldCls =
    "h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold";

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
      footer={[
        <AdminButton key="cancel" variant="outline" onClick={onClose}>
          Annuler
        </AdminButton>,
        <AdminButton key="save" onClick={submit}>
          {isEdit ? "Enregistrer" : "Créer"}
        </AdminButton>,
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as AppointmentKind)}
            className={fieldCls}
          >
            {(Object.keys(APPOINTMENT_LABELS) as AppointmentKind[]).map((k) => (
              <option key={k} value={k}>
                {label(APPOINTMENT_LABELS, k)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Visite accompagnée"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Horaire</span>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={fieldCls}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="time"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={fieldCls}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Client</span>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={fieldCls}
          >
            <option value=""> </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Bien</span>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={fieldCls}
          >
            <option value=""> </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Agent</span>
          <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className={fieldCls}>
            <option value=""> </option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Lieu</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Agadir"
            className={fieldCls}
          />
        </label>
      </div>
    </Modal>
  );
}
