/**
 * Admin domain model.
 *
 * These types are the contract between the repository (seed today, Supabase
 * later) and every screen. The SQL in supabase/migrations mirrors them exactly,
 * so the swap is a repository change and nothing else.
 */

export type ID = string;

/* ---------------------------------------------------------------- properties */

export const PROPERTY_STATUSES = [
  "draft",
  "available",
  "reserved",
  "under_offer",
  "sold",
  "rented",
  "archived",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

/** Statuses that still belong in public search results. */
export const ACTIVE_PROPERTY_STATUSES: PropertyStatus[] = ["available", "reserved", "under_offer"];

export type MediaKind = "photo" | "floor_plan" | "video";

export type PropertyMedia = {
  id: ID;
  propertyId: ID;
  kind: MediaKind;
  url: string;
  label?: string | undefined;
  /** Manual sort order within its kind; the cover is position 0 of `photo`. */
  position: number;
  isCover: boolean;
};

export type AdminProperty = {
  id: ID;
  reference: string;
  slug: string;
  title: string;
  status: PropertyStatus;
  transaction: "vente" | "location";
  type: string;
  city: string;
  neighborhood: string;
  price: number;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  features: string[];
  media: PropertyMedia[];
  agentId: ID;
  ownerClientId?: ID | undefined;
  /** Set when the property left the market; history is kept, not deleted. */
  soldAt?: string | undefined;
  views30d: number;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------- people */

export type ClientRole = "buyer" | "seller" | "tenant" | "landlord" | "investor";
export type LeadTemperature = "cold" | "warm" | "hot";

export const LEAD_SOURCES = [
  "site_web",
  "recommandation",
  "portail",
  "reseaux_sociaux",
  "telephone",
  "walk_in",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type Client = {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: ClientRole[];
  temperature: LeadTemperature;
  /** 0-100, drives the temperature badge. */
  score: number;
  source: LeadSource;
  city?: string | undefined;
  budgetMin?: number | undefined;
  budgetMax?: number | undefined;
  notes?: string | undefined;
  agentId: ID;
  createdAt: string;
  lastContactedAt?: string | undefined;
};

export type Agent = {
  id: ID;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string | undefined;
};

/* -------------------------------------------------------------- staff roles */

export type StaffRole = "directrice" | "commercial" | "assistant";

export type RoleInfo = {
  label: string;
  tagline: string;
  capabilities: string[];
};

export const STAFF_ROLES: Record<StaffRole, RoleInfo> = {
  directrice: {
    label: "Directrice",
    tagline: "Direction & administration",
    capabilities: [
      "Accès complet à tous les espaces",
      "Gestion du portefeuille, des ventes et du budget",
      "Rapports, automatisations et marketing",
      "Seule autorisée à supprimer des données",
    ],
  },
  commercial: {
    label: "Commercial",
    tagline: "Ventes & relation client",
    capabilities: [
      "Voir et éditer les biens",
      "Gérer ses propres clients, leads et visites",
      "Matching et envoi de sélections",
      "Lecture de ses transactions et documents",
    ],
  },
  assistant: {
    label: "Assistant direction",
    tagline: "Support opérationnel",
    capabilities: [
      "Agenda et visites de l'agence",
      "Documents et tâches",
      "Clients : création et mise à jour",
      "Lecture seule des biens et transactions",
    ],
  },
};

/** Which seeded agent plays which staff role in the demo workspace. */
export const AGENT_STAFF_ROLE: Record<string, StaffRole> = {
  "yassine-el-amrani": "directrice",
  "salma-bouhaddou": "commercial",
  "nadia-lahlou": "commercial",
  "karim-ouhssaine": "assistant",
};

/* ------------------------------------------------------------------- leads */

export const PIPELINE_STAGES = [
  "new",
  "contacted",
  "qualified",
  "viewing",
  "offer",
  "negotiation",
  "won",
  "lost",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type Lead = {
  id: ID;
  clientId: ID;
  propertyId?: ID | undefined;
  stage: PipelineStage;
  temperature: LeadTemperature;
  score: number;
  source: LeadSource;
  value: number;
  agentId: ID;
  createdAt: string;
  updatedAt: string;
  nextAction?: string | undefined;
  nextActionAt?: string | undefined;
};

/* --------------------------------------------------------------- activities */

export type ActivityKind =
  "note" | "call" | "email" | "whatsapp" | "viewing" | "offer" | "stage_change" | "document";

export type Activity = {
  id: ID;
  kind: ActivityKind;
  subject: string;
  body?: string | undefined;
  clientId?: ID | undefined;
  propertyId?: ID | undefined;
  leadId?: ID | undefined;
  agentId: ID;
  createdAt: string;
};

/* -------------------------------------------------------------- appointments */

export type AppointmentKind = "viewing" | "valuation" | "signature" | "call" | "meeting";
export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "cancelled" | "no_show";

export type Appointment = {
  id: ID;
  kind: AppointmentKind;
  status: AppointmentStatus;
  title: string;
  startsAt: string;
  endsAt: string;
  propertyId?: ID | undefined;
  clientId?: ID | undefined;
  agentId: ID;
  location?: string | undefined;
  /** Filled in after a viewing: interest 0-5, outcome, next action. */
  report?:
    | {
        interest: number;
        outcome: string;
        nextAction?: string | undefined;
      }
    | undefined;
};

/* ---------------------------------------------------------------- documents */

export type DocumentCategory =
  "mandat" | "titre_foncier" | "compromis" | "contrat" | "facture" | "diagnostic" | "autre";

export type StoredDocument = {
  id: ID;
  name: string;
  category: DocumentCategory;
  mimeType: string;
  sizeBytes: number;
  version: number;
  url: string;
  propertyId?: ID | undefined;
  clientId?: ID | undefined;
  transactionId?: ID | undefined;
  uploadedById: ID;
  createdAt: string;
};

/* -------------------------------------------------------------------- tasks */

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskStatus = "todo" | "doing" | "done";

export type AdminTask = {
  id: ID;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | undefined;
  assigneeId: ID;
  /** Any entity this task hangs off. */
  entity?: { kind: "property" | "client" | "lead" | "appointment"; id: ID } | undefined;
  createdAt: string;
};

/* ------------------------------------------------------------- transactions */

export const TRANSACTION_STAGES = [
  "interest",
  "visit",
  "offer",
  "negotiation",
  "agreement",
  "contract",
  "payment",
  "closing",
] as const;
export type TransactionStage = (typeof TRANSACTION_STAGES)[number];

export type Payment = {
  id: ID;
  label: string;
  amount: number;
  dueAt: string;
  paidAt?: string | undefined;
};

export type Transaction = {
  id: ID;
  reference: string;
  stage: TransactionStage;
  propertyId: ID;
  buyerClientId: ID;
  sellerClientId?: ID | undefined;
  agentId: ID;
  amount: number;
  commission: number;
  payments: Payment[];
  openedAt: string;
  closedAt?: string | undefined;
};

/* ------------------------------------------------------------ notifications */

export type NotificationKind = "lead" | "appointment" | "task" | "transaction" | "system";

export type AppNotification = {
  id: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string | undefined;
};

/* --------------------------------------------------------------- dashboard */

export type KpiPoint = { label: string; value: number };

export type DashboardSummary = {
  kpis: {
    activelistings: number;
    newLeads30d: number;
    viewings30d: number;
    pipelineValue: number;
    revenueYtd: number;
    conversionRate: number;
    /** Percentage change vs the previous period, for the delta chip. */
    deltas: Record<string, number>;
  };
  leadsSeries: { month: string; leads: number; viewings: number }[];
  viewsSeries: { month: string; views: number }[];
  pipelineByStage: KpiPoint[];
  revenueSeries: { month: string; revenue: number }[];
  sourceBreakdown: KpiPoint[];
};

/** A single actionable item in "Today's Priorities". */
export type Priority = {
  id: ID;
  kind: "task" | "appointment" | "lead";
  title: string;
  detail: string;
  urgency: "overdue" | "today" | "soon";
  href: string;
};

/* --------------------------------------------------------------- marketing */

export type CampaignChannel = "email" | "whatsapp" | "portail" | "reseaux_sociaux";
export type CampaignStatus = "draft" | "scheduled" | "sent";

export type MarketingCampaign = {
  id: ID;
  name: string;
  subject: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  /** Segment description, e.g. "Acheteurs Marina — budget > 2 M MAD". */
  audience: string;
  audienceCount: number;
  sentAt?: string | undefined;
  opens: number;
  clicks: number;
  conversions: number;
  createdAt: string;
};

/** A property pushed on the public homepage ("À la une"). */
export type FeaturedProperty = {
  propertyId: ID;
  since: string;
  until: string;
};

export type SourceStat = {
  source: LeadSource;
  leads: number;
  conversions: number;
  rate: number;
};

export type MarketingStats = {
  campaigns: MarketingCampaign[];
  featured: FeaturedProperty[];
  sources: SourceStat[];
  totals: {
    sent: number;
    opens: number;
    clicks: number;
    conversions: number;
    featuredCount: number;
  };
};

/* ---------------------------------------------------------------- matching */

export type PropertyMatch = {
  propertyId: ID;
  /** 0-100 compatibility score. */
  score: number;
  reasons: string[];
};

export type ClientMatch = {
  clientId: ID;
  score: number;
  reasons: string[];
};

/* -------------------------------------------------------------- automations */

export type AutomationRuleKey =
  "leadFirstContact" | "visitConfirmTask" | "soldClosesTransaction" | "inactiveLeadRelance";

export type AutomationRule = {
  key: AutomationRuleKey;
  title: string;
  description: string;
  enabled: boolean;
  runs: number;
  lastRun?: string | undefined;
};

export type AutomationRun = {
  id: ID;
  rule: AutomationRuleKey;
  title: string;
  detail: string;
  at: string;
};

export type AutomationOverview = {
  rules: AutomationRule[];
  runs: AutomationRun[];
};

/** A lead with no recorded activity for several days, needing a callback. */
export type InactiveLead = {
  lead: Lead;
  client: Client;
  daysInactive: number;
};

/* ----------------------------------------------------------------- reports */

export type ReportKey = "properties" | "crm" | "agents" | "activity";

export type Report = {
  key: ReportKey;
  title: string;
  from: string;
  to: string;
  kpis: KpiPoint[];
  series: { label: string; points: KpiPoint[] }[];
  table: { columns: string[]; rows: string[][] };
};
