import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Send, UserRound, Building2, Check, CheckCheck } from "lucide-react";
import {
  clientsQuery,
  propertiesQuery,
  matchesForClientQuery,
  matchesForPropertyQuery,
  useSendMatches,
} from "@/lib/admin/queries";
import type { Client, AdminProperty, PropertyMatch, ClientMatch } from "@/lib/admin/types";
import { formatMoney, label, ROLE_LABELS } from "@/lib/admin/format";
import { Panel, AdminButton, EmptyState, toast } from "@/components/admin/primitives";
import { useAgentScope, useCan } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/matching")({
  head: () => ({
    meta: [
      { title: "Matching — STE MABANIS" },
      { name: "description", content: "Correspondances entre biens et clients." },
    ],
  }),
  component: MatchingPage,
});

type Tab = "client" | "property";

function MatchingPage() {
  const [tab, setTab] = useState<Tab>("client");
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  // A commercial workspace only matches its own clients.
  const scope = useAgentScope();
  const canSend = useCan("match.send");

  const { data: clients = [] } = useQuery(clientsQuery({}));
  const { data: properties = [] } = useQuery(propertiesQuery({}));
  const { data: clientMatches = [] } = useQuery(matchesForClientQuery(clientId));
  const { data: propertyMatches = [] } = useQuery(matchesForPropertyQuery(propertyId));

  const sendMatches = useSendMatches();

  const propertiesById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const scopedClients = useMemo(
    () => (scope ? clients.filter((c) => c.agentId === scope) : clients),
    [clients, scope],
  );
  const clientsById = useMemo(() => new Map(scopedClients.map((c) => [c.id, c])), [scopedClients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scopedClients
      .filter((c) => c.roles.some((r) => r === "buyer" || r === "tenant" || r === "investor"))
      .filter((c) =>
        term
          ? `${c.firstName} ${c.lastName} ${c.email} ${c.city ?? ""}`.toLowerCase().includes(term)
          : true,
      );
  }, [scopedClients, search]);

  const activeProperties = useMemo(
    () => properties.filter((p) => ["available", "reserved", "under_offer"].includes(p.status)),
    [properties],
  );

  const selectedClient = clientId ? (clientsById.get(clientId) ?? null) : null;

  const togglePick = (pid: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Matching propriété ⟷ client</p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Score de compatibilité calculé sur le budget, le secteur et la nature de la recherche.
            Envoyez les meilleurs biens au client en un clic.
          </p>
        </div>
        <div className="flex border border-line">
          {(
            [
              ["client", "Par client"],
              ["property", "Par bien"],
            ] as const
          ).map(([key, labelText]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "px-4 py-2.5 text-[0.68rem] tracking-[0.14em] uppercase transition-colors",
                tab === key ? "bg-navy text-white" : "text-muted-foreground hover:text-navy",
              )}
            >
              {labelText}
            </button>
          ))}
        </div>
      </div>

      {tab === "client" ? (
        <ClientTab
          clients={filteredClients}
          search={search}
          onSearch={setSearch}
          selectedId={clientId}
          onSelect={(id) => {
            setClientId(id);
            setPicked(new Set());
          }}
          matches={clientMatches}
          propertiesById={propertiesById}
          picked={picked}
          canSend={canSend}
          onTogglePick={togglePick}
          onSendAll={() => {
            if (!selectedClient) return;
            const ids = clientMatches.map((m) => m.propertyId);
            sendMatches.mutate(
              { clientId: selectedClient.id, propertyIds: ids },
              {
                onSuccess: () =>
                  toast.success(
                    "Suggestions envoyées",
                    `${ids.length} biens transmis à ${selectedClient.firstName}.`,
                  ),
              },
            );
          }}
          onSendPicked={() => {
            if (!selectedClient || picked.size === 0) return;
            sendMatches.mutate(
              { clientId: selectedClient.id, propertyIds: [...picked] },
              {
                onSuccess: () => {
                  toast.success(
                    "Suggestions envoyées",
                    `${picked.size} biens transmis à ${selectedClient.firstName}.`,
                  );
                  setPicked(new Set());
                },
              },
            );
          }}
        />
      ) : (
        <PropertyTab
          properties={activeProperties}
          selectedId={propertyId}
          onSelect={setPropertyId}
          matches={propertyMatches}
          clientsById={clientsById}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- client tab */

function ClientTab({
  clients,
  search,
  onSearch,
  selectedId,
  onSelect,
  matches,
  propertiesById,
  picked,
  canSend,
  onTogglePick,
  onSendAll,
  onSendPicked,
}: {
  clients: Client[];
  search: string;
  onSearch: (s: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  matches: PropertyMatch[];
  propertiesById: Map<string, AdminProperty>;
  picked: Set<string>;
  canSend: boolean;
  onTogglePick: (pid: string) => void;
  onSendAll: () => void;
  onSendPicked: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <Panel className="self-start">
        <header className="border-b border-line px-4 py-3">
          <h2 className="display text-base">Clients acheteurs</h2>
          <label className="relative mt-3 flex items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Nom, e-mail, ville…"
              className="h-10 w-full border border-line bg-admin-bg/40 pl-9 pr-3 text-sm outline-none focus:border-gold"
            />
          </label>
        </header>
        {clients.length === 0 ? (
          <EmptyState
            title="Aucun client"
            description="Aucun acheteur ne correspond à la recherche."
          />
        ) : (
          <ul className="max-h-[26rem] divide-y divide-line overflow-y-auto">
            {clients.slice(0, 30).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    selectedId === c.id ? "bg-gold/10" : "hover:bg-sand/60",
                  )}
                >
                  <span className="display grid size-9 shrink-0 place-items-center border border-line bg-admin-surface text-xs text-navy">
                    {c.firstName[0] ?? ""}
                    {c.lastName[0] ?? ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-navy">
                      {c.firstName} {c.lastName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {c.city ?? "—"} · {label(ROLE_LABELS, c.roles[0] ?? "buyer")}
                    </span>
                  </span>
                  <Check
                    className={cn("size-4", selectedId === c.id ? "text-gold" : "text-transparent")}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="min-w-0 space-y-4">
        {selectedId === "" ? (
          <EmptyState
            title="Sélectionnez un client"
            description="Choisissez un acheteur à gauche pour voir ses biens recommandés."
          />
        ) : matches.length === 0 ? (
          <EmptyState
            title="Aucune correspondance"
            description="Aucun bien actif ne correspond au profil de ce client. Élargissez le budget ou le secteur."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-navy">{matches.length}</span> biens recommandés
                pour ce client
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="outline"
                  disabled={picked.size === 0 || !canSend}
                  onClick={onSendPicked}
                >
                  <Send className="size-3.5" /> Envoyer la sélection ({picked.size})
                </AdminButton>
                <AdminButton onClick={onSendAll} disabled={!canSend}>
                  <Send className="size-3.5" /> Tout envoyer
                </AdminButton>
              </div>
            </div>

            <ul className="space-y-3">
              {matches.map((m) => {
                const property = propertiesById.get(m.propertyId);
                if (!property) return null;
                return (
                  <li key={m.propertyId}>
                    <label className="flex cursor-pointer items-start gap-4 border border-line bg-admin-surface p-4 transition-colors hover:border-gold/60">
                      <input
                        type="checkbox"
                        checked={picked.has(m.propertyId)}
                        onChange={() => onTogglePick(m.propertyId)}
                        className="mt-1 size-4 accent-gold"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <h3 className="text-sm font-medium text-navy">{property.title}</h3>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {property.reference} · {property.city}
                          </span>
                          <span className="text-sm font-medium text-blue tabular-nums">
                            {formatMoney(property.price, true)}
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 bg-line">
                            <div className="h-full bg-gold" style={{ width: `${m.score}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gold tabular-nums">
                            {m.score} %
                          </span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.reasons.map((r) => (
                            <span
                              key={r}
                              className="border border-line px-2 py-0.5 text-[0.58rem] tracking-[0.1em] text-muted-foreground uppercase"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ property tab */

function PropertyTab({
  properties,
  selectedId,
  onSelect,
  matches,
  clientsById,
}: {
  properties: AdminProperty[];
  selectedId: string;
  onSelect: (id: string) => void;
  matches: ClientMatch[];
  clientsById: Map<string, Client>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <Panel className="self-start">
        <header className="border-b border-line px-4 py-3">
          <h2 className="display text-base">Biens actifs</h2>
        </header>
        {properties.length === 0 ? (
          <EmptyState
            title="Aucun bien actif"
            description="Publiez des biens pour les recommander."
          />
        ) : (
          <ul className="max-h-[26rem] divide-y divide-line overflow-y-auto">
            {properties.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    selectedId === p.id ? "bg-gold/10" : "hover:bg-sand/60",
                  )}
                >
                  <Building2
                    className={cn(
                      "size-4 shrink-0",
                      selectedId === p.id ? "text-gold" : "text-muted-foreground",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-navy">{p.title}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {p.reference} · {formatMoney(p.price, true)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="min-w-0 space-y-4">
        {selectedId === "" ? (
          <EmptyState
            title="Sélectionnez un bien"
            description="Choisissez un bien à gauche pour voir les clients les plus compatibles."
          />
        ) : matches.length === 0 ? (
          <EmptyState
            title="Aucun client compatible"
            description="Aucun acheteur ou locataire du fichier ne correspond à ce bien."
          />
        ) : (
          <ul className="space-y-3">
            {matches.map((m) => {
              const client = clientsById.get(m.clientId);
              if (!client) return null;
              return (
                <li key={m.clientId}>
                  <div className="flex items-start gap-4 border border-line bg-admin-surface p-4">
                    <span className="display grid size-10 shrink-0 place-items-center border border-line bg-sand text-xs text-navy">
                      {client.firstName[0] ?? ""}
                      {client.lastName[0] ?? ""}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-sm font-medium text-navy">
                          {client.firstName} {client.lastName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {client.city ?? "—"} ·{" "}
                          {client.budgetMin !== undefined && client.budgetMax !== undefined
                            ? `${formatMoney(client.budgetMin, true)} – ${formatMoney(client.budgetMax, true)}`
                            : "Budget non renseigné"}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-line">
                          <div className="h-full bg-gold" style={{ width: `${m.score}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gold tabular-nums">
                          {m.score} %
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {m.reasons.map((r) => (
                          <span
                            key={r}
                            className="border border-line px-2 py-0.5 text-[0.58rem] tracking-[0.1em] text-muted-foreground uppercase"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 border border-line px-2.5 py-1 text-[0.58rem] tracking-[0.12em] text-muted-foreground uppercase sm:inline-flex">
                      <CheckCheck className="size-3.5 text-gold" /> {m.reasons.length} critères
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
