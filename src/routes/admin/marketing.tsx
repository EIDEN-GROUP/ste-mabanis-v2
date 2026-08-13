import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Send,
  Trash2,
  Star,
  Mail,
  MessageSquare,
  Megaphone,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  marketingStatsQuery,
  propertiesQuery,
  useCreateCampaign,
  useSendCampaign,
  useDeleteCampaign,
  useSetFeatured,
  useRemoveFeatured,
} from "@/lib/admin/queries";
import type { CampaignChannel, MarketingCampaign } from "@/lib/admin/types";
import { formatDate, formatMoney, label, SOURCE_LABELS, relativeTime } from "@/lib/admin/format";
import {
  StatCard,
  Panel,
  Modal,
  AdminButton,
  EmptyState,
  toast,
} from "@/components/admin/primitives";
import { CategoryBarChart, ChartLegend } from "@/components/admin/charts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing — STE MABANIS" },
      { name: "description", content: "Campagnes, biens à la une et suivi des sources." },
    ],
  }),
  component: MarketingPage,
});

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: "E-mail",
  whatsapp: "WhatsApp",
  portail: "Portail",
  reseaux_sociaux: "Réseaux sociaux",
};

const CHANNEL_ICONS: Record<CampaignChannel, typeof Mail> = {
  email: Mail,
  whatsapp: MessageSquare,
  portail: Megaphone,
  reseaux_sociaux: Users,
};

const STATUS_STYLE: Record<MarketingCampaign["status"], string> = {
  draft: "border-line text-muted-foreground",
  scheduled: "border-blue/40 text-blue",
  sent: "border-positive/40 text-positive",
};

function MarketingPage() {
  const { data: stats } = useQuery(marketingStatsQuery());
  const { data: properties = [] } = useQuery(propertiesQuery({}));
  const [creating, setCreating] = useState(false);

  const sendCampaign = useSendCampaign();
  const deleteCampaign = useDeleteCampaign();
  const setFeat = useSetFeatured();
  const removeFeat = useRemoveFeatured();

  const campaigns = stats?.campaigns ?? [];
  const featured = stats?.featured ?? [];
  const sources = stats?.sources ?? [];
  const totals = stats?.totals;

  const featuredUntil = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of stats?.featured ?? []) m.set(f.propertyId, f.until);
    return m;
  }, [stats?.featured]);

  const activeProperties = useMemo(
    () => properties.filter((p) => ["available", "reserved", "under_offer"].includes(p.status)),
    [properties],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Campagnes envoyées"
          value={String(totals?.sent ?? 0)}
          hint="Sur toutes les périodes"
          icon={Send}
          index={0}
        />
        <StatCard
          label="Ouvertures"
          value={String(totals?.opens ?? 0)}
          hint="Cumulées"
          icon={Mail}
          index={1}
        />
        <StatCard
          label="Clics"
          value={String(totals?.clicks ?? 0)}
          hint="Liens visités"
          icon={MousePointerClick}
          index={2}
        />
        <StatCard
          label="Conversions"
          value={String(totals?.conversions ?? 0)}
          hint="Leads générés"
          icon={Users}
          index={3}
        />
      </div>

      <Panel>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="display text-xl">Biens à la une</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mis en avant sur la page d'accueil publique, avec une date de fin.
            </p>
          </div>
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="size-3.5" /> Nouvelle campagne
          </AdminButton>
        </header>
        {activeProperties.length === 0 ? (
          <EmptyState
            title="Aucun bien actif"
            description="Publiez un bien pour le mettre à la une."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">Bien</th>
                  <th className="px-5 py-3 font-medium">Prix</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">À la une jusqu'au</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {activeProperties.map((p) => {
                  const until = featuredUntil.get(p.id);
                  const isFeatured = Boolean(until);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-sand/40">
                      <td className="max-w-[18rem] px-5 py-3">
                        <p className="truncate font-medium text-navy">{p.title}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{p.reference}</p>
                      </td>
                      <td className="px-5 py-3 text-navy tabular-nums">
                        {formatMoney(p.price, true)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="border border-line px-2 py-0.5 text-[0.58rem] tracking-[0.12em] text-muted-foreground uppercase">
                          {p.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground tabular-nums">
                        {isFeatured ? formatDate(until!) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (isFeatured) {
                              removeFeatured(p);
                            } else {
                              setFeatured(p);
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[0.6rem] tracking-[0.12em] uppercase transition-colors",
                            isFeatured
                              ? "border-gold/60 text-gold"
                              : "border-line text-muted-foreground hover:border-gold hover:text-gold",
                          )}
                        >
                          <Star className={cn("size-3.5", isFeatured && "fill-gold")} />
                          {isFeatured ? "Retirer" : "À la une"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <header className="border-b border-line px-5 py-4">
            <h2 className="display text-xl">Campagnes</h2>
          </header>
          {campaigns.length === 0 ? (
            <EmptyState
              title="Aucune campagne"
              description="Créez votre première campagne d'acquisition."
            />
          ) : (
            <ul className="divide-y divide-line">
              {campaigns.map((c) => {
                const Icon = CHANNEL_ICONS[c.channel];
                return (
                  <li key={c.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center border border-line bg-sand text-gold">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="truncate text-sm font-medium text-navy">{c.name}</h3>
                          <span
                            className={cn(
                              "border px-2 py-0.5 text-[0.58rem] tracking-[0.12em] uppercase",
                              STATUS_STYLE[c.status],
                            )}
                          >
                            {c.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {label(CHANNEL_LABELS, c.channel)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {c.subject}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                          {c.audience} · {c.audienceCount} destinataires
                          {c.sentAt ? ` · envoyée ${relativeTime(c.sentAt)}` : ""}
                        </p>
                        {c.status === "sent" ? (
                          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                            <span className="text-muted-foreground">
                              Ouvertures{" "}
                              <span className="font-medium text-navy tabular-nums">{c.opens}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Clics{" "}
                              <span className="font-medium text-navy tabular-nums">{c.clicks}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Conversions{" "}
                              <span className="font-medium text-positive tabular-nums">
                                {c.conversions}
                              </span>
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {c.status !== "sent" ? (
                          <button
                            type="button"
                            onClick={() => send(c)}
                            aria-label={`Envoyer ${c.name}`}
                            className="grid size-9 place-items-center border border-line text-navy transition-colors hover:border-gold"
                          >
                            <Send className="size-4" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          aria-label={`Supprimer ${c.name}`}
                          className="grid size-9 place-items-center border border-line text-muted-foreground transition-colors hover:border-negative hover:text-negative"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel>
          <header className="border-b border-line px-5 py-4">
            <h2 className="display text-xl">Origine des leads</h2>
            <p className="mt-1 text-sm text-muted-foreground">Volume et conversion par source.</p>
          </header>
          <div className="p-5">
            <CategoryBarChart
              data={sources.map((s) => ({ label: label(SOURCE_LABELS, s.source), value: s.leads }))}
              xKey="label"
              dataKey="value"
              name="Leads"
              height={220}
              horizontal
            />
            <div className="mt-4 border-t border-line pt-4">
              <ChartLegend
                items={sources.map((s) => ({ label: label(SOURCE_LABELS, s.source) }))}
              />
            </div>
            <ul className="mt-4 divide-y divide-line">
              {sources.map((s) => (
                <li key={s.source} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 truncate text-navy">
                    {label(SOURCE_LABELS, s.source)}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{s.leads} leads</span>
                  <span className="w-20 text-right text-muted-foreground tabular-nums">
                    {s.conversions} convertis
                  </span>
                  <span
                    className={cn(
                      "w-16 text-right font-medium tabular-nums",
                      s.rate >= 20
                        ? "text-positive"
                        : s.rate > 0
                          ? "text-gold"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.rate} %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {creating ? <CampaignModal onClose={() => setCreating(false)} /> : null}
    </div>
  );

  function send(c: MarketingCampaign) {
    sendCampaign.mutate(c.id, {
      onSuccess: () =>
        toast.success("Campagne envoyée", `${c.audienceCount} destinataires contactés.`),
    });
  }

  function remove(c: MarketingCampaign) {
    deleteCampaign.mutate(c.id, {
      onSuccess: () => toast.success("Campagne supprimée"),
    });
  }

  function setFeatured(p: { id: string }) {
    const until = new Date(Date.now() + 7 * 86_400_000).toISOString();
    setFeat.mutate(
      { propertyId: p.id, until },
      {
        onSuccess: () =>
          toast.success("Bien mis à la une", "Visible sur la page d'accueil pendant 7 jours."),
      },
    );
  }

  function removeFeatured(p: { id: string }) {
    removeFeat.mutate(p.id, { onSuccess: () => toast.success("Bien retiré de la une") });
  }
}

/* ------------------------------------------------------------ campaign modal */

function CampaignModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("email");
  const [audience, setAudience] = useState("");
  const [audienceCount, setAudienceCount] = useState("");

  const create = useCreateCampaign();

  const submit = async () => {
    await create.mutateAsync({
      name: name.trim() || "Campagne sans titre",
      subject: subject.trim(),
      channel,
      audience: audience.trim(),
      audienceCount: Number(audienceCount) || 0,
    });
    onClose();
  };

  const fieldCls =
    "h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold";

  return (
    <Modal
      open
      onClose={onClose}
      title="Nouvelle campagne"
      description="Le brouillon peut être envoyé immédiatement depuis la liste."
      footer={[
        <AdminButton key="cancel" variant="outline" onClick={onClose}>
          Annuler
        </AdminButton>,
        <AdminButton key="save" onClick={submit}>
          Créer le brouillon
        </AdminButton>,
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground uppercase">Nom de la campagne</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Coup de cœur Marina — Septembre"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground uppercase">Objet / message</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex. 3 biens d'exception face à la Marina"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Canal</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as CampaignChannel)}
            className={fieldCls}
          >
            {(Object.keys(CHANNEL_LABELS) as CampaignChannel[]).map((c) => (
              <option key={c} value={c}>
                {label(CHANNEL_LABELS, c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase">Taille de l'audience</span>
          <input
            type="number"
            value={audienceCount}
            onChange={(e) => setAudienceCount(e.target.value)}
            placeholder="Ex. 240"
            className={fieldCls}
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground uppercase">Segment ciblé</span>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Ex. Acheteurs Marina — budget ≥ 2 M MAD"
            className={fieldCls}
          />
        </label>
      </div>
    </Modal>
  );
}
