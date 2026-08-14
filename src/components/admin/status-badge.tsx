import {
  label,
  PROPERTY_STATUS_LABELS,
  STAGE_LABELS,
  TEMPERATURE_LABELS,
  PRIORITY_LABELS,
  ROLE_LABELS,
} from "@/lib/admin/format";
import type {
  LeadTemperature,
  PipelineStage,
  PropertyStatus,
  TaskPriority,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * Every status colour comes from a token; the dot carries the hue so the text
 * stays readable at small sizes and the badge works on any surface.
 */
const STATUS_DOT: Record<PropertyStatus, string> = {
  draft: "bg-status-draft",
  available: "bg-status-available",
  reserved: "bg-status-reserved",
  under_offer: "bg-status-offer",
  sold: "bg-status-sold",
  rented: "bg-status-rented",
  archived: "bg-status-archived",
};

const TEMP_STYLES: Record<LeadTemperature, string> = {
  cold: "border-temp-cold/40 text-temp-cold",
  warm: "border-temp-warm/50 text-temp-warm",
  hot: "border-temp-hot/40 text-temp-hot",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "border-line text-muted-foreground",
  normal: "border-line text-navy/75",
  high: "border-status-offer/40 text-status-offer",
  urgent: "border-negative/40 text-negative",
};

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] uppercase whitespace-nowrap";

export function PropertyStatusBadge({
  status,
  className,
}: {
  status: PropertyStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, "border-line text-navy/80", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
      {label(PROPERTY_STATUS_LABELS, status)}
    </span>
  );
}

export function TemperatureBadge({
  temperature,
  score,
  className,
}: {
  temperature: LeadTemperature;
  score?: number;
  className?: string;
}) {
  return (
    <span className={cn(base, TEMP_STYLES[temperature], className)}>
      {label(TEMPERATURE_LABELS, temperature)}
      {score !== undefined ? <span className="tabular-nums opacity-70">{score}</span> : null}
    </span>
  );
}

export function StageBadge({ stage, className }: { stage: PipelineStage; className?: string }) {
  const tone =
    stage === "won"
      ? "border-positive/40 text-positive"
      : stage === "lost"
        ? "border-negative/35 text-negative"
        : "border-line text-navy/75";
  return <span className={cn(base, tone, className)}>{label(STAGE_LABELS, stage)}</span>;
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span className={cn(base, PRIORITY_STYLES[priority], className)}>
      {label(PRIORITY_LABELS, priority)}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span className={cn(base, "border-line text-muted-foreground", className)}>
      {label(ROLE_LABELS, role)}
    </span>
  );
}
