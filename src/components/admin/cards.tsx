import {
  BedDouble,
  Bath,
  Maximize,
  Eye,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Download,
  CalendarDays,
} from "lucide-react";
import {
  APPOINTMENT_LABELS,
  DOCUMENT_LABELS,
  formatBytes,
  formatDate,
  formatMoney,
  formatTime,
  label,
  relativeTime,
  SOURCE_LABELS,
} from "@/lib/admin/format";
import type { AdminProperty, Appointment, Client, Lead, StoredDocument } from "@/lib/admin/types";
import { PropertyStatusBadge, RoleBadge, StageBadge, TemperatureBadge } from "./status-badge";
import { cn } from "@/lib/utils";

// min-w-0 so a card never widens the grid column it sits in: without it a
// card's min-content becomes the column's floor and the page overflows.
const cardBase =
  "group min-w-0 border border-line bg-admin-surface transition-[border-color,box-shadow] duration-400 hover:border-gold/60 hover:shadow-panel";

/* ---------------------------------------------------------- PropertyCard */

export function PropertyCard({
  property,
  onClick,
  index = 0,
  className,
}: {
  property: AdminProperty;
  onClick?: () => void;
  index?: number;
  className?: string;
}) {
  const cover = property.media.find((m) => m.isCover) ?? property.media[0];

  return (
    <article
      onClick={onClick}
      style={{ ["--i" as string]: index }}
      className={cn(cardBase, "stagger-in flex flex-col", onClick && "cursor-pointer", className)}
    >
      <div className="zoom-frame relative aspect-[4/3] overflow-hidden bg-sand">
        {cover ? (
          <img
            src={cover.url}
            alt=""
            loading="lazy"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <PropertyStatusBadge
            status={property.status}
            className="bg-admin-surface/90 backdrop-blur"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
          {property.reference} · {property.neighborhood}
        </p>
        <h3 className="display mt-2 line-clamp-2 text-lg leading-snug">{property.title}</h3>
        <p className="mt-2 text-base font-medium tracking-tight text-blue tabular-nums">
          {formatMoney(property.price, true)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Maximize className="size-3.5 text-gold" /> {property.surface} m²
          </span>
          {property.bedrooms > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-gold" /> {property.bedrooms}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-3.5 text-gold" /> {property.bathrooms}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-line pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Eye className="size-3.5" /> {property.views30d}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Users className="size-3.5" /> {property.leadCount}
          </span>
          <span className="ml-auto">{relativeTime(property.updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ ClientCard */

export function ClientCard({
  client,
  onClick,
  index = 0,
  className,
}: {
  client: Client;
  onClick?: () => void;
  index?: number;
  className?: string;
}) {
  const initials = `${client.firstName[0] ?? ""}${client.lastName[0] ?? ""}`;

  return (
    <article
      onClick={onClick}
      style={{ ["--i" as string]: index }}
      className={cn(cardBase, "stagger-in p-4", onClick && "cursor-pointer", className)}
    >
      <div className="flex items-start gap-3">
        <span className="display grid size-11 shrink-0 place-items-center border border-line bg-sand text-base text-navy">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-navy">
            {client.firstName} {client.lastName}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {label(SOURCE_LABELS, client.source)}
            {client.city ? ` · ${client.city}` : ""}
          </p>
        </div>
        <TemperatureBadge temperature={client.temperature} score={client.score} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {client.roles.map((r) => (
          <RoleBadge key={r} role={r} />
        ))}
      </div>

      <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="size-3.5 shrink-0 text-gold" />
          <dd className="min-w-0 truncate">{client.email}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3.5 shrink-0 text-gold" />
          <dd className="min-w-0 truncate tabular-nums">{client.phone}</dd>
        </div>
        {client.budgetMin ? (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-gold" />
            <dd className="min-w-0 truncate tabular-nums">
              {formatMoney(client.budgetMin, true)} – {formatMoney(client.budgetMax ?? 0, true)}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

/* -------------------------------------------------------------- LeadCard */

export function LeadCard({
  lead,
  client,
  property,
  onClick,
  draggable,
  onDragStart,
  index = 0,
  className,
}: {
  lead: Lead;
  client?: Client | undefined;
  property?: AdminProperty | undefined;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  index?: number;
  className?: string;
}) {
  return (
    <article
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      style={{ ["--i" as string]: index }}
      className={cn(
        cardBase,
        "stagger-in p-3.5",
        onClick && "cursor-pointer",
        draggable && "active:cursor-grabbing",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
          {client ? `${client.firstName} ${client.lastName}` : "Lead"}
        </h3>
        <TemperatureBadge temperature={lead.temperature} />
      </div>

      {property ? (
        <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">{property.title}</p>
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground italic">Sans bien associé</p>
      )}

      <p className="mt-2 text-sm font-medium text-blue tabular-nums">
        {formatMoney(lead.value, true)}
      </p>

      {lead.nextAction ? (
        <p className="mt-2.5 flex items-start gap-1.5 border-t border-line pt-2.5 text-xs text-muted-foreground">
          <Clock className="mt-0.5 size-3 shrink-0 text-gold" />
          <span className="line-clamp-2">{lead.nextAction}</span>
        </p>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------- AppointmentCard */

export function AppointmentCard({
  appointment,
  client,
  property,
  index = 0,
  className,
}: {
  appointment: Appointment;
  client?: Client | undefined;
  property?: AdminProperty | undefined;
  index?: number;
  className?: string;
}) {
  const done = appointment.status === "done";
  const cancelled = appointment.status === "cancelled" || appointment.status === "no_show";

  return (
    <article
      style={{ ["--i" as string]: index }}
      className={cn(
        cardBase,
        "stagger-in flex min-w-0 gap-3 p-4",
        cancelled && "opacity-65",
        className,
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-center border-r border-line pr-3 text-center">
        <span className="text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase">
          {new Date(appointment.startsAt).toLocaleDateString("fr-FR", { month: "short" })}
        </span>
        <span className="display text-2xl tabular-nums">
          {new Date(appointment.startsAt).getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
            {appointment.title}
          </h3>
          <span className="shrink-0 border border-line px-2 py-0.5 text-[0.58rem] tracking-[0.12em] text-muted-foreground uppercase">
            {label(APPOINTMENT_LABELS, appointment.kind)}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <CalendarDays className="size-3.5 text-gold" />
          {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
        </p>

        {client ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {client.firstName} {client.lastName}
          </p>
        ) : null}
        {property ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{property.title}</p>
        ) : null}

        {done && appointment.report ? (
          <div className="mt-2.5 border-t border-line pt-2.5">
            <p className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Intérêt</span>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-1.5",
                      i < appointment.report!.interest ? "bg-gold" : "bg-line",
                    )}
                  />
                ))}
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {appointment.report.outcome}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- DocumentCard */

export function DocumentCard({
  document: doc,
  index = 0,
  className,
}: {
  document: StoredDocument;
  index?: number;
  className?: string;
}) {
  return (
    <article
      style={{ ["--i" as string]: index }}
      className={cn(cardBase, "stagger-in flex items-center gap-3 p-4", className)}
    >
      <span className="grid size-10 shrink-0 place-items-center border border-line bg-sand text-gold">
        <FileText className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-navy capitalize">{doc.name}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{label(DOCUMENT_LABELS, doc.category)}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{formatBytes(doc.sizeBytes)}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">v{doc.version}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(doc.createdAt)}</span>
        </p>
      </div>
      <button
        type="button"
        aria-label={`Télécharger ${doc.name}`}
        className="grid size-9 shrink-0 place-items-center border border-line text-navy transition-colors hover:border-gold"
      >
        <Download className="size-4" />
      </button>
    </article>
  );
}
