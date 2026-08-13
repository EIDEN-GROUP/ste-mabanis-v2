import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import {
  transactionsQuery,
  clientsQuery,
  propertiesQuery,
  agentsQuery,
  useCreateTransaction,
  useMoveTransactionStage,
  useAddPayment,
  useMarkPaymentPaid,
} from "@/lib/admin/queries";
import { TRANSACTION_STAGES, type Transaction, type TransactionStage } from "@/lib/admin/types";
import { formatDate, formatMoney, label, TRANSACTION_STAGE_LABELS } from "@/lib/admin/format";
import { StatCard, Drawer, Modal, AdminButton, EmptyState } from "@/components/admin/primitives";
import { useCan } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — STE MABANIS" },
      { name: "description", content: "Suivi des transactions immobilières." },
    ],
  }),
  component: TransactionsPage,
});

const STAGE_INDEX = TRANSACTION_STAGES.reduce<Record<string, number>>((acc, s, i) => {
  acc[s] = i;
  return acc;
}, {});

function TransactionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: transactions = [] } = useQuery(transactionsQuery());
  const { data: clients = [] } = useQuery(clientsQuery({}));
  const { data: properties = [] } = useQuery(propertiesQuery({}));
  const { data: agents = [] } = useQuery(agentsQuery());

  const canManage = useCan("transaction.manage");

  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const propertiesById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);

  const open = transactions.filter((t) => !t.closedAt);
  const pipelineValue = open.reduce((s, t) => s + t.amount, 0);
  const commission = open.reduce((s, t) => s + t.commission, 0);
  const closing = transactions.filter((t) => t.stage === "closing").length;

  const selected = transactions.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="En cours"
          value={String(open.length)}
          hint="Transactions ouvertes"
          icon={Circle}
          index={0}
        />
        <StatCard
          label="Volume pipeline"
          value={formatMoney(pipelineValue, true)}
          hint="Montant des transactions ouvertes"
          icon={ChevronRight}
          index={1}
        />
        <StatCard
          label="Commissions à percevoir"
          value={formatMoney(commission, true)}
          hint="Base 2,5 % du prix"
          icon={CheckCircle2}
          index={2}
        />
        <StatCard
          label="Clôtures imminentes"
          value={String(closing)}
          hint="À l'étape clôture"
          icon={ChevronLeft}
          index={3}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Pipeline des transactions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            De l'intérêt à la clôture — cliquez sur un dossier pour le détailler.
          </p>
        </div>
        {canManage ? (
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="size-3.5" /> Nouvelle transaction
          </AdminButton>
        ) : null}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[1120px] gap-4">
          {TRANSACTION_STAGES.map((stage) => {
            const items = transactions.filter((t) => t.stage === stage);
            return (
              <div key={stage} className="flex min-w-[130px] flex-1 flex-col">
                <div className="flex items-baseline justify-between border-b-2 border-line pb-2">
                  <h3 className="text-[0.62rem] tracking-[0.14em] text-navy uppercase">
                    {label(TRANSACTION_STAGE_LABELS, stage)}
                  </h3>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <div className="mt-3 flex flex-col gap-3">
                  {items.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground italic">Vide</p>
                  ) : (
                    items.map((t) => {
                      const property = propertiesById.get(t.propertyId);
                      const buyer = clientsById.get(t.buyerClientId);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedId(t.id)}
                          className="group border border-line bg-admin-surface p-3.5 text-left transition-colors hover:border-gold/60"
                        >
                          <p className="text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                            {t.reference}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-sm font-medium text-navy">
                            {property?.title ?? "Bien supprimé"}
                          </p>
                          <p className="mt-2 text-sm font-medium text-blue tabular-nums">
                            {formatMoney(t.amount, true)}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {buyer ? `${buyer.firstName} ${buyer.lastName}` : "Acheteur"}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TransactionDrawer
        transaction={selected}
        property={selected ? (propertiesById.get(selected.propertyId) ?? null) : null}
        buyer={selected ? (clientsById.get(selected.buyerClientId) ?? null) : null}
        seller={
          selected?.sellerClientId ? (clientsById.get(selected.sellerClientId) ?? null) : null
        }
        agent={selected ? (agentsById.get(selected.agentId) ?? null) : null}
        onClose={() => setSelectedId(null)}
      />

      {creating ? (
        <TransactionFormModal
          clients={clients}
          properties={properties}
          agents={agents}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- transaction drawer */

function TransactionDrawer({
  transaction,
  property,
  buyer,
  seller,
  agent,
  onClose,
}: {
  transaction: Transaction | null;
  property: { title: string; reference: string } | null;
  buyer: { firstName: string; lastName: string } | null;
  seller: { firstName: string; lastName: string } | null;
  agent: { name: string } | null;
  onClose: () => void;
}) {
  const [addingPayment, setAddingPayment] = useState(false);
  const [labelPay, setLabelPay] = useState("Acompte");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState("");

  const moveStage = useMoveTransactionStage();
  const addPayment = useAddPayment();
  const markPaid = useMarkPaymentPaid();

  if (!transaction) return null;

  const stageIndex = STAGE_INDEX[transaction.stage] ?? 0;
  const progress = Math.round((stageIndex / (TRANSACTION_STAGES.length - 1)) * 100);
  const paidTotal = transaction.payments.filter((p) => p.paidAt).reduce((s, p) => s + p.amount, 0);

  const shift = (dir: -1 | 1) => {
    const next = TRANSACTION_STAGES[stageIndex + dir];
    if (next) moveStage.mutate({ id: transaction.id, stage: next });
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={transaction.reference}
      footer={[
        <AdminButton
          key="back"
          variant="outline"
          disabled={stageIndex === 0}
          onClick={() => shift(-1)}
        >
          <ChevronLeft className="size-3.5" /> Reculer
        </AdminButton>,
        <AdminButton
          key="fwd"
          disabled={stageIndex === TRANSACTION_STAGES.length - 1 || Boolean(transaction.closedAt)}
          onClick={() => shift(1)}
        >
          Avancer <ChevronRight className="size-3.5" />
        </AdminButton>,
      ]}
    >
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Étape {stageIndex + 1} / {TRANSACTION_STAGES.length}
            </span>
            <span className="tabular-nums">{progress} %</span>
          </div>
          <div className="mt-2 h-1.5 bg-line">
            <div
              className="h-full bg-gold transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-navy">
            {label(TRANSACTION_STAGE_LABELS, transaction.stage)}
          </p>
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Bien</dt>
            <dd className="text-navy">
              {property ? (
                <>
                  {property.title}{" "}
                  <span className="text-muted-foreground">({property.reference})</span>
                </>
              ) : (
                "Bien supprimé"
              )}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Acheteur</dt>
            <dd className="text-navy">{buyer ? `${buyer.firstName} ${buyer.lastName}` : "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Vendeur</dt>
            <dd className="text-navy">{seller ? `${seller.firstName} ${seller.lastName}` : "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Agent</dt>
            <dd className="text-navy">{agent?.name ?? "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Montant</dt>
            <dd className="text-navy tabular-nums">{formatMoney(transaction.amount)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Commission</dt>
            <dd className="text-navy tabular-nums">{formatMoney(transaction.commission)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Ouverte le</dt>
            <dd className="text-navy">{formatDate(transaction.openedAt)}</dd>
          </div>
          {transaction.closedAt ? (
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground uppercase">Clôturée le</dt>
              <dd className="text-positive">{formatDate(transaction.closedAt)}</dd>
            </div>
          ) : null}
        </dl>

        <div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">Échéancier de paiement</p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatMoney(paidTotal)} encaissés
            </span>
          </div>
          <ul className="mt-2.5 space-y-2">
            {transaction.payments.map((p) => {
              const paid = Boolean(p.paidAt);
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 border border-line px-3 py-2.5",
                    paid && "bg-sand/60 opacity-80",
                  )}
                >
                  <span
                    className={cn("shrink-0", paid ? "text-positive" : "text-muted-foreground")}
                  >
                    {paid ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm text-navy", paid && "line-through")}>
                      {p.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Échéance {formatDate(p.dueAt)}
                      {paid ? ` · payé le ${formatDate(p.paidAt!)}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-navy tabular-nums">
                    {formatMoney(p.amount, true)}
                  </span>
                  {!paid ? (
                    <button
                      type="button"
                      onClick={() =>
                        markPaid.mutate({ transactionId: transaction.id, paymentId: p.id })
                      }
                      className="border border-line px-2.5 py-1.5 text-[0.6rem] tracking-[0.12em] text-navy uppercase transition-colors hover:border-gold"
                    >
                      Encaisser
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {addingPayment ? (
          <form
            className="space-y-3 border border-line p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const amt = Number(amount);
              if (!amt || !dueAt) return;
              addPayment.mutate(
                {
                  transactionId: transaction.id,
                  label: labelPay.trim() || "Versement",
                  amount: amt,
                  dueAt: new Date(`${dueAt}T12:00:00`).toISOString(),
                },
                { onSuccess: () => setAddingPayment(false) },
              );
            }}
          >
            <p className="eyebrow">Ajouter un versement</p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground uppercase">Libellé</span>
              <input
                value={labelPay}
                onChange={(e) => setLabelPay(e.target.value)}
                className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground uppercase">Montant (MAD)</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground uppercase">Échéance</span>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>
            <AdminButton type="submit">Ajouter</AdminButton>
          </form>
        ) : (
          <AdminButton variant="outline" onClick={() => setAddingPayment(true)}>
            <Plus className="size-3.5" /> Ajouter un versement
          </AdminButton>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------- transaction form modal */

function TransactionFormModal({
  clients,
  properties,
  agents,
  onClose,
}: {
  clients: { firstName: string; lastName: string; id: string }[];
  properties: { title: string; reference: string; id: string }[];
  agents: { name: string; id: string }[];
  onClose: () => void;
}) {
  const [propertyId, setPropertyId] = useState("");
  const [buyerClientId, setBuyerClientId] = useState("");
  const [sellerClientId, setSellerClientId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [amount, setAmount] = useState("");
  const [commission, setCommission] = useState("");

  const create = useCreateTransaction();

  const submit = async () => {
    if (!propertyId || !buyerClientId) return;
    await create.mutateAsync({
      propertyId,
      buyerClientId,
      sellerClientId: sellerClientId || undefined,
      agentId: agentId || undefined,
      amount: Number(amount) || 0,
      commission: commission ? Number(commission) : undefined,
    });
    onClose();
  };

  const fieldCls =
    "h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold";

  return (
    <Modal
      open
      onClose={onClose}
      title="Nouvelle transaction"
      footer={[
        <AdminButton key="cancel" variant="outline" onClick={onClose}>
          Annuler
        </AdminButton>,
        <AdminButton key="save" disabled={!propertyId || !buyerClientId} onClick={submit}>
          Créer
        </AdminButton>,
      ]}
    >
      {properties.length === 0 ? (
        <EmptyState
          title="Aucun bien disponible"
          description="Créez d'abord un bien dans la section Propriétés."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-muted-foreground uppercase">Bien</span>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className={fieldCls}
            >
              <option value="">Sélectionner…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.reference})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Acheteur</span>
            <select
              value={buyerClientId}
              onChange={(e) => setBuyerClientId(e.target.value)}
              className={fieldCls}
            >
              <option value="">Sélectionner…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Vendeur</span>
            <select
              value={sellerClientId}
              onChange={(e) => setSellerClientId(e.target.value)}
              className={fieldCls}
            >
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Agent</span>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className={fieldCls}
            >
              <option value="">—</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Montant (MAD)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={fieldCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Commission (MAD)</span>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="2,5 % si vide"
              className={fieldCls}
            />
          </label>
        </div>
      )}
    </Modal>
  );
}
