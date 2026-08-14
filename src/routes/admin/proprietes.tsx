import { useCallback, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  Upload,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  FileText,
  Video,
  Pencil,
  Check,
  Users,
} from "lucide-react";
import {
  propertiesQuery,
  agentsQuery,
  useCreateProperty,
  useUpdateProperty,
  useSetPropertyStatus,
  useAddPropertyMedia,
  useUpdatePropertyMedia,
  useMovePropertyMedia,
  useRemovePropertyMedia,
} from "@/lib/admin/queries";
import type { PropertyQuery } from "@/lib/admin/repository";
import {
  PROPERTY_STATUSES,
  ACTIVE_PROPERTY_STATUSES,
  type AdminProperty,
  type PropertyStatus,
} from "@/lib/admin/types";
import { formatMoney, formatNumber, label, PROPERTY_STATUS_LABELS } from "@/lib/admin/format";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PropertyFilters } from "@/components/admin/property-filters";
import { PropertyStatusBadge } from "@/components/admin/status-badge";
import { PropertyGallery } from "@/components/admin/property-gallery";
import { Modal, AdminButton, toast, LoadingState } from "@/components/admin/primitives";
import { useCan } from "@/lib/admin/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/proprietes")({
  head: () => ({
    meta: [
      { title: "Propriétés   STE MABANIS" },
      { name: "description", content: "Gestion du portefeuille immobilier." },
    ],
  }),
  component: PropertiesPage,
});

const TRANSACTION_LABELS = { vente: "À vendre", location: "À louer" } as const;

const PROPERTY_TYPES = [
  "Appartement",
  "Villa",
  "Riad",
  "Maison",
  "Penthouse",
  "Duplex",
  "Bureaux",
  "Local commercial",
  "Terrain",
];

function readFiles(
  files: FileList | File[],
  maxWidth = 1600,
): Promise<{ url: string; kind: "photo" | "floor_plan" | "video"; label: string }[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<{ url: string; kind: "photo" | "floor_plan" | "video"; label: string }>(
          (resolve, reject) => {
            const isVideo = file.type.startsWith("video/");
            const reader = new FileReader();
            reader.onerror = () => reject(new Error(`Lecture impossible : ${file.name}`));
            reader.onload = () => {
              const url = String(reader.result ?? "");
              if (isVideo || file.type === "application/pdf") {
                resolve({ url, kind: isVideo ? "video" : "floor_plan", label: file.name });
                return;
              }
              const img = new Image();
              img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve({ url, kind: "photo", label: file.name });
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve({
                  url: canvas.toDataURL("image/jpeg", 0.82),
                  kind: "photo",
                  label: file.name,
                });
              };
              img.onerror = () => resolve({ url, kind: "photo", label: file.name });
              img.src = url;
            };
            reader.readAsDataURL(file);
          },
        ),
    ),
  );
}

function PropertiesPage() {
  const [query, setQuery] = useState<PropertyQuery>({});
  const [selected, setSelected] = useState<AdminProperty | null>(null);
  const [creating, setCreating] = useState(false);

  const { data = [], isPending } = useQuery(propertiesQuery(query));
  const { data: agents = [] } = useQuery(agentsQuery());

  const canCreate = useCan("property.create");
  const canEdit = useCan("property.edit");

  const agentName = useCallback(
    (id: string) => agents.find((a) => a.id === id)?.name ?? " ",
    [agents],
  );

  const columns: Column<AdminProperty>[] = [
    {
      id: "bien",
      header: "Bien",
      primary: true,
      sortValue: (p) => p.title,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-sand">
            {(() => {
              const cover = p.media.find((m) => m.isCover) ?? p.media[0];
              return cover ? (
                <img src={cover.url} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <Building2 className="size-4 text-gold" />
              );
            })()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-navy">{p.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {p.reference} · {p.neighborhood}
            </span>
          </span>
        </div>
      ),
    },
    {
      id: "statut",
      header: "Statut",
      sortValue: (p) => p.status,
      cell: (p) => <PropertyStatusBadge status={p.status} />,
    },
    {
      id: "transaction",
      header: "Transaction",
      hideBelow: "md",
      sortValue: (p) => p.transaction,
      cell: (p) => (
        <span className="text-sm text-navy/80">{TRANSACTION_LABELS[p.transaction]}</span>
      ),
    },
    {
      id: "prix",
      header: "Prix",
      hideBelow: "md",
      sortValue: (p) => p.price,
      cell: (p) => (
        <span className="font-medium text-blue tabular-nums">{formatMoney(p.price)}</span>
      ),
    },
    {
      id: "surface",
      header: "Surface",
      hideBelow: "lg",
      sortValue: (p) => p.surface,
      cell: (p) => (
        <span className="text-sm text-navy/80 tabular-nums">{formatNumber(p.surface)} m²</span>
      ),
    },
    {
      id: "agent",
      header: "Agent",
      hideBelow: "lg",
      sortValue: (p) => agentName(p.agentId),
      cell: (p) => <span className="text-sm text-navy/80">{agentName(p.agentId)}</span>,
    },
    {
      id: "vues",
      header: "Vues 30 j",
      hideBelow: "xl",
      sortValue: (p) => p.views30d,
      cell: (p) => <span className="text-sm text-muted-foreground tabular-nums">{p.views30d}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Portefeuille</p>
          <h2 className="display mt-1 text-2xl">
            {isPending ? "…" : `${formatNumber(data.length)} bien${data.length > 1 ? "s" : ""}`}
          </h2>
        </div>
        {canCreate ? (
          <AdminButton onClick={() => setCreating(true)}>
            <Plus className="size-3.5" />
            Nouveau bien
          </AdminButton>
        ) : null}
      </div>

      <PropertyFilters value={query} onChange={setQuery} />

      <DataTable
        rows={data}
        columns={columns}
        getRowId={(p) => p.id}
        onRowClick={setSelected}
        isLoading={isPending}
        empty={{
          title: "Aucun bien trouvé",
          description: "Modifiez vos filtres ou créez une nouvelle fiche.",
          action: canCreate ? (
            <AdminButton onClick={() => setCreating(true)}>
              <Plus className="size-3.5" />
              Nouveau bien
            </AdminButton>
          ) : undefined,
        }}
      />

      <PropertyDetailModal
        property={selected}
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        canEdit={canEdit}
        onClose={() => setSelected(null)}
      />

      {creating ? <PropertyFormModal onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------- detail modal */

function PropertyDetailModal({
  property,
  agents,
  canEdit,
  onClose,
}: {
  property: AdminProperty | null;
  agents: { id: string; name: string }[];
  canEdit: boolean;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const setStatus = useSetPropertyStatus();

  if (!property) return null;

  const publicLive = ACTIVE_PROPERTY_STATUSES.includes(property.status);

  return (
    <Modal
      open={Boolean(property)}
      onClose={onClose}
      title={property.title}
      size="lg"
      footer={
        <>
          {canEdit ? (
            <AdminButton variant="outline" onClick={() => setEditing((v) => !v)}>
              <Pencil className="size-3.5" />
              {editing ? "Voir la fiche" : "Modifier"}
            </AdminButton>
          ) : null}
          <AdminButton variant="outline" className="flex-1" onClick={onClose}>
            Fermer
          </AdminButton>
        </>
      }
    >
      {editing ? (
        <PropertyFormModal property={property} agents={agents} onClose={() => setEditing(false)} />
      ) : (
        <PropertyDetailView property={property} agents={agents} onSetStatus={setStatus.mutate} />
      )}
    </Modal>
  );
}

function PropertyDetailView({
  property,
  agents,
  onSetStatus,
}: {
  property: AdminProperty;
  agents: { id: string; name: string }[];
  onSetStatus: (vars: { id: string; status: PropertyStatus }) => void;
}) {
  const agentName = agents.find((a) => a.id === property.agentId)?.name ?? " ";
  const publicLive = ACTIVE_PROPERTY_STATUSES.includes(property.status);

  return (
    <div className="space-y-5">
      <PropertyGallery media={property.media} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
            {property.reference} · {property.slug}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            {publicLive ? (
              <>
                <span className="size-1.5 rounded-full bg-status-available" />
                En ligne sur le site public
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-line" />
                Non publié
              </>
            )}
          </span>
        </div>
        <p className="display mt-1 text-3xl text-blue tabular-nums">
          {formatMoney(property.price)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {TRANSACTION_LABELS[property.transaction]} · {property.type} · {property.city},{" "}
          {property.neighborhood}
        </p>
      </div>

      <section>
        <p className="eyebrow mb-2.5">Statut</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus({ id: property.id, status: s })}
              aria-pressed={property.status === s}
              className={cn(
                "min-h-9 border px-3 py-1.5 text-[0.66rem] tracking-[0.1em] uppercase transition-colors duration-300",
                property.status === s
                  ? "border-gold bg-gold/10 text-navy"
                  : "border-line text-muted-foreground hover:border-gold/60",
              )}
            >
              {label(PROPERTY_STATUS_LABELS, s)}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          {property.status === "available" ||
          property.status === "reserved" ||
          property.status === "under_offer"
            ? "Visible dans les résultats du site public."
            : property.status === "sold" || property.status === "rented"
              ? "Retiré du site public   l'historique et les rapports sont conservés."
              : "Caché du site public."}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[
          {
            icon: MapPin,
            label: "Localisation",
            value: `${property.city} · ${property.neighborhood}`,
          },
          { icon: Maximize, label: "Surface", value: `${formatNumber(property.surface)} m²` },
          { icon: BedDouble, label: "Chambres", value: String(property.bedrooms) },
          { icon: Bath, label: "Salles de bain", value: String(property.bathrooms) },
        ].map(({ icon: Icon, label: l, value }) => (
          <div
            key={l}
            className="flex items-center gap-3 rounded-md border border-line bg-admin-bg/50 px-3.5 py-3"
          >
            <Icon className="size-4 shrink-0 text-gold" />
            <div className="min-w-0">
              <p className="text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
                {l}
              </p>
              <p className="truncate text-sm font-medium text-navy">{value}</p>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-3 rounded-md border border-line bg-admin-bg/50 px-3.5 py-3">
          <Building2 className="size-4 shrink-0 text-gold" />
          <div className="min-w-0">
            <p className="text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
              Agent en charge
            </p>
            <p className="truncate text-sm font-medium text-navy">{agentName}</p>
          </div>
        </div>
        {property.ownerClientId ? (
          <div className="col-span-2 flex items-center gap-3 rounded-md border border-line bg-admin-bg/50 px-3.5 py-3">
            <Users className="size-4 shrink-0 text-gold" />
            <div className="min-w-0">
              <p className="text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
                Propriétaire
              </p>
              <p className="truncate text-sm font-medium text-navy">{property.ownerClientId}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <p className="eyebrow mb-2.5">Description</p>
        <p className="text-sm leading-relaxed text-navy/80">{property.description}</p>
      </section>

      {property.features.length ? (
        <section>
          <p className="eyebrow mb-2.5">Équipements</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {property.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-navy/80">
                <Check className="size-3.5 shrink-0 text-gold" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MediaManager property={property} />
    </div>
  );
}

/* ------------------------------------------------------------ media manager */

function MediaManager({ property }: { property: AdminProperty }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [kind, setKind] = useState<"photo" | "floor_plan" | "video">("photo");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const addMedia = useAddPropertyMedia();
  const updateMedia = useUpdatePropertyMedia();
  const moveMedia = useMovePropertyMedia();
  const removeMedia = useRemovePropertyMedia();

  const handleFiles = async (files: FileList | File[]) => {
    if (!files.length) return;
    setBusy(true);
    try {
      const items = await readFiles(files);
      await addMedia.mutateAsync({ propertyId: property.id, items });
      toast.success("Médias ajoutés", `${items.length} élément(s) mis en ligne.`);
    } catch (err) {
      toast.error("Ajout impossible", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const KINDS = {
    photo: { label: "Photos", icon: ImagePlus },
    floor_plan: { label: "Plans", icon: FileText },
    video: { label: "Vidéos", icon: Video },
  } as const;

  const grouped = property.media.filter((m) => m.kind === kind);

  return (
    <section className="space-y-3">
      <p className="eyebrow">Médias</p>

      <div className="flex gap-2">
        {(Object.keys(KINDS) as (keyof typeof KINDS)[]).map((k) => {
          const Icon = KINDS[k].icon;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 border px-3 py-1.5 text-[0.66rem] tracking-[0.12em] uppercase transition-colors",
                kind === k
                  ? "border-gold bg-gold/10 text-navy"
                  : "border-line text-muted-foreground hover:border-gold/60",
              )}
            >
              <Icon className="size-3.5" />
              {KINDS[k].label}
            </button>
          );
        })}
      </div>

      {grouped.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {grouped.map((m, idx) => (
            <li key={m.id} className="group relative rounded-md border border-line bg-admin-bg/50">
              {m.kind === "video" ? (
                <video
                  src={m.url}
                  className="aspect-[4/3] w-full rounded-md bg-sand object-cover"
                  muted
                />
              ) : (
                <img
                  src={m.url}
                  alt={m.label ?? ""}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-md bg-sand object-cover"
                />
              )}
              {m.kind === "photo" ? (
                <button
                  type="button"
                  onClick={() => updateMedia.mutate({ id: m.id, patch: { isCover: !m.isCover } })}
                  aria-label={m.isCover ? "Retirer la couverture" : "Définir comme couverture"}
                  aria-pressed={m.isCover}
                  className={cn(
                    "absolute top-2 left-2 grid size-8 place-items-center rounded-md border backdrop-blur transition-colors",
                    m.isCover
                      ? "border-gold bg-gold text-navy"
                      : "border-white/40 bg-navy/60 text-white/80 hover:bg-navy",
                  )}
                >
                  <Star className={cn("size-3.5", m.isCover && "fill-current")} />
                </button>
              ) : null}
              <span className="absolute top-2 right-2 rounded-md border border-line bg-admin-surface/90 px-1.5 py-0.5 text-[0.55rem] tracking-[0.12em] text-muted-foreground uppercase backdrop-blur">
                {KINDS[m.kind].label}
              </span>

              <div className="flex items-center gap-1 border-t border-line p-2">
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {m.label ?? "Sans libellé"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(m.id);
                    setEditingLabel(m.label ?? "");
                  }}
                  aria-label="Renommer"
                  className="grid size-7 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-navy"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveMedia.mutate({ id: m.id, direction: -1 })}
                  aria-label="Monter"
                  className="grid size-7 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-navy disabled:opacity-30"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === grouped.length - 1}
                  onClick={() => moveMedia.mutate({ id: m.id, direction: 1 })}
                  aria-label="Descendre"
                  className="grid size-7 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-navy disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeMedia.mutate(m.id)}
                  aria-label="Supprimer"
                  className="grid size-7 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-negative"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              {editingId === m.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMedia.mutate({ id: m.id, patch: { label: editingLabel } });
                    setEditingId(null);
                  }}
                  className="flex gap-2 border-t border-line p-2"
                >
                  <input
                    autoFocus
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    placeholder="Libellé"
                    className="h-9 min-w-0 flex-1 rounded-md border border-line bg-admin-surface px-2 text-sm outline-none focus:border-gold"
                  />
                  <AdminButton className="min-h-9 px-3" type="submit">
                    OK
                  </AdminButton>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-muted-foreground">
          Aucun élément   ajoutez des {KINDS[kind].label.toLowerCase()} ci-dessous.
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-gold bg-gold/5" : "border-line",
        )}
      >
        <Upload className={cn("size-5", dragging ? "text-gold" : "text-muted-foreground")} />
        <p className="text-xs text-muted-foreground">
          Glissez vos fichiers ici, ou{" "}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="font-medium text-navy underline decoration-gold decoration-2 underline-offset-2"
          >
            parcourez
          </button>
        </p>
        <p className="text-[0.65rem] text-muted-foreground/70">
          {kind === "photo"
            ? "JPG, PNG, WebP   recadrées à 1600 px"
            : kind === "video"
              ? "MP4, WebM"
              : "PDF, PNG, JPG"}
        </p>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept={
            kind === "photo" ? "image/*" : kind === "video" ? "video/*" : "application/pdf,image/*"
          }
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- form modal */

type FormState = {
  reference: string;
  title: string;
  status: PropertyStatus;
  transaction: "vente" | "location";
  type: string;
  city: string;
  neighborhood: string;
  price: string;
  surface: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  features: string;
  agentId: string;
};

function PropertyFormModal({
  property,
  agents,
  onClose,
}: {
  property?: AdminProperty | undefined;
  agents?: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    reference: property?.reference ?? "",
    title: property?.title ?? "",
    status: property?.status ?? "draft",
    transaction: property?.transaction ?? "vente",
    type: property?.type ?? "",
    city: property?.city ?? "",
    neighborhood: property?.neighborhood ?? "",
    price: property ? String(property.price) : "",
    surface: property ? String(property.surface) : "",
    bedrooms: property ? String(property.bedrooms) : "",
    bathrooms: property ? String(property.bathrooms) : "",
    description: property?.description ?? "",
    features: property?.features.join(", ") ?? "",
    agentId: property?.agentId ?? agents?.[0]?.id ?? "",
  }));
  const [saving, setSaving] = useState(false);

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Titre requis", "Donnez un nom au bien pour continuer.");
      return;
    }
    const price = Number(form.price);
    const surface = Number(form.surface);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(surface) || surface <= 0) {
      toast.error("Valeurs invalides", "Le prix et la surface doivent être des nombres positifs.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      status: form.status,
      transaction: form.transaction,
      type: form.type.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      price,
      surface,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      description: form.description.trim(),
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      agentId: form.agentId || undefined,
    };
    setSaving(true);
    try {
      if (property) {
        await updateProperty.mutateAsync({ id: property.id, patch: payload });
        toast.success("Bien mis à jour");
      } else {
        await createProperty.mutateAsync({
          reference: form.reference.trim() || undefined,
          ...payload,
        });
        toast.success("Bien créé", "La fiche est prête à recevoir ses médias.");
      }
      onClose();
    } catch (err) {
      toast.error("Enregistrement impossible", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: { type?: string; required?: boolean; full?: boolean; placeholder?: string } = {},
  ) => (
    <label className={cn("flex flex-col gap-1.5", opts.full && "sm:col-span-2")}>
      <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
        {opts.required ? " *" : ""}
      </span>
      <input
        type={opts.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={opts.required}
        placeholder={opts.placeholder}
        className="h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none transition-colors focus:border-gold"
      />
    </label>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={property ? "Modifier le bien" : "Nouveau bien"}
      description={
        property
          ? `${property.reference}   la fiche s'enregistre en direct.`
          : "La fiche reste en brouillon tant que vous ne la publiez pas."
      }
      size="lg"
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Annuler
          </AdminButton>
          <AdminButton onClick={() => void submit()} disabled={saving}>
            {saving ? "Enregistrement…" : property ? "Enregistrer" : "Créer la fiche"}
          </AdminButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Titre", form.title, (v) => set("title", v), {
          required: true,
          full: true,
          placeholder: "Ex. Villa avec piscine à Founty",
        })}
        {field("Référence", form.reference, (v) => set("reference", v), {
          placeholder: "MB-XXXX (auto si vide)",
        })}
        {field("Prix (MAD)", form.price, (v) => set("price", v), {
          type: "number",
          required: true,
        })}
        {field("Surface (m²)", form.surface, (v) => set("surface", v), {
          type: "number",
          required: true,
        })}
        {field("Chambres", form.bedrooms, (v) => set("bedrooms", v), { type: "number" })}
        {field("Salles de bain", form.bathrooms, (v) => set("bathrooms", v), { type: "number" })}
        {field("Type de bien", form.type, (v) => set("type", v), { required: true })}
        {field("Ville", form.city, (v) => set("city", v), { required: true })}
        {field("Quartier", form.neighborhood, (v) => set("neighborhood", v), { required: true })}

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Transaction *
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["vente", "location"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("transaction", t)}
                aria-pressed={form.transaction === t}
                className={cn(
                  "h-11 border text-[0.68rem] tracking-[0.12em] uppercase transition-colors",
                  form.transaction === t
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-line text-muted-foreground hover:border-gold/60",
                )}
              >
                {TRANSACTION_LABELS[t]}
              </button>
            ))}
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Statut
          </span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as PropertyStatus)}
            className="h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          >
            {PROPERTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(PROPERTY_STATUS_LABELS, s)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Agent en charge
          </span>
          <select
            value={form.agentId}
            onChange={(e) => set("agentId", e.target.value)}
            className="h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          >
            {(agents ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Équipements (séparés par des virgules)
          </span>
          <input
            value={form.features}
            onChange={(e) => set("features", e.target.value)}
            placeholder="Piscine, Jardin, Vue mer, Garage…"
            className="h-11 rounded-md border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
            Description
          </span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Atouts du bien, environnement, potentiel…"
            className="rounded-md border border-line bg-admin-bg/40 px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-md border border-line bg-admin-bg/50 px-3.5 py-3 text-xs text-muted-foreground">
        <Building2 className="mt-0.5 size-3.5 shrink-0 text-gold" />
        {form.status === "draft" || form.status === "archived"
          ? "Ce statut masque le bien du site public."
          : form.status === "sold" || form.status === "rented"
            ? "Vendu / loué : le bien quitte les résultats publics mais garde son historique."
            : "Ce statut publie le bien instantanément sur le site public."}
      </p>
    </Modal>
  );
}
