/**
 * Typed server functions. Screens never touch the repository directly — they go
 * through these, so authorisation (and later Supabase RLS) has exactly one
 * place to live.
 */

import { createServerFn } from "@tanstack/react-start";
import {
  repository,
  type AppointmentInput,
  type CampaignInput,
  type ClientInput,
  type ClientQuery,
  type LeadInput,
  type Patch,
  type PropertyInput,
  type PropertyQuery,
  type ReportQuery,
  type TaskInput,
} from "./repository";
import {
  LEAD_SOURCES,
  PROPERTY_STATUSES,
  PIPELINE_STAGES,
  TRANSACTION_STAGES,
  type AppointmentKind,
  type AppointmentStatus,
  type AutomationRuleKey,
  type CampaignChannel,
  type ClientRole,
  type DocumentCategory,
  type LeadSource,
  type MediaKind,
  type PipelineStage,
  type PropertyStatus,
  type ReportKey,
  type TaskPriority,
  type TaskStatus,
  type TransactionStage,
} from "./types";

/* ------------------------------------------------------------- validators */

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined;
}

function asBoolean(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function parsePropertyQuery(raw: unknown): PropertyQuery {
  const q = (raw ?? {}) as Record<string, unknown>;
  const status = asStringArray(q["status"])?.filter((s): s is PropertyStatus =>
    (PROPERTY_STATUSES as readonly string[]).includes(s),
  );
  const tx = q["transaction"];
  const sortRaw = q["sort"];
  return {
    search: asString(q["search"]),
    status,
    transaction: tx === "vente" || tx === "location" ? tx : undefined,
    agentId: asString(q["agentId"]),
    city: asString(q["city"]),
    minPrice: asNumber(q["minPrice"]),
    maxPrice: asNumber(q["maxPrice"]),
    sort: ["recent", "price_asc", "price_desc", "views"].includes(sortRaw as string)
      ? (sortRaw as PropertyQuery["sort"])
      : undefined,
  };
}

function parseClientQuery(raw: unknown): ClientQuery {
  const q = (raw ?? {}) as Record<string, unknown>;
  return {
    search: asString(q["search"]),
    roles: asStringArray(q["roles"]),
    temperature: asStringArray(q["temperature"]),
    agentId: asString(q["agentId"]),
  };
}

function requireId(raw: unknown): string {
  const id = asString(raw);
  if (!id) throw new Error("An id is required");
  return id;
}

const inList =
  <T extends string>(list: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === "string" && (list as readonly string[]).includes(v);

const enumOf =
  <T extends string>(list: readonly T[], label: string) =>
  (v: unknown): T => {
    if (!inList(list)(v)) throw new Error(`Unknown ${label}: ${String(v)}`);
    return v;
  };

function parseObject(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Expected an object");
  }
  return raw as Record<string, unknown>;
}

/* --------------------------------------------------------------- properties */

export const fetchProperties = createServerFn({ method: "GET" })
  .inputValidator(parsePropertyQuery)
  .handler(({ data }) => repository.listProperties(data));

export const fetchProperty = createServerFn({ method: "GET" })
  .inputValidator(requireId)
  .handler(({ data }) => repository.getProperty(data));

export const setPropertyStatus = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    const status = asString(q["status"]);
    if (!status || !(PROPERTY_STATUSES as readonly string[]).includes(status)) {
      throw new Error(`Unknown property status: ${String(q["status"])}`);
    }
    return { id: requireId(q["id"]), status: status as PropertyStatus };
  })
  .handler(({ data }) => repository.updatePropertyStatus(data.id, data.status));

export const createProperty = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const transactionRaw = q["transaction"];
    if (transactionRaw !== "vente" && transactionRaw !== "location") {
      throw new Error("transaction is required");
    }
    return {
      reference: asString(q["reference"]),
      title: asString(q["title"]) ?? "",
      status: asString(q["status"]) as PropertyStatus | undefined,
      transaction: transactionRaw as "vente" | "location",
      type: asString(q["type"]) ?? "",
      city: asString(q["city"]) ?? "",
      neighborhood: asString(q["neighborhood"]) ?? "",
      price: asNumber(q["price"]) ?? 0,
      surface: asNumber(q["surface"]) ?? 0,
      bedrooms: asNumber(q["bedrooms"]),
      bathrooms: asNumber(q["bathrooms"]),
      description: asString(q["description"]),
      features: asStringArray(q["features"]),
      agentId: asString(q["agentId"]),
    };
  })
  .handler(({ data }) => repository.createProperty(data));

export const updateProperty = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { id: string; patch: Patch<PropertyInput> } => {
    const q = parseObject(raw);
    const transactionRaw = q["transaction"];
    return {
      id: requireId(q["id"]),
      patch: {
        reference: asString(q["reference"]),
        title: asString(q["title"]),
        status: asString(q["status"]) as PropertyStatus | undefined,
        transaction:
          transactionRaw === "vente" || transactionRaw === "location" ? transactionRaw : undefined,
        type: asString(q["type"]),
        city: asString(q["city"]),
        neighborhood: asString(q["neighborhood"]),
        price: asNumber(q["price"]),
        surface: asNumber(q["surface"]),
        bedrooms: asNumber(q["bedrooms"]),
        bathrooms: asNumber(q["bathrooms"]),
        description: asString(q["description"]),
        features: asStringArray(q["features"]),
        agentId: asString(q["agentId"]),
      },
    };
  })
  .handler(({ data }) => repository.updateProperty(data.id, data.patch));

export const addPropertyMedia = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const items = Array.isArray(q["items"]) ? q["items"] : [];
    return {
      propertyId: requireId(q["propertyId"]),
      items: items.map((item) => {
        const m = parseObject(item);
        return {
          kind: asString(m["kind"]) as MediaKind | undefined,
          url: asString(m["url"]) ?? "",
          label: asString(m["label"]),
          isCover: asBoolean(m["isCover"]),
        };
      }),
    };
  })
  .handler(({ data }) => repository.addMedia(data.propertyId, data.items));

export const updatePropertyMedia = createServerFn({ method: "POST" })
  .inputValidator(
    (raw: unknown): { id: string; patch: Patch<{ label: string; isCover: boolean }> } => {
      const q = parseObject(raw);
      return {
        id: requireId(q["id"]),
        patch: {
          label: asString(q["label"]),
          isCover: asBoolean(q["isCover"]),
        },
      };
    },
  )
  .handler(({ data }) => repository.updateMedia(data.id, data.patch));

export const movePropertyMedia = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const direction = q["direction"];
    if (direction !== -1 && direction !== 1) throw new Error("direction must be -1 or 1");
    return { id: requireId(q["id"]), direction: direction as -1 | 1 };
  })
  .handler(({ data }) => repository.moveMedia(data.id, data.direction));

export const removePropertyMedia = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw))
  .handler(({ data }) => repository.removeMedia(requireId(data["id"])));

/* ------------------------------------------------------------------ people */

export const fetchClients = createServerFn({ method: "GET" })
  .inputValidator(parseClientQuery)
  .handler(({ data }) => repository.listClients(data));

export const fetchClient = createServerFn({ method: "GET" })
  .inputValidator(requireId)
  .handler(({ data }) => repository.getClient(data));

export const fetchAgents = createServerFn({ method: "GET" }).handler(() => repository.listAgents());

export const createClient = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      firstName: asString(q["firstName"]) ?? "",
      lastName: asString(q["lastName"]) ?? "",
      email: asString(q["email"]) ?? "",
      phone: asString(q["phone"]),
      roles: asStringArray(q["roles"]) as ClientRole[] | undefined,
      temperature: asString(q["temperature"]) as "cold" | "warm" | "hot" | undefined,
      score: asNumber(q["score"]),
      source: asString(q["source"]) as LeadSource | undefined,
      city: asString(q["city"]),
      budgetMin: asNumber(q["budgetMin"]),
      budgetMax: asNumber(q["budgetMax"]),
      notes: asString(q["notes"]),
      agentId: asString(q["agentId"]),
    };
  })
  .handler(({ data }) => repository.createClient(data));

export const updateClient = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { id: string; patch: Patch<ClientInput> } => {
    const q = parseObject(raw);
    return {
      id: requireId(q["id"]),
      patch: {
        firstName: asString(q["firstName"]),
        lastName: asString(q["lastName"]),
        email: asString(q["email"]),
        phone: asString(q["phone"]),
        roles: asStringArray(q["roles"]) as ClientRole[] | undefined,
        temperature: asString(q["temperature"]) as "cold" | "warm" | "hot" | undefined,
        score: asNumber(q["score"]),
        source: asString(q["source"]) as LeadSource | undefined,
        city: asString(q["city"]),
        budgetMin: asNumber(q["budgetMin"]),
        budgetMax: asNumber(q["budgetMax"]),
        notes: asString(q["notes"]),
        agentId: asString(q["agentId"]),
      },
    };
  })
  .handler(({ data }) => repository.updateClient(data.id, data.patch));

export const addActivity = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const kinds = [
      "note",
      "call",
      "email",
      "whatsapp",
      "viewing",
      "offer",
      "stage_change",
      "document",
    ] as const;
    return {
      kind: enumOf(kinds, "activity kind")(q["kind"]),
      subject: asString(q["subject"]) ?? "",
      body: asString(q["body"]),
      clientId: asString(q["clientId"]),
      propertyId: asString(q["propertyId"]),
      leadId: asString(q["leadId"]),
      agentId: asString(q["agentId"]),
    };
  })
  .handler(({ data }) => repository.addActivity(data));

/* ------------------------------------------------------------------- leads */

export const fetchLeads = createServerFn({ method: "GET" }).handler(() => repository.listLeads());

export const fetchLead = createServerFn({ method: "GET" })
  .inputValidator(requireId)
  .handler(({ data }) => repository.getLead(data));

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const source = asString(q["source"]);
    return {
      clientId: requireId(q["clientId"]),
      propertyId: asString(q["propertyId"]),
      stage: asString(q["stage"]) as PipelineStage | undefined,
      temperature: asString(q["temperature"]) as "cold" | "warm" | "hot" | undefined,
      score: asNumber(q["score"]),
      source:
        source && (LEAD_SOURCES as readonly string[]).includes(source)
          ? (source as LeadSource)
          : "site_web",
      value: asNumber(q["value"]),
      agentId: asString(q["agentId"]),
      nextAction: asString(q["nextAction"]),
      nextActionAt: asString(q["nextActionAt"]),
    };
  })
  .handler(({ data }) => repository.createLead(data));

/** Public site lead forms post straight into the CRM through this. */
export const createPublicLead = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      firstName: asString(q["firstName"]) ?? "",
      lastName: asString(q["lastName"]) ?? "",
      email: asString(q["email"]) ?? "",
      phone: asString(q["phone"]),
      message: asString(q["message"]),
      propertyId: asString(q["propertyId"]),
      agentId: asString(q["agentId"]),
      intent: asString(q["intent"]),
    };
  })
  .handler(({ data }) => repository.createPublicLead(data));

export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { id: string; patch: Patch<LeadInput> } => {
    const q = parseObject(raw);
    const source = asString(q["source"]);
    return {
      id: requireId(q["id"]),
      patch: {
        propertyId: asString(q["propertyId"]),
        temperature: asString(q["temperature"]) as "cold" | "warm" | "hot" | undefined,
        score: asNumber(q["score"]),
        source:
          source && (LEAD_SOURCES as readonly string[]).includes(source)
            ? (source as LeadSource)
            : undefined,
        value: asNumber(q["value"]),
        agentId: asString(q["agentId"]),
        nextAction: asString(q["nextAction"]),
        nextActionAt: asString(q["nextActionAt"]),
      },
    };
  })
  .handler(({ data }) => repository.updateLead(data.id, data.patch));

export const moveLead = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    const stage = asString(q["stage"]);
    if (!stage || !(PIPELINE_STAGES as readonly string[]).includes(stage)) {
      throw new Error(`Unknown pipeline stage: ${String(q["stage"])}`);
    }
    return { id: requireId(q["id"]), stage: stage as PipelineStage };
  })
  .handler(({ data }) => repository.moveLead(data.id, data.stage));

/* --------------------------------------------------------------- everything */

export const fetchActivities = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    return {
      clientId: asString(q["clientId"]),
      leadId: asString(q["leadId"]),
      propertyId: asString(q["propertyId"]),
    };
  })
  .handler(({ data }) => repository.listActivities(data));

export const fetchAppointments = createServerFn({ method: "GET" }).handler(() =>
  repository.listAppointments(),
);

export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const kinds = ["viewing", "valuation", "signature", "call", "meeting"] as const;
    return {
      kind: enumOf(kinds, "appointment kind")(q["kind"]),
      title: asString(q["title"]) ?? "",
      startsAt: asString(q["startsAt"]) ?? "",
      endsAt: asString(q["endsAt"]) ?? "",
      propertyId: asString(q["propertyId"]),
      clientId: asString(q["clientId"]),
      agentId: asString(q["agentId"]),
      location: asString(q["location"]),
      status: asString(q["status"]) as AppointmentStatus | undefined,
    };
  })
  .handler(({ data }) => repository.createAppointment(data));

export const updateAppointment = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { id: string; patch: Patch<AppointmentInput> } => {
    const q = parseObject(raw);
    const kinds = ["viewing", "valuation", "signature", "call", "meeting"] as const;
    return {
      id: requireId(q["id"]),
      patch: {
        kind: q["kind"] !== undefined ? enumOf(kinds, "appointment kind")(q["kind"]) : undefined,
        title: asString(q["title"]),
        startsAt: asString(q["startsAt"]),
        endsAt: asString(q["endsAt"]),
        propertyId: asString(q["propertyId"]),
        clientId: asString(q["clientId"]),
        agentId: asString(q["agentId"]),
        location: asString(q["location"]),
        status: asString(q["status"]) as AppointmentStatus | undefined,
      },
    };
  })
  .handler(({ data }) => repository.updateAppointment(data.id, data.patch));

export const setAppointmentStatus = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const statuses = ["scheduled", "confirmed", "done", "cancelled", "no_show"] as const;
    return {
      id: requireId(q["id"]),
      status: enumOf(statuses, "appointment status")(q["status"]),
    };
  })
  .handler(({ data }) => repository.setAppointmentStatus(data.id, data.status));

export const saveViewingReport = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const interest = asNumber(q["interest"]);
    if (interest === undefined || interest < 0 || interest > 5) {
      throw new Error("interest must be between 0 and 5");
    }
    return {
      id: requireId(q["id"]),
      report: {
        interest,
        outcome: asString(q["outcome"]) ?? "",
        nextAction: asString(q["nextAction"]),
      },
    };
  })
  .handler(({ data }) => repository.saveViewingReport(data.id, data.report));

export const fetchDocuments = createServerFn({ method: "GET" }).handler(() =>
  repository.listDocuments(),
);

export const createDocument = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const categories = [
      "mandat",
      "titre_foncier",
      "compromis",
      "contrat",
      "facture",
      "diagnostic",
      "autre",
    ] as const;
    return {
      name: asString(q["name"]) ?? "",
      category: enumOf(categories, "document category")(q["category"] ?? "autre"),
      mimeType: asString(q["mimeType"]) ?? "application/octet-stream",
      sizeBytes: asNumber(q["sizeBytes"]) ?? 0,
      url: asString(q["url"]) ?? "",
      propertyId: asString(q["propertyId"]),
      clientId: asString(q["clientId"]),
      transactionId: asString(q["transactionId"]),
      uploadedById: asString(q["uploadedById"]),
    };
  })
  .handler(({ data }) => repository.createDocument(data));

export const deleteDocument = createServerFn({ method: "POST" })
  .inputValidator(requireId)
  .handler(({ data }) => repository.deleteDocument(data));

export const fetchTasks = createServerFn({ method: "GET" }).handler(() => repository.listTasks());

export const createTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const priorities = ["low", "normal", "high", "urgent"] as const;
    const entity = q["entity"] as Record<string, unknown> | undefined;
    return {
      title: asString(q["title"]) ?? "",
      status: asString(q["status"]) as TaskStatus | undefined,
      priority:
        q["priority"] !== undefined
          ? enumOf(priorities, "task priority")(q["priority"])
          : undefined,
      dueAt: asString(q["dueAt"]),
      assigneeId: asString(q["assigneeId"]),
      entity:
        entity && typeof entity === "object"
          ? {
              kind: enumOf(
                ["property", "client", "lead", "appointment"] as const,
                "task entity",
              )(entity["kind"]),
              id: requireId(entity["id"]),
            }
          : undefined,
    };
  })
  .handler(({ data }) => repository.createTask(data));

export const updateTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { id: string; patch: Patch<TaskInput> } => {
    const q = parseObject(raw);
    const priorities = ["low", "normal", "high", "urgent"] as const;
    const statuses = ["todo", "doing", "done"] as const;
    return {
      id: requireId(q["id"]),
      patch: {
        title: asString(q["title"]),
        status:
          q["status"] !== undefined ? enumOf(statuses, "task status")(q["status"]) : undefined,
        priority:
          q["priority"] !== undefined
            ? enumOf(priorities, "task priority")(q["priority"])
            : undefined,
        dueAt: asString(q["dueAt"]),
        assigneeId: asString(q["assigneeId"]),
      },
    };
  })
  .handler(({ data }) => repository.updateTask(data.id, data.patch));

export const fetchTransactions = createServerFn({ method: "GET" }).handler(() =>
  repository.listTransactions(),
);

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      propertyId: requireId(q["propertyId"]),
      buyerClientId: requireId(q["buyerClientId"]),
      sellerClientId: asString(q["sellerClientId"]),
      agentId: asString(q["agentId"]),
      amount: asNumber(q["amount"]) ?? 0,
      commission: asNumber(q["commission"]),
      stage: asString(q["stage"]) as TransactionStage | undefined,
    };
  })
  .handler(({ data }) => repository.createTransaction(data));

export const moveTransactionStage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      id: requireId(q["id"]),
      stage: enumOf(TRANSACTION_STAGES, "transaction stage")(q["stage"]),
    };
  })
  .handler(({ data }) => repository.moveTransactionStage(data.id, data.stage));

export const addPayment = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      transactionId: requireId(q["transactionId"]),
      input: {
        label: asString(q["label"]) ?? "",
        amount: asNumber(q["amount"]) ?? 0,
        dueAt: asString(q["dueAt"]) ?? "",
      },
    };
  })
  .handler(({ data }) => repository.addPayment(data.transactionId, data.input));

export const markPaymentPaid = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      transactionId: requireId(q["transactionId"]),
      paymentId: requireId(q["paymentId"]),
    };
  })
  .handler(({ data }) => repository.markPaymentPaid(data.transactionId, data.paymentId));

export const createNotification = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const kinds = ["lead", "appointment", "task", "transaction", "system"] as const;
    return {
      kind: enumOf(kinds, "notification kind")(q["kind"] ?? "system"),
      title: asString(q["title"]) ?? "",
      body: asString(q["body"]) ?? "",
      href: asString(q["href"]),
    };
  })
  .handler(({ data }) => repository.createNotification(data));

/* ------------------------------------------------------------ notifications */

export const fetchNotifications = createServerFn({ method: "GET" }).handler(() =>
  repository.listNotifications(),
);

export const readNotification = createServerFn({ method: "POST" })
  .inputValidator(requireId)
  .handler(({ data }) => repository.markNotificationRead(data));

export const readAllNotifications = createServerFn({ method: "POST" }).handler(() =>
  repository.markAllNotificationsRead(),
);

/* ---------------------------------------------------------------- dashboard */

export const fetchDashboard = createServerFn({ method: "GET" }).handler(() =>
  repository.getDashboard(),
);

export const fetchPriorities = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => ({
    agentId: asString((raw as Record<string, unknown>)["agentId"]),
  }))
  .handler(({ data }) => repository.getPriorities(data.agentId));

/* ---------------------------------------------------------------- marketing */

const CAMPAIGN_CHANNELS = ["email", "whatsapp", "portail", "reseaux_sociaux"] as const;

export const fetchCampaigns = createServerFn({ method: "GET" }).handler(() =>
  repository.listCampaigns(),
);

export const fetchMarketingStats = createServerFn({ method: "GET" }).handler(() =>
  repository.getMarketingStats(),
);

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      name: asString(q["name"]) ?? "Campagne",
      subject: asString(q["subject"]) ?? "",
      channel: enumOf(CAMPAIGN_CHANNELS, "canal")(q["channel"] ?? "email") as CampaignChannel,
      audience: asString(q["audience"]) ?? "",
      audienceCount: asNumber(q["audienceCount"]) ?? 0,
    } satisfies CampaignInput;
  })
  .handler(({ data }) => repository.createCampaign(data));

export const sendCampaign = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["id"])
  .handler(({ data }) => repository.sendCampaign(requireId(data)));

export const deleteCampaign = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["id"])
  .handler(({ data }) => repository.deleteCampaign(requireId(data)));

export const setFeatured = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      propertyId: requireId(q["propertyId"]),
      until: asString(q["until"]) ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
    };
  })
  .handler(({ data }) => repository.setFeatured(data.propertyId, data.until));

export const removeFeatured = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["propertyId"])
  .handler(({ data }) => repository.removeFeatured(requireId(data)));

/* ---------------------------------------------------------------- matching */

export const fetchMatchesForClient = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["clientId"])
  .handler(({ data }) => repository.matchForClient(requireId(data)));

export const fetchMatchesForProperty = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["propertyId"])
  .handler(({ data }) => repository.matchForProperty(requireId(data)));

export const sendMatchesToClient = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      clientId: requireId(q["clientId"]),
      propertyIds: Array.isArray(q["propertyIds"])
        ? q["propertyIds"].filter((x): x is string => typeof x === "string")
        : [],
    };
  })
  .handler(({ data }) => repository.sendMatchesToClient(data.clientId, data.propertyIds));

/* -------------------------------------------------------------- automations */

export const fetchAutomations = createServerFn({ method: "GET" }).handler(() =>
  repository.getAutomations(),
);

export const setAutomationFlag = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    const keys: AutomationRuleKey[] = [
      "leadFirstContact",
      "visitConfirmTask",
      "soldClosesTransaction",
      "inactiveLeadRelance",
    ];
    const key = keys.find((k) => k === q["key"]) ?? "leadFirstContact";
    return { key, enabled: asBoolean(q["enabled"]) ?? true };
  })
  .handler(({ data }) => repository.setAutomation(data.key, data.enabled));

export const fetchInactiveLeads = createServerFn({ method: "GET" }).handler(() =>
  repository.listInactiveLeads(),
);

export const createCallbackTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => parseObject(raw)["leadId"])
  .handler(({ data }) => repository.createCallbackTask(requireId(data)));

/* ---------------------------------------------------------------- reports */

const REPORT_KEYS = ["properties", "crm", "agents", "activity"] as const;

export const fetchReport = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = parseObject(raw);
    return {
      key: (REPORT_KEYS as readonly string[]).includes(q["key"] as string)
        ? (q["key"] as ReportKey)
        : "activity",
      q: {
        from: asString(q["from"]),
        to: asString(q["to"]),
      } satisfies ReportQuery,
    };
  })
  .handler(({ data }) => repository.getReport(data.key, data.q));
