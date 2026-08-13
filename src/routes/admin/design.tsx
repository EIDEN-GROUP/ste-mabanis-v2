import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import {
  appointmentsQuery,
  clientsQuery,
  documentsQuery,
  leadsQuery,
  propertiesQuery,
  useMoveLead,
} from "@/lib/admin/queries";
import { formatMoney, label, PROPERTY_STATUS_LABELS, relativeTime } from "@/lib/admin/format";
import { PROPERTY_STATUSES, PIPELINE_STAGES } from "@/lib/admin/types";
import type { PropertyQuery as PQ } from "@/lib/admin/repository";
import {
  AdminButton,
  Drawer,
  EmptyState,
  LoadingState,
  Modal,
  Panel,
  PanelHeader,
  StatCard,
  toast,
} from "@/components/admin/primitives";
import {
  PriorityBadge,
  PropertyStatusBadge,
  RoleBadge,
  StageBadge,
  TemperatureBadge,
} from "@/components/admin/status-badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AppointmentCard, ClientCard, DocumentCard, PropertyCard } from "@/components/admin/cards";
import { Pipeline } from "@/components/admin/pipeline";
import { PropertyFilters } from "@/components/admin/property-filters";
import { PropertyGallery } from "@/components/admin/property-gallery";
import { Calendar } from "@/components/admin/calendar";
import type { AdminProperty } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/design")({
  head: () => ({
    meta: [
      { title: "Design system — STE MABANIS" },
      { name: "description", content: "Bibliothèque de composants réutilisables de l'admin." },
    ],
  }),
  component: DesignSystemPage,
});

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <PanelHeader eyebrow="Composant" title={title} />
      {note ? (
        <p className="border-b border-line px-5 py-3 text-xs text-muted-foreground">{note}</p>
      ) : null}
      <div className="p-5">{children}</div>
    </Panel>
  );
}

function DesignSystemPage() {
  const [filters, setFilters] = useState<PQ>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: properties = [], isPending: propsPending } = useQuery(propertiesQuery(filters));
  const { data: clients = [] } = useQuery(clientsQuery());
  const { data: leads = [] } = useQuery(leadsQuery());
  const { data: appointments = [] } = useQuery(appointmentsQuery());
  const { data: documents = [] } = useQuery(documentsQuery());
  const moveLead = useMoveLead();

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const propertyMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const columns: Column<AdminProperty>[] = [
    {
      id: "title",
      header: "Bien",
      primary: true,
      sortValue: (p) => p.title,
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{p.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {p.reference} · {p.neighborhood}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Statut",
      sortValue: (p) => p.status,
      cell: (p) => <PropertyStatusBadge status={p.status} />,
    },
    {
      id: "price",
      header: "Prix",
      sortValue: (p) => p.price,
      className: "text-right tabular-nums",
      cell: (p) => formatMoney(p.price, true),
    },
    {
      id: "views",
      header: "Vues",
      hideBelow: "lg",
      sortValue: (p) => p.views30d,
      className: "text-right tabular-nums",
      cell: (p) => p.views30d,
    },
    {
      id: "updated",
      header: "Mis à jour",
      hideBelow: "xl",
      sortValue: (p) => p.updatedAt,
      cell: (p) => <span className="text-muted-foreground">{relativeTime(p.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <p className="eyebrow">Phase 2 — fondations</p>
        <h2 className="display mt-2 text-3xl">Bibliothèque de composants</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Chaque composant utilise les tokens sémantiques de{" "}
          <code className="bg-sand px-1.5 py-0.5 text-xs">src/styles.css</code> — aucune couleur
          n'est codée en dur. Tous sont responsives de 375 à 1440 px.
        </p>
      </Panel>

      <Block title="StatCard" note="Tuile d'indicateur avec delta et icône.">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            index={0}
            label="Biens actifs"
            value="24"
            delta={8}
            hint="en ligne"
            icon={Building2}
          />
          <StatCard index={1} label="Pipeline" value="18,4 M MAD" delta={14} hint="en cours" />
          <StatCard index={2} label="Visites" value="37" delta={-6} hint="30 jours" />
          <StatCard index={3} label="Conversion" value="12%" hint="sans delta" />
        </div>
      </Block>

      <Block
        title="Badges"
        note="Statuts de bien, étapes de pipeline, température, priorité, rôle."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_STATUSES.map((s) => (
              <PropertyStatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STAGES.map((s) => (
              <StageBadge key={s} stage={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <TemperatureBadge temperature="cold" score={22} />
            <TemperatureBadge temperature="warm" score={58} />
            <TemperatureBadge temperature="hot" score={87} />
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority="low" />
            <PriorityBadge priority="normal" />
            <PriorityBadge priority="high" />
            <PriorityBadge priority="urgent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["buyer", "seller", "tenant", "landlord", "investor"].map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        </div>
      </Block>

      <Block title="Boutons, Modal, Drawer, Toast">
        <div className="flex flex-wrap gap-3">
          <AdminButton onClick={() => setModalOpen(true)}>
            <Plus className="size-3.5" />
            Ouvrir la modale
          </AdminButton>
          <AdminButton variant="outline" onClick={() => setDrawerOpen(true)}>
            Ouvrir le drawer
          </AdminButton>
          <AdminButton
            variant="ghost"
            onClick={() => toast.success("Enregistré", "Le bien est publié.")}
          >
            Toast succès
          </AdminButton>
          <AdminButton variant="danger" onClick={() => toast.error("Échec", "Vérifiez le mandat.")}>
            Toast erreur
          </AdminButton>
        </div>
      </Block>

      <Block title="PropertyFilters" note="Inline à partir de lg, en drawer en dessous.">
        <PropertyFilters value={filters} onChange={setFilters} />
      </Block>

      <Block
        title="DataTable"
        note="Vrai tableau à partir de md, cartes empilées en dessous. Colonnes triables."
      >
        <DataTable
          rows={properties}
          columns={columns}
          getRowId={(p) => p.id}
          isLoading={propsPending}
          onRowClick={(p) => toast.info(p.title, label(PROPERTY_STATUS_LABELS, p.status))}
          empty={{ title: "Aucun bien", description: "Ajustez les filtres ci-dessus." }}
        />
      </Block>

      <Block title="PropertyCard / ClientCard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.slice(0, 3).map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.slice(0, 3).map((c, i) => (
            <ClientCard key={c.id} client={c} index={i} />
          ))}
        </div>
      </Block>

      <Block title="PropertyGallery" note="Carrousel scroll-snap, swipe natif au doigt.">
        <div className="max-w-xl">
          <PropertyGallery media={properties[0]?.media ?? []} />
        </div>
      </Block>

      <Block
        title="Pipeline"
        note="Kanban glisser-déposer. Colonnes en scroll-snap sur mobile ; le select de chaque carte est l'équivalent accessible."
      >
        <Pipeline
          leads={leads}
          clients={clientMap}
          properties={propertyMap}
          onMove={(id, stage) => moveLead.mutate({ id, stage })}
        />
      </Block>

      <Block title="Calendar / AppointmentCard">
        <div className="grid gap-4 lg:grid-cols-2">
          <Calendar appointments={appointments} />
          {/* min-w-0: without it this column's min-content widens the whole grid. */}
          <div className="min-w-0 space-y-3">
            {appointments.slice(0, 4).map((a, i) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                client={a.clientId ? clientMap.get(a.clientId) : undefined}
                property={a.propertyId ? propertyMap.get(a.propertyId) : undefined}
                index={i}
              />
            ))}
          </div>
        </div>
      </Block>

      <Block title="DocumentCard">
        <div className="space-y-3">
          {documents.slice(0, 4).map((d, i) => (
            <DocumentCard key={d.id} document={d} index={i} />
          ))}
        </div>
      </Block>

      <Block title="EmptyState / LoadingState">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-line">
            <EmptyState
              title="Aucun bien"
              description="Créez votre première fiche pour la publier sur le site."
              action={<AdminButton>Ajouter un bien</AdminButton>}
            />
          </div>
          <div className="border border-line p-4">
            <LoadingState rows={4} />
          </div>
        </div>
      </Block>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Exemple de modale"
        description="Feuille par le bas sur mobile, fenêtre centrée à partir de sm."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </AdminButton>
            <AdminButton
              onClick={() => {
                setModalOpen(false);
                toast.success("Confirmé");
              }}
            >
              Confirmer
            </AdminButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Le corps défile si le contenu dépasse la hauteur disponible. Échap ferme, le scroll de la
          page est bloqué pendant l'ouverture.
        </p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Exemple de drawer"
        footer={
          <AdminButton className="flex-1" onClick={() => setDrawerOpen(false)}>
            Fermer
          </AdminButton>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Feuille par le bas sous sm, panneau latéral au-dessus. Utilisé pour les filtres et les
          fiches de détail.
        </p>
      </Drawer>
    </div>
  );
}
