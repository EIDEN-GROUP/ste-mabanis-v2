/**
 * Repository layer — the ONLY module that knows where admin data lives.
 *
 * Today it reads the in-memory seed. To move to Supabase, implement
 * `AdminRepository` against the client and swap `repository` below; no screen,
 * server function or query hook changes.
 *
 * Writes are deliberate: every mutation logs an activity and most raise a
 * notification, so the CRM timeline and the header bell stay truthful without
 * screens having to remember to do it.
 */

import {
  seedActivities,
  seedAgents,
  seedAppointments,
  seedCampaigns,
  seedClients,
  seedDocuments,
  seedFeatured,
  seedLeads,
  seedNotifications,
  seedProperties,
  seedTasks,
  seedTransactions,
  SEED_NOW,
} from "./seed";
import {
  ACTIVE_PROPERTY_STATUSES,
  LEAD_SOURCES,
  type Activity,
  type ActivityKind,
  type AdminProperty,
  type AdminTask,
  type Agent,
  type Appointment,
  type AppointmentKind,
  type AppointmentStatus,
  type AppNotification,
  type AutomationOverview,
  type AutomationRule,
  type AutomationRuleKey,
  type AutomationRun,
  type Client,
  type ClientMatch,
  type ClientRole,
  type DashboardSummary,
  type DocumentCategory,
  type FeaturedProperty,
  type ID,
  type InactiveLead,
  type Lead,
  type LeadSource,
  type MarketingCampaign,
  type MarketingStats,
  type MediaKind,
  type NotificationKind,
  type Payment,
  type PipelineStage,
  type Priority,
  type PropertyMatch,
  type PropertyMedia,
  type PropertyStatus,
  type Report,
  type ReportKey,
  type SourceStat,
  type StoredDocument,
  type TaskPriority,
  type TaskStatus,
  type Transaction,
  type TransactionStage,
} from "./types";

/* ------------------------------------------------------------------ inputs */

/**
 * A partial write where absent and `undefined` are the same thing. With
 * `exactOptionalPropertyTypes` on, `Partial<T>` rejects explicit `undefined`;
 * server validators and forms both produce `undefined` fields, so every
 * update path uses this shape and merges per key.
 */
export type Patch<T> = { [K in keyof T]?: T[K] | undefined };

export type PropertyQuery = {
  search?: string | undefined;
  status?: PropertyStatus[] | undefined;
  transaction?: "vente" | "location" | undefined;
  agentId?: ID | undefined;
  city?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: "recent" | "price_asc" | "price_desc" | "views" | undefined;
};

export type ClientQuery = {
  search?: string | undefined;
  roles?: string[] | undefined;
  temperature?: string[] | undefined;
  agentId?: ID | undefined;
};

export type PropertyInput = {
  reference?: string | undefined;
  title: string;
  status?: PropertyStatus | undefined;
  transaction: "vente" | "location";
  type: string;
  city: string;
  neighborhood: string;
  price: number;
  surface: number;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  description?: string | undefined;
  features?: string[] | undefined;
  agentId?: ID | undefined;
};

export type MediaInput = {
  kind?: MediaKind | undefined;
  url: string;
  label?: string | undefined;
  isCover?: boolean | undefined;
};

export type ClientInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | undefined;
  roles?: ClientRole[] | undefined;
  temperature?: "cold" | "warm" | "hot" | undefined;
  score?: number | undefined;
  source?: LeadSource | undefined;
  city?: string | undefined;
  budgetMin?: number | undefined;
  budgetMax?: number | undefined;
  notes?: string | undefined;
  agentId?: ID | undefined;
};

export type ActivityInput = {
  kind: ActivityKind;
  subject: string;
  body?: string | undefined;
  clientId?: ID | undefined;
  propertyId?: ID | undefined;
  leadId?: ID | undefined;
  agentId?: ID | undefined;
};

export type LeadInput = {
  clientId: ID;
  propertyId?: ID | undefined;
  stage?: PipelineStage | undefined;
  temperature?: "cold" | "warm" | "hot" | undefined;
  score?: number | undefined;
  source?: LeadSource | undefined;
  value?: number | undefined;
  agentId?: ID | undefined;
  nextAction?: string | undefined;
  nextActionAt?: string | undefined;
};

/** The public site posts this shape from every LeadForm on the website. */
export type PublicLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | undefined;
  message?: string | undefined;
  propertyId?: ID | undefined;
  agentId?: ID | undefined;
  intent?: string | undefined;
};

export type AppointmentInput = {
  kind: AppointmentKind;
  title: string;
  startsAt: string;
  endsAt: string;
  propertyId?: ID | undefined;
  clientId?: ID | undefined;
  agentId?: ID | undefined;
  location?: string | undefined;
  status?: AppointmentStatus | undefined;
};

export type DocumentInput = {
  name: string;
  category: DocumentCategory;
  mimeType: string;
  sizeBytes: number;
  url: string;
  propertyId?: ID | undefined;
  clientId?: ID | undefined;
  transactionId?: ID | undefined;
  uploadedById?: ID | undefined;
};

export type TaskInput = {
  title: string;
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  dueAt?: string | undefined;
  assigneeId?: ID | undefined;
  entity?: { kind: "property" | "client" | "lead" | "appointment"; id: ID } | undefined;
};

export type TransactionInput = {
  propertyId: ID;
  buyerClientId: ID;
  sellerClientId?: ID | undefined;
  agentId?: ID | undefined;
  amount: number;
  commission?: number | undefined;
  stage?: TransactionStage | undefined;
};

export type PaymentInput = {
  label: string;
  amount: number;
  dueAt: string;
};

export type NotificationInput = {
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | undefined;
};

export type CampaignInput = {
  name: string;
  subject: string;
  channel: MarketingCampaign["channel"];
  audience: string;
  audienceCount: number;
};

export type ReportQuery = {
  from?: string | undefined;
  to?: string | undefined;
};

/* ------------------------------------------------------------- repository */

export interface AdminRepository {
  listProperties(q?: PropertyQuery): Promise<AdminProperty[]>;
  getProperty(id: ID): Promise<AdminProperty | null>;
  createProperty(input: PropertyInput): Promise<AdminProperty>;
  updateProperty(id: ID, patch: Patch<PropertyInput>): Promise<AdminProperty | null>;
  updatePropertyStatus(id: ID, status: PropertyStatus): Promise<AdminProperty | null>;
  addMedia(propertyId: ID, items: MediaInput[]): Promise<AdminProperty | null>;
  updateMedia(
    id: ID,
    patch: Patch<{ label: string; isCover: boolean }>,
  ): Promise<AdminProperty | null>;
  moveMedia(id: ID, direction: -1 | 1): Promise<AdminProperty | null>;
  removeMedia(id: ID): Promise<AdminProperty | null>;

  listClients(q?: ClientQuery): Promise<Client[]>;
  getClient(id: ID): Promise<Client | null>;
  createClient(input: ClientInput): Promise<Client>;
  updateClient(id: ID, patch: Patch<ClientInput>): Promise<Client | null>;

  listLeads(): Promise<Lead[]>;
  getLead(id: ID): Promise<Lead | null>;
  createLead(input: LeadInput): Promise<Lead>;
  createPublicLead(input: PublicLeadInput): Promise<Lead>;
  updateLead(id: ID, patch: Patch<LeadInput>): Promise<Lead | null>;
  moveLead(id: ID, stage: PipelineStage): Promise<Lead | null>;

  listActivities(filter?: {
    clientId?: ID | undefined;
    leadId?: ID | undefined;
    propertyId?: ID | undefined;
  }): Promise<Activity[]>;
  addActivity(input: ActivityInput): Promise<Activity>;

  listAppointments(range?: { from: string; to: string }): Promise<Appointment[]>;
  createAppointment(input: AppointmentInput): Promise<Appointment>;
  updateAppointment(id: ID, patch: Patch<AppointmentInput>): Promise<Appointment | null>;
  setAppointmentStatus(id: ID, status: AppointmentStatus): Promise<Appointment | null>;
  saveViewingReport(
    id: ID,
    report: { interest: number; outcome: string; nextAction?: string | undefined },
  ): Promise<Appointment | null>;

  listDocuments(): Promise<StoredDocument[]>;
  createDocument(input: DocumentInput): Promise<StoredDocument>;
  deleteDocument(id: ID): Promise<void>;

  listTasks(): Promise<AdminTask[]>;
  createTask(input: TaskInput): Promise<AdminTask>;
  updateTask(id: ID, patch: Patch<TaskInput>): Promise<AdminTask | null>;

  listTransactions(): Promise<Transaction[]>;
  createTransaction(input: TransactionInput): Promise<Transaction>;
  moveTransactionStage(id: ID, stage: TransactionStage): Promise<Transaction | null>;
  addPayment(transactionId: ID, input: PaymentInput): Promise<Transaction | null>;
  markPaymentPaid(transactionId: ID, paymentId: ID): Promise<Transaction | null>;

  listAgents(): Promise<Agent[]>;

  listNotifications(): Promise<AppNotification[]>;
  createNotification(input: NotificationInput): Promise<AppNotification>;
  markNotificationRead(id: ID): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  getDashboard(): Promise<DashboardSummary>;
  getPriorities(agentId?: string): Promise<Priority[]>;

  /* ------------------------------------------------------------- marketing */

  listCampaigns(): Promise<MarketingCampaign[]>;
  createCampaign(input: CampaignInput): Promise<MarketingCampaign>;
  sendCampaign(id: ID): Promise<MarketingCampaign | null>;
  deleteCampaign(id: ID): Promise<void>;
  setFeatured(propertyId: ID, until: string): Promise<FeaturedProperty[]>;
  removeFeatured(propertyId: ID): Promise<FeaturedProperty[]>;
  getMarketingStats(): Promise<MarketingStats>;

  /* --------------------------------------------------------------- matching */

  matchForClient(clientId: ID): Promise<PropertyMatch[]>;
  matchForProperty(propertyId: ID): Promise<ClientMatch[]>;
  sendMatchesToClient(clientId: ID, propertyIds: ID[]): Promise<number>;

  /* ------------------------------------------------------------- automations */

  getAutomations(): Promise<AutomationOverview>;
  setAutomation(key: AutomationRuleKey, enabled: boolean): Promise<AutomationRule[]>;
  listInactiveLeads(): Promise<InactiveLead[]>;
  createCallbackTask(leadId: ID): Promise<AdminTask | null>;

  /* ---------------------------------------------------------------- reports */

  getReport(key: ReportKey, q?: ReportQuery): Promise<Report>;
}

/* ------------------------------------------------------------------ helpers */

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const MONTHS = ["Mars", "Avril", "Mai", "Juin", "Juillet", "Août"];

let counter = 0;
function newId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}

function slugify(text: string) {
  return (
    norm(text)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "bien"
  );
}

function nextReference() {
  const n = 1100 + seedProperties.length + properties.length + Math.floor(Math.random() * 90);
  return `MB-${n}`;
}

function temperatureFor(score: number): "cold" | "warm" | "hot" {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

/* ------------------------------------------------------------------ matching */

/** Scores an active property against a client's profile (0-100, or null). */
function propertyScore(property: AdminProperty, client: Client): PropertyMatch | null {
  if (!ACTIVE_PROPERTY_STATUSES.includes(property.status)) return null;
  const activeRoles = client.roles.filter((r) => r !== "seller" && r !== "landlord");
  if (activeRoles.length === 0) return null;

  const wantsRent = client.roles.includes("tenant");
  const wantsBuy = client.roles.includes("buyer") || client.roles.includes("investor");
  const isRent = property.transaction === "location";
  const isSale = property.transaction === "vente";

  let score = 0;
  const reasons: string[] = [];

  if ((wantsRent && isRent) || (wantsBuy && isSale)) {
    score += 20;
    reasons.push(isRent ? "Recherche une location" : "Recherche un achat");
  } else if ((wantsBuy && isRent) || (wantsRent && isSale)) {
    score += 5;
  } else {
    return null;
  }

  if (client.city) {
    if (norm(client.city) === norm(property.city)) {
      score += 25;
      reasons.push(`Secteur ${property.city}`);
    } else {
      score += 5;
      reasons.push(`Ville ${property.city}`);
    }
  } else {
    score += 10;
    reasons.push("Sans préférence de ville");
  }

  if (client.budgetMin !== undefined && client.budgetMax !== undefined) {
    if (property.price >= client.budgetMin && property.price <= client.budgetMax) {
      score += 30;
      reasons.push("Budget compatible");
    } else if (property.price <= client.budgetMax * 1.1) {
      score += 12;
      reasons.push("Légèrement au-dessus du budget");
    } else {
      score -= 20;
    }
  }

  if (
    property.features.some((f) => norm(f).includes("piscine")) &&
    norm(client.notes ?? "").includes("piscine")
  ) {
    score += 10;
    reasons.push("Piscine");
  }
  if (
    property.features.some((f) => norm(f).includes("vue mer")) &&
    norm(client.notes ?? "").includes("mer")
  ) {
    score += 10;
    reasons.push("Vue mer");
  }

  return score <= 0 ? null : { propertyId: property.id, score: Math.min(score, 100), reasons };
}

function clientScore(client: Client, property: AdminProperty): ClientMatch | null {
  const match = propertyScore(property, client);
  if (!match) return null;
  return { clientId: client.id, score: match.score, reasons: match.reasons };
}

/* ------------------------------------------------------------------ reports */

function weekBuckets(fromIso: string, toIso: string) {
  const buckets: { from: number; to: number; label: string }[] = [];
  const start = new Date(fromIso).getTime();
  const end = new Date(toIso).getTime();
  const week = 7 * 86_400_000;
  for (let t = start; t < end; t += week) {
    const s = new Date(t);
    buckets.push({
      from: t,
      to: Math.min(t + week, end),
      label: s.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    });
  }
  if (buckets.length === 0) buckets.push({ from: start, to: end, label: "Période" });
  return buckets;
}

function bucketOf(buckets: { from: number; to: number }[], iso: string) {
  const t = new Date(iso).getTime();
  const idx = buckets.findIndex((b) => t >= b.from && t < b.to);
  return idx < 0 ? buckets.length - 1 : idx;
}

/* ------------------------------------------------------- in-memory instance */

/**
 * Mutable copies so writes performed during a session are visible on re-read.
 * A real backend makes this obsolete.
 */
const properties = [...seedProperties];
const leads = [...seedLeads];
const clients = [...seedClients];
const activities = [...seedActivities];
const appointments = [...seedAppointments];
const documents = [...seedDocuments];
const tasks = [...seedTasks];
const transactions = [...seedTransactions];
const notifications = [...seedNotifications];
const campaigns = [...seedCampaigns];
const featured = [...seedFeatured];

/* ---------------------------------------------------------------- automations */

const AUTOMATION_META: Record<AutomationRuleKey, { title: string; description: string }> = {
  leadFirstContact: {
    title: "Nouveau lead → contact sous 24 h",
    description:
      "Tâche de premier contact, affectation à l'agent et notification à la création d'un lead.",
  },
  visitConfirmTask: {
    title: "Visite planifiée → confirmation",
    description:
      "Tâche de confirmation à la planification, tâche de débrief quand la visite est terminée.",
  },
  soldClosesTransaction: {
    title: "Bien vendu → transaction clôturée",
    description: "Passe la transaction associée à l'étape clôture quand un bien quitte le marché.",
  },
  inactiveLeadRelance: {
    title: "Lead inactif 3 jours → relance",
    description:
      "Détecte les leads sans activité depuis 3 jours et crée la tâche de rappel de l'agent.",
  },
};

const automationFlags: Record<AutomationRuleKey, boolean> = {
  leadFirstContact: true,
  visitConfirmTask: true,
  soldClosesTransaction: true,
  inactiveLeadRelance: true,
};

const automationRuns: AutomationRun[] = [];

function runAutomation(key: AutomationRuleKey, title: string, detail: string) {
  automationRuns.unshift({
    id: newId("auto"),
    rule: key,
    title,
    detail,
    at: new Date().toISOString(),
  });
}

function pushTask(input: TaskInput): AdminTask {
  const task: AdminTask = {
    id: newId("task"),
    title: input.title,
    status: input.status ?? "todo",
    priority: input.priority ?? "normal",
    dueAt: input.dueAt,
    assigneeId: input.assigneeId ?? currentAgentId,
    entity: input.entity,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  return task;
}

const currentAgentId = seedAgents[0]?.id ?? "yassine-el-amrani";

function pushNotification(input: NotificationInput) {
  const n: AppNotification = {
    id: newId("notif"),
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(n);
  return n;
}

function pushActivity(input: ActivityInput): Activity {
  const a: Activity = {
    id: newId("activity"),
    kind: input.kind,
    subject: input.subject,
    body: input.body,
    clientId: input.clientId,
    propertyId: input.propertyId,
    leadId: input.leadId,
    agentId: input.agentId ?? currentAgentId,
    createdAt: new Date().toISOString(),
  };
  activities.unshift(a);
  return a;
}

function sortMedia(list: PropertyMedia[]) {
  return [...list].sort((a, b) => {
    const order: Record<MediaKind, number> = { photo: 0, floor_plan: 1, video: 2 };
    if (order[a.kind] !== order[b.kind]) return order[a.kind] - order[b.kind];
    return a.position - b.position;
  });
}

/**
 * Keeps a property's media consistent after any change: sorted by kind then
 * position, and exactly one photo carries the cover flag (the first photo when
 * none is marked).
 */
function normalizeMedia(property: AdminProperty): AdminProperty {
  const media = sortMedia(property.media);
  let coverAssigned = false;
  const normalized = media.map((m) => {
    if (m.kind !== "photo") return m;
    if (m.isCover && !coverAssigned) {
      coverAssigned = true;
      return m;
    }
    return { ...m, isCover: false };
  });
  const firstPhoto = normalized.find((m) => m.kind === "photo");
  if (firstPhoto && !coverAssigned) {
    const idx = normalized.findIndex((m) => m.id === firstPhoto.id);
    normalized[idx] = { ...normalized[idx]!, isCover: true };
  }
  return { ...property, media: normalized };
}

export const inMemoryRepository: AdminRepository = {
  /* ------------------------------------------------------------ properties */

  async listProperties(q = {}) {
    let list = [...properties];

    if (q.search) {
      const term = norm(q.search);
      list = list.filter((p) =>
        [p.title, p.reference, p.neighborhood, p.city, p.type].some((f) => norm(f).includes(term)),
      );
    }
    if (q.status?.length) list = list.filter((p) => q.status!.includes(p.status));
    if (q.transaction) list = list.filter((p) => p.transaction === q.transaction);
    if (q.agentId) list = list.filter((p) => p.agentId === q.agentId);
    if (q.city) list = list.filter((p) => p.city === q.city);
    if (q.minPrice) list = list.filter((p) => p.price >= q.minPrice!);
    if (q.maxPrice) list = list.filter((p) => p.price <= q.maxPrice!);

    switch (q.sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "views":
        list.sort((a, b) => b.views30d - a.views30d);
        break;
      default:
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  },

  async getProperty(id) {
    return properties.find((p) => p.id === id) ?? null;
  },

  async createProperty(input) {
    const now = new Date().toISOString();
    const id = newId("property");
    const left = input.status === "sold" || input.status === "rented";
    const property: AdminProperty = {
      id,
      reference: input.reference ?? nextReference(),
      slug: `${slugify(input.title)}-${id.slice(-4)}`,
      title: input.title,
      status: input.status ?? "draft",
      transaction: input.transaction,
      type: input.type,
      city: input.city,
      neighborhood: input.neighborhood,
      price: input.price,
      surface: input.surface,
      bedrooms: input.bedrooms ?? 0,
      bathrooms: input.bathrooms ?? 0,
      description: input.description ?? "",
      features: input.features ?? [],
      media: [],
      agentId: input.agentId ?? currentAgentId,
      soldAt: left ? now : undefined,
      views30d: 0,
      leadCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    properties.unshift(property);
    pushActivity({
      kind: "note",
      subject: "Bien créé",
      body: `Fiche ${property.reference} — ${property.title}`,
      propertyId: id,
    });
    return property;
  },

  async updateProperty(id, patch) {
    const i = properties.findIndex((p) => p.id === id);
    const current = properties[i];
    if (!current) return null;
    const next: AdminProperty = {
      ...current,
      reference: patch.reference ?? current.reference,
      title: patch.title ?? current.title,
      status: patch.status ?? current.status,
      transaction: patch.transaction ?? current.transaction,
      type: patch.type ?? current.type,
      city: patch.city ?? current.city,
      neighborhood: patch.neighborhood ?? current.neighborhood,
      price: patch.price ?? current.price,
      surface: patch.surface ?? current.surface,
      bedrooms: patch.bedrooms ?? current.bedrooms,
      bathrooms: patch.bathrooms ?? current.bathrooms,
      description: patch.description ?? current.description,
      features: patch.features ?? current.features,
      agentId: patch.agentId ?? current.agentId,
      updatedAt: new Date().toISOString(),
    };
    properties[i] = next;
    pushActivity({
      kind: "note",
      subject: "Bien mis à jour",
      body: `${next.reference} — ${next.title}`,
      propertyId: id,
    });
    return next;
  },

  async updatePropertyStatus(id, status) {
    const i = properties.findIndex((p) => p.id === id);
    const current = properties[i];
    if (!current) return null;
    const left = status === "sold" || status === "rented";
    const next: AdminProperty = {
      ...current,
      status,
      // Leaving the market records a date; the record itself is never removed,
      // so history and reporting stay intact.
      soldAt: left ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    properties[i] = next;
    pushActivity({
      kind: "stage_change",
      subject: `Statut → ${status}`,
      body: left
        ? "Le bien quitte le marché public, l'historique est conservé."
        : status === "available"
          ? "Le bien est de nouveau visible sur le site public."
          : undefined,
      propertyId: id,
    });
    if (left) {
      pushNotification({
        kind: "transaction",
        title: status === "sold" ? "Bien vendu" : "Bien loué",
        body: `${next.reference} — ${next.title} quitte le marché.`,
        href: "/admin/proprietes",
      });
      // Automation: close any open transaction on this property.
      if (automationFlags.soldClosesTransaction) {
        const txn = transactions.find(
          (t) => t.propertyId === id && !t.closedAt && t.stage !== "closing",
        );
        if (txn) {
          const i2 = transactions.findIndex((t) => t.id === txn.id);
          transactions[i2] = { ...txn, stage: "closing", closedAt: new Date().toISOString() };
          runAutomation(
            "soldClosesTransaction",
            "Transaction clôturée",
            `${txn.reference} — ${next.reference} passe à l'étape clôture.`,
          );
        }
      }
    }
    return next;
  },

  async addMedia(propertyId, items) {
    const i = properties.findIndex((p) => p.id === propertyId);
    const current = properties[i];
    if (!current) return null;
    const existing = [...current.media];
    const counts: Record<MediaKind, number> = { photo: 0, floor_plan: 0, video: 0 };
    for (const m of existing) counts[m.kind] = Math.max(counts[m.kind], m.position + 1);
    const added: PropertyMedia[] = items.map((item, idx) => {
      const kind = item.kind ?? "photo";
      return {
        id: newId("media"),
        propertyId,
        kind,
        url: item.url,
        label: item.label,
        position: counts[kind] + idx,
        isCover: kind === "photo" && item.isCover === true,
      };
    });
    const next = normalizeMedia({ ...current, media: [...existing, ...added] });
    properties[i] = next;
    return next;
  },

  async updateMedia(id, patch) {
    const owner = properties.find((p) => p.media.some((m) => m.id === id));
    if (!owner) return null;
    const i = properties.findIndex((p) => p.id === owner.id);
    const media = owner.media.map((m) =>
      m.id === id
        ? {
            ...m,
            label: patch.label ?? m.label,
            isCover: patch.isCover ?? m.isCover,
          }
        : m,
    );
    properties[i] = normalizeMedia({ ...owner, media });
    return properties[i]!;
  },

  async moveMedia(id, direction) {
    const owner = properties.find((p) => p.media.some((m) => m.id === id));
    if (!owner) return null;
    const i = properties.findIndex((p) => p.id === owner.id);
    const media = [...owner.media];
    const index = media.findIndex((m) => m.id === id);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= media.length) return owner;
    const a = media[index]!;
    const b = media[swapWith]!;
    if (a.kind !== b.kind) return owner;
    media[index] = { ...b, position: a.position };
    media[swapWith] = { ...a, position: b.position };
    properties[i] = normalizeMedia({ ...owner, media });
    return properties[i]!;
  },

  async removeMedia(id) {
    const owner = properties.find((p) => p.media.some((m) => m.id === id));
    if (!owner) return null;
    const i = properties.findIndex((p) => p.id === owner.id);
    properties[i] = normalizeMedia({ ...owner, media: owner.media.filter((m) => m.id !== id) });
    return properties[i]!;
  },

  /* ----------------------------------------------------------------- clients */

  async listClients(q = {}) {
    let list = [...clients];
    if (q.search) {
      const term = norm(q.search);
      list = list.filter((c) =>
        [c.firstName, c.lastName, c.email, c.phone].some((f) => norm(f).includes(term)),
      );
    }
    if (q.roles?.length) list = list.filter((c) => c.roles.some((r) => q.roles!.includes(r)));
    if (q.temperature?.length) list = list.filter((c) => q.temperature!.includes(c.temperature));
    if (q.agentId) list = list.filter((c) => c.agentId === q.agentId);
    return list.sort((a, b) => b.score - a.score);
  },

  async getClient(id) {
    return clients.find((c) => c.id === id) ?? null;
  },

  async createClient(input) {
    const client: Client = {
      id: newId("client"),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? "",
      roles: input.roles ?? ["buyer"],
      temperature: input.temperature ?? "cold",
      score: input.score ?? 20,
      source: input.source ?? "site_web",
      city: input.city,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      notes: input.notes,
      agentId: input.agentId ?? currentAgentId,
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString(),
    };
    clients.unshift(client);
    pushActivity({
      kind: "note",
      subject: "Client créé",
      body: `${client.firstName} ${client.lastName} — ${client.email}`,
      clientId: client.id,
    });
    return client;
  },

  async updateClient(id, patch) {
    const i = clients.findIndex((c) => c.id === id);
    const current = clients[i];
    if (!current) return null;
    const next: Client = {
      ...current,
      firstName: patch.firstName ?? current.firstName,
      lastName: patch.lastName ?? current.lastName,
      email: patch.email ?? current.email,
      phone: patch.phone ?? current.phone,
      roles: patch.roles ?? current.roles,
      temperature: patch.temperature ?? current.temperature,
      score: patch.score ?? current.score,
      source: patch.source ?? current.source,
      city: patch.city ?? current.city,
      budgetMin: patch.budgetMin ?? current.budgetMin,
      budgetMax: patch.budgetMax ?? current.budgetMax,
      notes: patch.notes ?? current.notes,
      agentId: patch.agentId ?? current.agentId,
    };
    clients[i] = next;
    pushActivity({
      kind: "note",
      subject: "Fiche client mise à jour",
      body: `${next.firstName} ${next.lastName}`,
      clientId: id,
    });
    return next;
  },

  /* ------------------------------------------------------------------- leads */

  async listLeads() {
    return [...leads];
  },

  async getLead(id) {
    return leads.find((l) => l.id === id) ?? null;
  },

  async createLead(input) {
    const lead: Lead = {
      id: newId("lead"),
      clientId: input.clientId,
      propertyId: input.propertyId,
      stage: input.stage ?? "new",
      temperature: input.temperature ?? "cold",
      score: input.score ?? 30,
      source: input.source ?? "site_web",
      value: input.value ?? 0,
      agentId: input.agentId ?? currentAgentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextAction: input.nextAction,
      nextActionAt: input.nextActionAt,
    };
    leads.unshift(lead);
    const client = clients.find((c) => c.id === lead.clientId);
    pushActivity({
      kind: "note",
      subject: "Lead créé",
      body: `${client?.firstName ?? "Client"} ${client?.lastName ?? ""} — ${lead.stage}`,
      clientId: lead.clientId,
      propertyId: lead.propertyId,
      leadId: lead.id,
    });
    // Automation: a brand-new lead gets a follow-up task and a notification.
    if (lead.stage === "new" && automationFlags.leadFirstContact) {
      pushTask({
        title: "Premier contact sous 24 h",
        status: "todo",
        priority: "high",
        dueAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
        assigneeId: lead.agentId,
        entity: { kind: "lead", id: lead.id },
      });
      pushNotification({
        kind: "lead",
        title: "Nouveau lead",
        body: `${client?.firstName ?? ""} ${client?.lastName ?? ""} — à contacter sous 24 h.`,
        href: "/admin/crm",
      });
      runAutomation(
        "leadFirstContact",
        "Premier contact planifié",
        `${client?.firstName ?? ""} ${client?.lastName ?? ""} — tâche créée pour ${lead.agentId}.`,
      );
    }
    return lead;
  },

  async createPublicLead(input) {
    const email = input.email.trim().toLowerCase();
    let client = clients.find((c) => c.email.toLowerCase() === email);
    if (!client) {
      client = await this.createClient({
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phone: input.phone ?? "",
        roles: ["buyer"],
        source: "site_web",
        city: undefined,
        agentId: input.agentId,
      });
    } else if (input.phone && !client.phone) {
      const i = clients.findIndex((c) => c.id === client!.id);
      clients[i] = { ...client!, phone: input.phone };
      client = clients[i];
    }
    const property = input.propertyId
      ? properties.find((p) => p.id === input.propertyId)
      : undefined;
    const agent = input.agentId ?? client.agentId ?? currentAgentId;
    const lead = await this.createLead({
      clientId: client.id,
      propertyId: property?.id,
      agentId: agent,
      stage: "new",
      temperature: temperatureFor(35),
      score: 35,
      source: "site_web",
      value: property?.price ?? 0,
      nextAction: "Premier contact téléphonique",
      nextActionAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    });
    pushActivity({
      kind: "note",
      subject: "Demande reçue via le site",
      body: input.message?.trim()
        ? input.message.trim()
        : `Intent : ${input.intent ?? "contact"}${property ? ` — ${property.reference}` : ""}`,
      clientId: client.id,
      propertyId: property?.id,
      leadId: lead.id,
    });
    return lead;
  },

  async updateLead(id, patch) {
    const i = leads.findIndex((l) => l.id === id);
    const current = leads[i];
    if (!current) return null;
    const next: Lead = {
      ...current,
      propertyId: patch.propertyId ?? current.propertyId,
      temperature: patch.temperature ?? current.temperature,
      score: patch.score ?? current.score,
      source: patch.source ?? current.source,
      value: patch.value ?? current.value,
      agentId: patch.agentId ?? current.agentId,
      nextAction: patch.nextAction ?? current.nextAction,
      nextActionAt: patch.nextActionAt ?? current.nextActionAt,
      updatedAt: new Date().toISOString(),
    };
    leads[i] = next;
    const client = clients.find((c) => c.id === next.clientId);
    pushActivity({
      kind: "note",
      subject: "Lead mis à jour",
      body: `${client?.firstName ?? ""} ${client?.lastName ?? ""} — score ${next.score}, ${next.temperature}`,
      clientId: next.clientId,
      propertyId: next.propertyId,
      leadId: id,
    });
    return next;
  },

  async moveLead(id, stage) {
    const i = leads.findIndex((l) => l.id === id);
    const current = leads[i];
    if (!current) return null;
    const next: Lead = { ...current, stage, updatedAt: new Date().toISOString() };
    leads[i] = next;
    const client = clients.find((c) => c.id === next.clientId);
    pushActivity({
      kind: "stage_change",
      subject: `Étape → ${stage}`,
      body: `${client?.firstName ?? ""} ${client?.lastName ?? ""}`,
      clientId: next.clientId,
      propertyId: next.propertyId,
      leadId: id,
    });
    // A won lead is the seed of a transaction; surface it in the inbox.
    if (stage === "won") {
      pushNotification({
        kind: "lead",
        title: "Lead gagné",
        body: `${client?.firstName ?? ""} ${client?.lastName ?? ""} — ouvrir une transaction.`,
        href: "/admin/transactions",
      });
    }
    return next;
  },

  /* ------------------------------------------------------------- activities */

  async listActivities(filter = {}) {
    return activities
      .filter(
        (a) =>
          (!filter.clientId || a.clientId === filter.clientId) &&
          (!filter.leadId || a.leadId === filter.leadId) &&
          (!filter.propertyId || a.propertyId === filter.propertyId),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async addActivity(input) {
    return pushActivity(input);
  },

  /* ---------------------------------------------------------- appointments */

  async listAppointments(range) {
    if (!range) return [...appointments].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return appointments.filter((a) => a.startsAt >= range.from && a.startsAt <= range.to);
  },

  async createAppointment(input) {
    const appointment: Appointment = {
      id: newId("appt"),
      kind: input.kind,
      status: input.status ?? "scheduled",
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      propertyId: input.propertyId,
      clientId: input.clientId,
      agentId: input.agentId ?? currentAgentId,
      location: input.location,
    };
    appointments.push(appointment);
    const client = input.clientId ? clients.find((c) => c.id === input.clientId) : undefined;
    pushActivity({
      kind: "viewing",
      subject: `Rendez-vous planifié — ${appointment.kind}`,
      body: `${appointment.title} à ${new Date(appointment.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      clientId: appointment.clientId,
      propertyId: appointment.propertyId,
    });
    pushNotification({
      kind: "appointment",
      title: "Rendez-vous planifié",
      body: `${client?.firstName ?? ""} ${client?.lastName ?? ""} — ${appointment.title}`,
      href: "/admin/agenda",
    });
    // Automation: a scheduled viewing must be confirmed by the agent.
    if (appointment.kind === "viewing" && automationFlags.visitConfirmTask) {
      pushTask({
        title: "Confirmer la visite",
        status: "todo",
        priority: "high",
        dueAt: new Date(new Date(appointment.startsAt).getTime() - 24 * 3_600_000).toISOString(),
        assigneeId: appointment.agentId,
        entity: { kind: "appointment", id: appointment.id },
      });
      runAutomation(
        "visitConfirmTask",
        "Visite à confirmer",
        `${appointment.title} — ${new Date(appointment.startsAt).toLocaleDateString("fr-FR")} ${new Date(appointment.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`,
      );
    }
    return appointment;
  },

  async updateAppointment(id, patch) {
    const i = appointments.findIndex((a) => a.id === id);
    const current = appointments[i];
    if (!current) return null;
    appointments[i] = {
      ...current,
      kind: patch.kind ?? current.kind,
      title: patch.title ?? current.title,
      startsAt: patch.startsAt ?? current.startsAt,
      endsAt: patch.endsAt ?? current.endsAt,
      propertyId: patch.propertyId ?? current.propertyId,
      clientId: patch.clientId ?? current.clientId,
      agentId: patch.agentId ?? current.agentId,
      location: patch.location ?? current.location,
      status: patch.status ?? current.status,
    };
    return appointments[i]!;
  },

  async setAppointmentStatus(id, status) {
    const i = appointments.findIndex((a) => a.id === id);
    const current = appointments[i];
    if (!current) return null;
    appointments[i] = { ...current, status };
    pushActivity({
      kind: "viewing",
      subject: `Rendez-vous → ${status}`,
      body: `${current.title}`,
      clientId: current.clientId,
      propertyId: current.propertyId,
    });
    // Automation: a finished viewing gets a debrief task.
    if (status === "done" && automationFlags.visitConfirmTask) {
      pushTask({
        title: "Débrief de la visite",
        status: "todo",
        priority: "normal",
        dueAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
        assigneeId: current.agentId,
        entity: { kind: "appointment", id: current.id },
      });
      runAutomation(
        "visitConfirmTask",
        "Débrief demandé",
        `${current.title} — terminé, compte-rendu à rédiger.`,
      );
    }
    return appointments[i]!;
  },

  async saveViewingReport(id, report) {
    const i = appointments.findIndex((a) => a.id === id);
    const current = appointments[i];
    if (!current) return null;
    const next: Appointment = { ...current, report, status: "done" };
    appointments[i] = next;
    pushActivity({
      kind: "viewing",
      subject: "Compte-rendu de visite",
      body: `Intérêt ${report.interest}/5 — ${report.outcome}`,
      clientId: current.clientId,
      propertyId: current.propertyId,
    });
    return next;
  },

  /* --------------------------------------------------------------- documents */

  async listDocuments() {
    return [...documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createDocument(input) {
    const doc: StoredDocument = {
      id: newId("doc"),
      name: input.name,
      category: input.category,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      version: 1,
      url: input.url,
      propertyId: input.propertyId,
      clientId: input.clientId,
      transactionId: input.transactionId,
      uploadedById: input.uploadedById ?? currentAgentId,
      createdAt: new Date().toISOString(),
    };
    documents.unshift(doc);
    pushActivity({
      kind: "document",
      subject: "Document ajouté",
      body: doc.name,
      clientId: doc.clientId,
      propertyId: doc.propertyId,
    });
    return doc;
  },

  async deleteDocument(id) {
    const i = documents.findIndex((d) => d.id === id);
    if (i >= 0) documents.splice(i, 1);
  },

  /* ------------------------------------------------------------------- tasks */

  async listTasks() {
    return [...tasks].sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (b.status === "done" && a.status !== "done") return -1;
      return (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999");
    });
  },

  async createTask(input) {
    const task: AdminTask = {
      id: newId("task"),
      title: input.title,
      status: input.status ?? "todo",
      priority: input.priority ?? "normal",
      dueAt: input.dueAt,
      assigneeId: input.assigneeId ?? currentAgentId,
      entity: input.entity,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    pushActivity({ kind: "note", subject: "Tâche créée", body: task.title });
    return task;
  },

  async updateTask(id, patch) {
    const i = tasks.findIndex((t) => t.id === id);
    const current = tasks[i];
    if (!current) return null;
    tasks[i] = {
      ...current,
      title: patch.title ?? current.title,
      status: patch.status ?? current.status,
      priority: patch.priority ?? current.priority,
      dueAt: patch.dueAt ?? current.dueAt,
      assigneeId: patch.assigneeId ?? current.assigneeId,
    };
    return tasks[i]!;
  },

  /* ----------------------------------------------------------- transactions */

  async listTransactions() {
    return [...transactions];
  },

  async createTransaction(input) {
    const txn: Transaction = {
      id: newId("txn"),
      reference: `TX-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, "0")}`,
      stage: input.stage ?? "interest",
      propertyId: input.propertyId,
      buyerClientId: input.buyerClientId,
      sellerClientId: input.sellerClientId,
      agentId: input.agentId ?? currentAgentId,
      amount: input.amount,
      commission: input.commission ?? Math.round(input.amount * 0.025),
      payments: [],
      openedAt: new Date().toISOString(),
    };
    transactions.unshift(txn);
    const property = properties.find((p) => p.id === txn.propertyId);
    pushActivity({
      kind: "offer",
      subject: "Transaction ouverte",
      body: `${txn.reference} — ${property?.reference ?? ""}`,
      clientId: txn.buyerClientId,
      propertyId: txn.propertyId,
    });
    pushNotification({
      kind: "transaction",
      title: "Transaction ouverte",
      body: `${txn.reference} — ${property?.title ?? ""}`,
      href: "/admin/transactions",
    });
    return txn;
  },

  async moveTransactionStage(id, stage) {
    const i = transactions.findIndex((t) => t.id === id);
    const current = transactions[i];
    if (!current) return null;
    const next: Transaction = {
      ...current,
      stage,
      closedAt: stage === "closing" ? (current.closedAt ?? new Date().toISOString()) : undefined,
    };
    transactions[i] = next;
    pushActivity({
      kind: "offer",
      subject: `Transaction → ${stage}`,
      body: current.reference,
      clientId: current.buyerClientId,
      propertyId: current.propertyId,
    });
    if (stage === "closing") {
      pushNotification({
        kind: "transaction",
        title: "Transaction clôturée",
        body: `${current.reference} — bravo, dossier bouclé.`,
        href: "/admin/transactions",
      });
    }
    return next;
  },

  async addPayment(transactionId, input) {
    const i = transactions.findIndex((t) => t.id === transactionId);
    const current = transactions[i];
    if (!current) return null;
    const payment: Payment = {
      id: newId("pay"),
      label: input.label,
      amount: input.amount,
      dueAt: input.dueAt,
    };
    const next: Transaction = { ...current, payments: [...current.payments, payment] };
    transactions[i] = next;
    pushActivity({
      kind: "note",
      subject: "Paiement planifié",
      body: `${payment.label} — ${payment.amount} MAD`,
      clientId: current.buyerClientId,
      propertyId: current.propertyId,
    });
    return next;
  },

  async markPaymentPaid(transactionId, paymentId) {
    const i = transactions.findIndex((t) => t.id === transactionId);
    const current = transactions[i];
    if (!current) return null;
    const payments = current.payments.map((p) =>
      p.id === paymentId ? { ...p, paidAt: p.paidAt ?? new Date().toISOString() } : p,
    );
    const next: Transaction = { ...current, payments };
    transactions[i] = next;
    const payment = payments.find((p) => p.id === paymentId);
    pushActivity({
      kind: "note",
      subject: "Paiement encaissé",
      body: `${payment?.label ?? "Paiement"} — ${payment?.amount ?? 0} MAD`,
      clientId: current.buyerClientId,
      propertyId: current.propertyId,
    });
    return next;
  },

  /* ----------------------------------------------------------------- agents */

  async listAgents() {
    return [...seedAgents];
  },

  /* --------------------------------------------------------- notifications */

  async listNotifications() {
    return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createNotification(input) {
    return pushNotification(input);
  },

  async markNotificationRead(id) {
    const i = notifications.findIndex((n) => n.id === id);
    const current = notifications[i];
    if (current) notifications[i] = { ...current, read: true };
  },

  async markAllNotificationsRead() {
    notifications.forEach((n, i) => {
      notifications[i] = { ...n, read: true };
    });
  },

  /* -------------------------------------------------------------- dashboard */

  async getDashboard(): Promise<DashboardSummary> {
    const active = properties.filter((p) => ACTIVE_PROPERTY_STATUSES.includes(p.status));
    const openLeads = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
    const won = leads.filter((l) => l.stage === "won");

    const pipelineValue = openLeads.reduce((sum, l) => sum + l.value, 0);
    const revenueYtd = transactions
      .filter((t) => t.closedAt)
      .reduce((sum, t) => sum + t.commission, 0);

    const viewings30d = appointments.filter(
      (a) =>
        a.kind === "viewing" &&
        a.startsAt >= new Date(SEED_NOW.getTime() - 30 * 86_400_000).toISOString(),
    ).length;

    const stages: PipelineStage[] = [
      "new",
      "contacted",
      "qualified",
      "viewing",
      "offer",
      "negotiation",
    ];

    return {
      kpis: {
        activelistings: active.length,
        newLeads30d: leads.length,
        viewings30d,
        pipelineValue,
        revenueYtd,
        conversionRate: leads.length ? Math.round((won.length / leads.length) * 100) : 0,
        deltas: {
          activelistings: 8,
          newLeads30d: 23,
          viewings30d: -6,
          pipelineValue: 14,
          revenueYtd: 31,
          conversionRate: 4,
        },
      },
      leadsSeries: MONTHS.map((month, i) => ({
        month,
        leads: 18 + i * 4 + (i % 2 ? 6 : 0),
        viewings: 9 + i * 3,
      })),
      viewsSeries: MONTHS.map((month, i) => ({
        month,
        views: 2400 + i * 620 + (i % 3) * 300,
      })),
      pipelineByStage: stages.map((stage) => ({
        label: stage,
        value: leads.filter((l) => l.stage === stage).length,
      })),
      revenueSeries: MONTHS.map((month, i) => ({
        month,
        revenue: 120_000 + i * 48_000 + (i % 2 ? 30_000 : 0),
      })),
      sourceBreakdown: LEAD_SOURCES.map((s) => ({
        label: s,
        value: leads.filter((l) => l.source === s).length,
      })),
    };
  },

  async getPriorities(agentId?: string): Promise<Priority[]> {
    const now = new Date().toISOString();
    const todayEnd = new Date(Date.now() + 86_400_000).toISOString();

    const overdueTasks = tasks
      .filter((t) => t.status !== "done" && t.dueAt && t.dueAt < now)
      .filter((t) => !agentId || t.assigneeId === agentId)
      .slice(0, 3)
      .map<Priority>((t) => ({
        id: t.id,
        kind: "task",
        title: t.title,
        detail: "Échéance dépassée",
        urgency: "overdue",
        href: "/admin/taches",
      }));

    const todayAppointments = appointments
      .filter((a) => a.startsAt >= now && a.startsAt <= todayEnd)
      .filter((a) => !agentId || a.agentId === agentId)
      .slice(0, 3)
      .map<Priority>((a) => ({
        id: a.id,
        kind: "appointment",
        title: a.title,
        detail: new Date(a.startsAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        urgency: "today",
        href: "/admin/agenda",
      }));

    const staleLeads = leads
      .filter((l) => l.stage === "new" || l.stage === "contacted")
      .filter((l) => !agentId || l.agentId === agentId)
      .slice(0, 2)
      .map<Priority>((l) => ({
        id: l.id,
        kind: "lead",
        title: l.nextAction ?? "Relancer le lead",
        detail: "Sans contact depuis 3 jours",
        urgency: "soon",
        href: "/admin/crm",
      }));

    return [...overdueTasks, ...todayAppointments, ...staleLeads];
  },

  /* ------------------------------------------------------------- marketing */

  async listCampaigns() {
    return [...campaigns];
  },

  async createCampaign(input) {
    const campaign: MarketingCampaign = {
      id: newId("camp"),
      name: input.name,
      subject: input.subject,
      channel: input.channel,
      status: "draft",
      audience: input.audience,
      audienceCount: input.audienceCount,
      opens: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    campaigns.unshift(campaign);
    pushActivity({
      kind: "email",
      subject: "Campagne créée",
      body: `${campaign.name} — brouillon.`,
    });
    return campaign;
  },

  async sendCampaign(id) {
    const i = campaigns.findIndex((c) => c.id === id);
    const current = campaigns[i];
    if (!current) return null;
    const wasSent = current.status === "sent";
    const sent: MarketingCampaign = {
      ...current,
      status: "sent",
      sentAt: wasSent ? current.sentAt : new Date().toISOString(),
      opens: wasSent ? current.opens : Math.round(current.audienceCount * 0.55),
      clicks: wasSent ? current.clicks : Math.round(current.audienceCount * 0.2),
      conversions: wasSent
        ? current.conversions
        : Math.max(1, Math.round(current.audienceCount * 0.03)),
    };
    campaigns[i] = sent;
    pushActivity({
      kind: "email",
      subject: "Campagne envoyée",
      body: `${sent.name} — ${sent.audienceCount} destinataires, 3 conversions estimées.`,
    });
    return sent;
  },

  async deleteCampaign(id) {
    const i = campaigns.findIndex((c) => c.id === id);
    if (i >= 0) campaigns.splice(i, 1);
  },

  async setFeatured(propertyId, until) {
    const i = featured.findIndex((f) => f.propertyId === propertyId);
    if (i >= 0) {
      featured[i] = { propertyId, since: featured[i]!.since, until };
    } else {
      featured.push({ propertyId, since: new Date().toISOString(), until });
    }
    return [...featured];
  },

  async removeFeatured(propertyId) {
    const i = featured.findIndex((f) => f.propertyId === propertyId);
    if (i >= 0) featured.splice(i, 1);
    return [...featured];
  },

  async getMarketingStats(): Promise<MarketingStats> {
    const sources: SourceStat[] = LEAD_SOURCES.map((source) => {
      const l = leads.filter((x) => x.source === source);
      const conversions = l.filter((x) => x.stage === "won").length;
      return {
        source,
        leads: l.length,
        conversions,
        rate: l.length ? Math.round((conversions / l.length) * 100) : 0,
      };
    });
    return {
      campaigns: [...campaigns],
      featured: [...featured],
      sources,
      totals: {
        sent: campaigns.filter((c) => c.status === "sent").length,
        opens: campaigns.reduce((s, c) => s + c.opens, 0),
        clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
        conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
        featuredCount: featured.length,
      },
    };
  },

  /* --------------------------------------------------------------- matching */

  async matchForClient(clientId) {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return [];
    return properties
      .map((p) => propertyScore(p, client))
      .filter((m): m is PropertyMatch => m !== null && m.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  },

  async matchForProperty(propertyId) {
    const property = properties.find((p) => p.id === propertyId);
    if (!property || !ACTIVE_PROPERTY_STATUSES.includes(property.status)) return [];
    return clients
      .map((c) => clientScore(c, property))
      .filter((m): m is ClientMatch => m !== null && m.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  },

  async sendMatchesToClient(clientId, propertyIds) {
    const client = clients.find((c) => c.id === clientId);
    if (!client || propertyIds.length === 0) return 0;
    const refs = propertyIds
      .map((pid) => properties.find((p) => p.id === pid))
      .filter(Boolean)
      .map((p) => `${p!.reference} — ${p!.title}`);
    pushActivity({
      kind: "email",
      subject: "Suggestions de biens envoyées",
      body: `${refs.length} bien(s) : ${refs.join(" · ")}`,
      clientId,
    });
    pushNotification({
      kind: "lead",
      title: "Suggestions envoyées",
      body: `${client.firstName} ${client.lastName} — ${refs.length} biens transmis par e-mail.`,
      href: "/admin/matching",
    });
    return refs.length;
  },

  /* ------------------------------------------------------------- automations */

  async getAutomations(): Promise<AutomationOverview> {
    return {
      rules: automationRules(),
      runs: [...automationRuns],
    };
  },

  async setAutomation(key, enabled) {
    automationFlags[key] = enabled;
    return automationRules();
  },

  async listInactiveLeads(): Promise<InactiveLead[]> {
    const cutoff = Date.now() - 3 * 86_400_000;
    const out: InactiveLead[] = [];
    for (const lead of leads) {
      if (lead.stage === "won" || lead.stage === "lost") continue;
      const client = clients.find((c) => c.id === lead.clientId);
      if (!client) continue;
      const leadActs = activities.filter((a) => a.leadId === lead.id);
      const lastTouch = Math.max(
        new Date(lead.updatedAt).getTime(),
        new Date(lead.createdAt).getTime(),
        ...leadActs.map((a) => new Date(a.createdAt).getTime()),
      );
      if (lastTouch >= cutoff) continue;
      out.push({
        lead,
        client,
        daysInactive: Math.floor((Date.now() - lastTouch) / 86_400_000),
      });
    }
    return out.sort((a, b) => b.daysInactive - a.daysInactive);
  },

  async createCallbackTask(leadId) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const client = clients.find((c) => c.id === lead.clientId);
    const task = pushTask({
      title: "Relance — lead inactif",
      status: "todo",
      priority: "high",
      dueAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
      assigneeId: lead.agentId,
      entity: { kind: "lead", id: lead.id },
    });
    runAutomation(
      "inactiveLeadRelance",
      "Relance planifiée",
      `${client?.firstName ?? ""} ${client?.lastName ?? ""} — rappel de l'agent sous 24 h.`,
    );
    return task;
  },

  /* ---------------------------------------------------------------- reports */

  async getReport(key, q = {}) {
    const fromIso = q.from
      ? new Date(q.from).toISOString()
      : new Date(Date.now() - 90 * 86_400_000).toISOString();
    const toIso = q.to
      ? new Date(q.to).toISOString()
      : new Date(Date.now() + 86_400_000).toISOString();
    const from = fromIso.slice(0, 10);
    const to = toIso.slice(0, 10);
    const inRange = (iso: string) => iso >= fromIso && iso <= toIso;

    if (key === "properties") {
      const list = properties.filter((p) => inRange(p.createdAt));
      const sold = properties.filter((p) => p.soldAt && inRange(p.soldAt));
      const buckets = weekBuckets(fromIso, toIso);
      const createdSeries = buckets.map((b, i) => ({
        label: b.label,
        value: list.filter((p) => bucketOf(buckets, p.createdAt) === i).length,
      }));
      return {
        key,
        title: "Rapport immobilier",
        from,
        to,
        kpis: [
          { label: "Biens créés", value: list.length },
          {
            label: "Biens actifs",
            value: properties.filter((p) => ACTIVE_PROPERTY_STATUSES.includes(p.status)).length,
          },
          { label: "Vendus / loués", value: sold.length },
          {
            label: "Prix moyen (MAD)",
            value: list.length
              ? Math.round(list.reduce((s, p) => s + p.price, 0) / list.length)
              : 0,
          },
        ],
        series: [{ label: "Créations de biens par semaine", points: createdSeries }],
        table: {
          columns: [
            "Référence",
            "Bien",
            "Ville",
            "Transaction",
            "Prix (MAD)",
            "Statut",
            "Vues 30 j",
          ],
          rows: list.map((p) => [
            p.reference,
            p.title,
            p.city,
            p.transaction === "vente" ? "Vente" : "Location",
            String(p.price),
            p.status.replace(/_/g, " "),
            String(p.views30d),
          ]),
        },
      };
    }

    if (key === "crm") {
      const inRangeLeads = leads.filter((l) => inRange(l.createdAt));
      const won = inRangeLeads.filter((l) => l.stage === "won");
      const buckets = weekBuckets(fromIso, toIso);
      const series = buckets.map((b, i) => ({
        label: b.label,
        value: inRangeLeads.filter((l) => bucketOf(buckets, l.createdAt) === i).length,
      }));
      const wonSeries = buckets.map((b, i) => ({
        label: b.label,
        value: won.filter((l) => bucketOf(buckets, l.createdAt) === i).length,
      }));
      return {
        key,
        title: "Rapport CRM",
        from,
        to,
        kpis: [
          { label: "Clients", value: clients.filter((c) => inRange(c.createdAt)).length },
          { label: "Leads créés", value: inRangeLeads.length },
          {
            label: "Taux de conversion",
            value: inRangeLeads.length ? Math.round((won.length / inRangeLeads.length) * 100) : 0,
          },
          {
            label: "Score moyen",
            value: inRangeLeads.length
              ? Math.round(inRangeLeads.reduce((s, l) => s + l.score, 0) / inRangeLeads.length)
              : 0,
          },
        ],
        series: [
          { label: "Leads par semaine", points: series },
          { label: "Gagnés par semaine", points: wonSeries },
        ],
        table: {
          columns: ["Client", "Source", "Score", "Température", "Étape", "Valeur (MAD)"],
          rows: inRangeLeads.slice(0, 60).map((l) => {
            const c = clients.find((x) => x.id === l.clientId);
            return [
              c ? `${c.firstName} ${c.lastName}` : l.clientId,
              l.source.replace(/_/g, " "),
              String(l.score),
              l.temperature,
              l.stage,
              String(l.value),
            ];
          }),
        },
      };
    }

    if (key === "agents") {
      const inRangeTxns = transactions.filter((t) => inRange(t.openedAt));
      const buckets = weekBuckets(fromIso, toIso);
      const txnSeries = buckets.map((b, i) => ({
        label: b.label,
        value: inRangeTxns.filter((t) => bucketOf(buckets, t.openedAt) === i).length,
      }));
      return {
        key,
        title: "Rapport des agents",
        from,
        to,
        kpis: [
          { label: "Agents", value: seedAgents.length },
          { label: "Transactions", value: inRangeTxns.length },
          {
            label: "Commissions (MAD)",
            value: inRangeTxns.reduce((s, t) => s + t.commission, 0),
          },
          {
            label: "Visites",
            value: appointments.filter((a) => a.kind === "viewing" && inRange(a.startsAt)).length,
          },
        ],
        series: [{ label: "Transactions ouvertes par semaine", points: txnSeries }],
        table: {
          columns: [
            "Agent",
            "Rôle",
            "Leads",
            "Visites",
            "Transactions",
            "Commission (MAD)",
            "Clôturées",
          ],
          rows: seedAgents.map((a) => {
            const aTxns = transactions.filter((t) => t.agentId === a.id);
            return [
              a.name,
              a.role,
              String(leads.filter((l) => l.agentId === a.id).length),
              String(appointments.filter((x) => x.agentId === a.id && x.kind === "viewing").length),
              String(aTxns.length),
              String(aTxns.reduce((s, t) => s + t.commission, 0)),
              String(aTxns.filter((t) => t.closedAt).length),
            ];
          }),
        },
      };
    }

    const inRangeActs = activities.filter((a) => inRange(a.createdAt));
    const buckets = weekBuckets(fromIso, toIso);
    const actSeries = buckets.map((b, i) => ({
      label: b.label,
      value: inRangeActs.filter((a) => bucketOf(buckets, a.createdAt) === i).length,
    }));
    const kindLabel: Record<string, string> = {
      call: "Appels",
      email: "E-mails",
      whatsapp: "WhatsApp",
      viewing: "Visites",
      offer: "Offres",
    };
    const byKind = Object.entries(kindLabel).map(([kind, label]) => ({
      label,
      value: inRangeActs.filter((a) => a.kind === kind).length,
    }));
    return {
      key,
      title: "Rapport d'activité",
      from,
      to,
      kpis: [{ label: "Actions", value: inRangeActs.length }, ...byKind],
      series: [{ label: "Activité par semaine", points: actSeries }],
      table: {
        columns: ["Date", "Type", "Sujet", "Agent"],
        rows: inRangeActs
          .slice(0, 60)
          .map((a) => [
            a.createdAt.slice(0, 10),
            a.kind,
            a.subject,
            seedAgents.find((ag) => ag.id === a.agentId)?.name ?? a.agentId,
          ]),
      },
    };
  },
};

function automationRules(): AutomationRule[] {
  return (Object.keys(AUTOMATION_META) as AutomationRuleKey[]).map((key) => {
    const runs = automationRuns.filter((r) => r.rule === key);
    return {
      key,
      title: AUTOMATION_META[key].title,
      description: AUTOMATION_META[key].description,
      enabled: automationFlags[key],
      runs: runs.length,
      lastRun: runs[0]?.at,
    };
  });
}

/** Swap this binding to move the whole admin onto Supabase. */
export const repository: AdminRepository = inMemoryRepository;
