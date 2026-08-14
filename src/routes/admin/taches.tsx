import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  AlarmClock,
  CalendarClock,
  StickyNote,
} from "lucide-react";
import {
  tasksQuery,
  agentsQuery,
  leadsQuery,
  clientsQuery,
  propertiesQuery,
  useCreateTask,
  useUpdateTask,
} from "@/lib/admin/queries";
import type {
  AdminTask,
  AdminProperty,
  Client,
  Lead,
  TaskPriority,
  TaskStatus,
} from "@/lib/admin/types";
import type { Patch, TaskInput } from "@/lib/admin/repository";
import { formatDate, label, PRIORITY_LABELS, relativeTime } from "@/lib/admin/format";
import { SEED_NOW } from "@/lib/admin/seed";
import { StatCard, Modal, AdminButton, EmptyState } from "@/components/admin/primitives";
import { PriorityBadge } from "@/components/admin/status-badge";
import { useAgentScope } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/taches")({
  head: () => ({
    meta: [
      { title: "Tâches   STE MABANIS" },
      { name: "description", content: "Suivi des tâches de l'agence." },
    ],
  }),
  component: TasksPage,
});

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Terminées",
};

const ENTITY_LABELS: Record<NonNullable<AdminTask["entity"]>["kind"], string> = {
  property: "Bien",
  client: "Client",
  lead: "Lead",
  appointment: "RDV",
};

function TasksPage() {
  const [creating, setCreating] = useState(false);

  // A commercial workspace only sees the tasks assigned to its agent.
  const scope = useAgentScope();

  const { data: tasks = [] } = useQuery(tasksQuery());
  const { data: agents = [] } = useQuery(agentsQuery());
  const { data: leads = [] } = useQuery(leadsQuery());
  const { data: clients = [] } = useQuery(clientsQuery({}));
  const { data: properties = [] } = useQuery(propertiesQuery({}));

  const visibleTasks = scope ? tasks.filter((t) => t.assigneeId === scope) : tasks;

  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const leadsById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const propertiesById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const open = visibleTasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => t.dueAt && new Date(t.dueAt) < SEED_NOW);
  const today = open.filter((t) => {
    if (!t.dueAt) return false;
    const d = new Date(t.dueAt);
    return (
      d.getFullYear() === SEED_NOW.getFullYear() &&
      d.getMonth() === SEED_NOW.getMonth() &&
      d.getDate() === SEED_NOW.getDate()
    );
  });
  const done = visibleTasks.filter((t) => t.status === "done");

  const byStatus = useMemo(
    () => ({
      todo: visibleTasks
        .filter((t) => t.status === "todo")
        .sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999")),
      doing: visibleTasks.filter((t) => t.status === "doing"),
      done: visibleTasks.filter((t) => t.status === "done"),
    }),
    [visibleTasks],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="En retard"
          value={String(overdue.length)}
          hint="Échéance dépassée"
          icon={AlarmClock}
          index={0}
        />
        <StatCard
          label="Pour aujourd'hui"
          value={String(today.length)}
          hint="À traiter ce jour"
          icon={CalendarClock}
          index={1}
        />
        <StatCard
          label="Ouvertes"
          value={String(open.length)}
          hint="À faire + en cours"
          icon={StickyNote}
          index={2}
        />
        <StatCard
          label="Terminées"
          value={String(done.length)}
          hint="Au total"
          icon={Check}
          index={3}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Tableau des tâches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les rappels automatiques (premier contact, débrief de visite) apparaissent ici.
          </p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Nouvelle tâche
        </AdminButton>
      </div>

      {tasks.length === 0 || visibleTasks.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? "Aucune tâche" : "Aucune tâche dans cet espace"}
          description={
            tasks.length === 0
              ? "Créez la première tâche de l'agence ou laissez les automatismes la créer pour vous."
              : "Les tâches attribuées aux autres agents ne sont pas visibles ici."
          }
          action={
            <AdminButton onClick={() => setCreating(true)}>
              <Plus className="size-3.5" /> Créer une tâche
            </AdminButton>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["todo", "doing", "done"] as const).map((status) => (
            <div
              key={status}
              className="flex flex-col rounded-md border border-line bg-admin-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="text-[0.62rem] tracking-[0.16em] text-navy uppercase">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {byStatus[status].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                {byStatus[status].length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground italic">
                    {status === "done" ? "Rien de terminé." : "Aucune tâche."}
                  </p>
                ) : (
                  byStatus[status].map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={i}
                      agentName={agentsById.get(task.assigneeId)?.name}
                      entityName={entityName(task, { leadsById, clientsById, propertiesById })}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {creating ? (
        <TaskFormModal
          agents={agents}
          leads={leads}
          clients={clients}
          properties={properties}
          defaultAssigneeId={scope ?? undefined}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}

function entityName(
  task: AdminTask,
  maps: {
    leadsById: Map<string, Lead>;
    clientsById: Map<string, Client>;
    propertiesById: Map<string, AdminProperty>;
  },
) {
  const entity = task.entity;
  if (!entity) return null;
  if (entity.kind === "lead") {
    const l = maps.leadsById.get(entity.id);
    if (!l) return null;
    const c = maps.clientsById.get(l.clientId);
    return c ? `${c.firstName} ${c.lastName}` : `Lead ${entity.id}`;
  }
  if (entity.kind === "client") {
    const c = maps.clientsById.get(entity.id);
    return c ? `${c.firstName} ${c.lastName}` : null;
  }
  if (entity.kind === "property") {
    const p = maps.propertiesById.get(entity.id);
    return p?.title ?? null;
  }
  return null;
}

/* ---------------------------------------------------------------- task card */

function TaskCard({
  task,
  index,
  agentName,
  entityName,
}: {
  task: AdminTask;
  index: number;
  agentName?: string | undefined;
  entityName: string | null;
}) {
  const update = useUpdateTask();
  const overdue = task.status !== "done" && (task.dueAt ? new Date(task.dueAt) < SEED_NOW : false);
  const entity = task.entity;

  const patch = (p: Patch<TaskInput>) => update.mutate({ id: task.id, patch: p });

  return (
    <article
      style={{ ["--i" as string]: index }}
      className={cn(
        "stagger-in group rounded-md border border-line bg-admin-surface p-3.5 transition-colors hover:border-gold/60",
        task.status === "done" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => patch({ status: task.status === "done" ? "todo" : "done" })}
          aria-label={task.status === "done" ? "Rouvrir la tâche" : "Marquer terminée"}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm border transition-colors",
            task.status === "done"
              ? "border-positive bg-positive text-white"
              : "border-line text-transparent hover:border-gold group-hover:text-muted-foreground/50",
          )}
        >
          <Check className="size-3" />
        </button>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-medium text-navy",
              task.status === "done" && "line-through",
            )}
          >
            {task.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <PriorityBadge priority={task.priority} />
            {entity ? (
              <span className="rounded-md border border-line px-1.5 py-0.5 text-[0.55rem] tracking-[0.12em] uppercase">
                {label(ENTITY_LABELS, entity.kind)}
              </span>
            ) : null}
            {entityName ? <span className="truncate">{entityName}</span> : null}
            {agentName ? <span className="tabular-nums">· {agentName}</span> : null}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs tabular-nums",
            overdue ? "text-negative" : "text-muted-foreground",
          )}
        >
          <AlarmClock className="size-3.5" />
          {task.dueAt ? (
            <>
              {formatDate(task.dueAt)}
              <span className="text-muted-foreground/70">· {relativeTime(task.dueAt)}</span>
            </>
          ) : (
            "Sans échéance"
          )}
        </span>
        <div className="flex items-center gap-1">
          {task.status === "todo" ? (
            <button
              type="button"
              onClick={() => patch({ status: "doing" })}
              aria-label="Passer en cours"
              className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-gold hover:text-navy"
            >
              <ArrowRight className="size-3.5" />
            </button>
          ) : null}
          {task.status === "doing" ? (
            <button
              type="button"
              onClick={() => patch({ status: "todo" })}
              aria-label="Revenir à faire"
              className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-gold hover:text-navy"
            >
              <ArrowLeft className="size-3.5" />
            </button>
          ) : null}
          {task.status === "done" ? (
            <button
              type="button"
              onClick={() => patch({ status: "doing" })}
              aria-label="Reprendre la tâche"
              className="grid size-7 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-gold hover:text-navy"
            >
              <ArrowRight className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- task form */

function TaskFormModal({
  agents,
  leads,
  clients,
  properties,
  defaultAssigneeId,
  onClose,
}: {
  agents: { name: string; id: string }[];
  leads: { id: string; clientId: string }[];
  clients: { firstName: string; lastName: string; id: string }[];
  properties: { title: string; id: string }[];
  defaultAssigneeId?: string | undefined;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueAt, setDueAt] = useState("");
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId ?? "");
  const [entityKind, setEntityKind] = useState<"lead" | "client" | "property" | "none">("none");
  const [entityId, setEntityId] = useState("");

  const create = useCreateTask();

  const entityOptions =
    entityKind === "lead"
      ? leads.map((l) => {
          const c = clients.find((x) => x.id === l.clientId);
          return { id: l.id, label: c ? `${c.firstName} ${c.lastName}` : `Lead ${l.id}` };
        })
      : entityKind === "client"
        ? clients.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))
        : properties.map((p) => ({ id: p.id, label: p.title }));

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      priority,
      dueAt: dueAt ? new Date(`${dueAt}T12:00:00`).toISOString() : undefined,
      assigneeId: assigneeId || undefined,
      entity: entityKind !== "none" && entityId ? { kind: entityKind, id: entityId } : undefined,
    });
    onClose();
  };

  const fieldCls =
    "h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold";

  return (
    <Modal
      open
      onClose={onClose}
      title="Nouvelle tâche"
      description="Attribuez une échéance et un agent ; la tâche apparaît immédiatement sur le tableau."
      footer={[
        <AdminButton key="cancel" variant="outline" onClick={onClose}>
          Annuler
        </AdminButton>,
        <AdminButton key="save" disabled={!title.trim()} onClick={submit}>
          Créer
        </AdminButton>,
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground uppercase">Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Relancer M. Alaoui pour les pièces du dossier"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Priorité</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className={fieldCls}
          >
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {label(PRIORITY_LABELS, p)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Échéance</span>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Agent</span>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className={fieldCls}
          >
            <option value=""> </option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Rattacher à</span>
          <select
            value={entityKind}
            onChange={(e) => {
              setEntityKind(e.target.value as typeof entityKind);
              setEntityId("");
            }}
            className={fieldCls}
          >
            <option value="none">Aucun</option>
            <option value="lead">Lead</option>
            <option value="client">Client</option>
            <option value="property">Bien</option>
          </select>
        </label>
        {entityKind !== "none" ? (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-muted-foreground uppercase">Élément</span>
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className={fieldCls}
            >
              <option value="">Sélectionner…</option>
              {entityOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
