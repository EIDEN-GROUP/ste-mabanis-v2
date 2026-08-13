/**
 * Seed dataset for the admin.
 *
 * Properties and agents are derived from the public site content so both sides
 * of the app describe the same agency. Everything else (clients, leads,
 * appointments…) is generated deterministically — no Math.random, so SSR and
 * client render agree and screenshots stay stable between runs.
 */

import {
  agents as siteAgents,
  properties as siteProperties,
  type Property as SiteProperty,
} from "@/lib/site-data";
import type {
  Activity,
  AdminProperty,
  AdminTask,
  Agent,
  Appointment,
  AppNotification,
  Client,
  ClientRole,
  FeaturedProperty,
  Lead,
  LeadSource,
  LeadTemperature,
  MarketingCampaign,
  PipelineStage,
  PropertyMedia,
  PropertyStatus,
  StoredDocument,
  Transaction,
} from "./types";

/** Fixed clock so relative dates in the seed are reproducible. */
export const SEED_NOW = new Date("2026-08-11T09:00:00.000Z");

const day = 86_400_000;

function iso(offsetDays: number, hour = 10, minute = 0) {
  const d = new Date(SEED_NOW.getTime() + offsetDays * day);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Small deterministic PRNG so the seed is stable across renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = rng(20260811);

/**
 * Cyclic index. `noUncheckedIndexedAccess` is on, so plain `list[i]` is
 * `T | undefined`; wrapping the modulo here keeps every call site non-null
 * without scattering assertions through the seed.
 */
function at<T>(list: readonly T[], i: number): T {
  return list[((i % list.length) + list.length) % list.length] as T;
}

const pick = <T>(list: readonly T[], r = rand()): T => at(list, Math.floor(r * list.length));

/* ------------------------------------------------------------------ agents */

export const seedAgents: Agent[] = siteAgents.map((a) => ({
  id: a.slug,
  name: a.name,
  role: a.role,
  email: a.email,
}));

/* -------------------------------------------------------------- properties */

const statusCycle: PropertyStatus[] = [
  "available",
  "available",
  "reserved",
  "under_offer",
  "sold",
  "available",
  "rented",
  "draft",
  "available",
  "archived",
];

function mediaFor(p: SiteProperty, id: string): PropertyMedia[] {
  const photos: PropertyMedia[] = p.images.map((url, i) => ({
    id: `${id}-photo-${i}`,
    propertyId: id,
    kind: "photo" as const,
    url,
    label: i === 0 ? "Façade" : `Vue ${i + 1}`,
    position: i,
    isCover: i === 0,
  }));
  return [
    ...photos,
    {
      id: `${id}-plan-0`,
      propertyId: id,
      kind: "floor_plan",
      url: at(p.images, 0),
      label: "Plan niveau 1",
      position: 0,
      isCover: false,
    },
  ];
}

export const seedProperties: AdminProperty[] = siteProperties.map((p, i) => {
  const id = p.slug;
  const status = at(statusCycle, i);
  const left = status === "sold" || status === "rented";
  return {
    id,
    reference: p.reference,
    slug: p.slug,
    title: p.title,
    status,
    transaction: p.transaction,
    type: p.type,
    city: p.city,
    neighborhood: p.neighborhood,
    price: p.price,
    surface: p.surface,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    description: p.description.join("\n\n"),
    features: p.features,
    media: mediaFor(p, id),
    agentId: p.agentSlug,
    soldAt: left ? iso(-20 - i * 3) : undefined,
    views30d: 180 + Math.floor(rand() * 900),
    leadCount: 2 + Math.floor(rand() * 14),
    createdAt: iso(-120 - i * 7),
    updatedAt: iso(-i * 2),
  };
});

/* ----------------------------------------------------------------- clients */

const firstNames = [
  "Amine",
  "Leïla",
  "Youssef",
  "Fatima",
  "Omar",
  "Sanaa",
  "Rachid",
  "Imane",
  "Hicham",
  "Nawal",
  "Mehdi",
  "Khadija",
  "Tarik",
  "Soukaina",
  "Anas",
  "Meryem",
  "Jean-Marc",
  "Claire",
  "Otmane",
  "Zineb",
];
const lastNames = [
  "Benali",
  "Tazi",
  "El Fassi",
  "Bennani",
  "Chraibi",
  "Alaoui",
  "Berrada",
  "Idrissi",
  "Sekkat",
  "Lamrani",
  "Moreau",
  "Dubois",
  "Ait Taleb",
  "Ouazzani",
  "Belkadi",
  "Hassani",
  "Naciri",
  "Bouzid",
  "Kettani",
  "Sabri",
];
const roleSets: ClientRole[][] = [
  ["buyer"],
  ["seller"],
  ["tenant"],
  ["landlord"],
  ["investor"],
  ["buyer", "investor"],
  ["seller", "landlord"],
];
const sources: LeadSource[] = [
  "site_web",
  "recommandation",
  "portail",
  "reseaux_sociaux",
  "telephone",
  "walk_in",
];

function temperatureFor(score: number): LeadTemperature {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export const seedClients: Client[] = Array.from({ length: 24 }, (_, i) => {
  const score = Math.floor(rand() * 100);
  const first = at(firstNames, i);
  const last = at(lastNames, i * 3);
  const budgetMin = 700_000 + Math.floor(rand() * 12) * 250_000;
  return {
    id: `client-${i + 1}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase().replace(/[^a-z]/g, "")}.${last
      .toLowerCase()
      .replace(/[^a-z]/g, "")}@example.ma`,
    phone: `+212 6${String(60 + (i % 9))} ${String(100000 + i * 4321).slice(0, 6)}`,
    roles: at(roleSets, i),
    temperature: temperatureFor(score),
    score,
    source: at(sources, i),
    city: pick(["Agadir", "Casablanca", "Marrakech", "Rabat", "Paris", "Taghazout"]),
    budgetMin,
    budgetMax: budgetMin + 900_000,
    notes: i % 4 === 0 ? "Financement bancaire en cours de validation." : undefined,
    agentId: at(seedAgents, i).id,
    createdAt: iso(-Math.floor(rand() * 180)),
    lastContactedAt: i % 5 === 0 ? undefined : iso(-Math.floor(rand() * 12)),
  };
});

/* ------------------------------------------------------------------- leads */

const stageCycle: PipelineStage[] = [
  "new",
  "new",
  "contacted",
  "contacted",
  "qualified",
  "qualified",
  "viewing",
  "viewing",
  "offer",
  "negotiation",
  "won",
  "lost",
];

export const seedLeads: Lead[] = Array.from({ length: 30 }, (_, i) => {
  const client = at(seedClients, i);
  const property = at(seedProperties, i);
  const score = Math.floor(rand() * 100);
  return {
    id: `lead-${i + 1}`,
    clientId: client.id,
    propertyId: i % 6 === 0 ? undefined : property.id,
    stage: at(stageCycle, i),
    temperature: temperatureFor(score),
    score,
    source: at(sources, i),
    value: property.price,
    agentId: client.agentId,
    createdAt: iso(-Math.floor(rand() * 60)),
    updatedAt: iso(-Math.floor(rand() * 10)),
    nextAction: i % 3 === 0 ? "Rappeler pour confirmer la visite" : "Envoyer la sélection de biens",
    nextActionAt: iso(Math.floor(rand() * 6) - 2, 9 + (i % 8)),
  };
});

/* -------------------------------------------------------------- activities */

export const seedActivities: Activity[] = Array.from({ length: 40 }, (_, i) => {
  const lead = at(seedLeads, i);
  const kinds = ["call", "email", "whatsapp", "viewing", "note", "stage_change"] as const;
  const kind = at(kinds, i);
  const labels: Record<string, string> = {
    call: "Appel sortant",
    email: "Email envoyé",
    whatsapp: "Message WhatsApp",
    viewing: "Visite effectuée",
    note: "Note interne",
    stage_change: "Changement d'étape",
    offer: "Offre reçue",
    document: "Document ajouté",
  };
  return {
    id: `activity-${i + 1}`,
    kind,
    subject: labels[kind] ?? kind,
    body:
      kind === "note"
        ? "Client intéressé par une vue mer, budget flexible de 10%."
        : kind === "viewing"
          ? "Visite de 45 minutes, très bon accueil du bien."
          : undefined,
    clientId: lead.clientId,
    propertyId: lead.propertyId,
    leadId: lead.id,
    agentId: lead.agentId,
    createdAt: iso(-Math.floor(rand() * 30), 8 + (i % 10)),
  };
});

/* ------------------------------------------------------------ appointments */

export const seedAppointments: Appointment[] = Array.from({ length: 18 }, (_, i) => {
  const lead = at(seedLeads, i);
  const offset = (i % 12) - 4;
  const hour = 9 + (i % 8);
  const kinds = ["viewing", "valuation", "signature", "call", "meeting"] as const;
  const kind = at(kinds, i);
  const past = offset < 0;
  return {
    id: `appt-${i + 1}`,
    kind,
    status: past ? (i % 5 === 0 ? "no_show" : "done") : i % 3 === 0 ? "confirmed" : "scheduled",
    title:
      kind === "viewing"
        ? "Visite accompagnée"
        : kind === "valuation"
          ? "Rendez-vous d'estimation"
          : kind === "signature"
            ? "Signature du compromis"
            : kind === "call"
              ? "Appel de suivi"
              : "Point de dossier",
    startsAt: iso(offset, hour),
    endsAt: iso(offset, hour + 1),
    propertyId: lead.propertyId,
    clientId: lead.clientId,
    agentId: lead.agentId,
    location: "Agadir",
    report: past
      ? {
          interest: 1 + Math.floor(rand() * 5),
          outcome: i % 3 === 0 ? "Intéressé, demande une seconde visite" : "Bien trop petit",
          nextAction: i % 2 === 0 ? "Proposer 2 biens similaires" : undefined,
        }
      : undefined,
  };
});

/* --------------------------------------------------------------- documents */

export const seedDocuments: StoredDocument[] = Array.from({ length: 14 }, (_, i) => {
  const property = at(seedProperties, i);
  const categories = [
    "mandat",
    "titre_foncier",
    "compromis",
    "contrat",
    "facture",
    "diagnostic",
  ] as const;
  const category = at(categories, i);
  return {
    id: `doc-${i + 1}`,
    name: `${category.replace(/_/g, " ")} — ${property.reference}.pdf`,
    category,
    mimeType: "application/pdf",
    sizeBytes: 120_000 + Math.floor(rand() * 3_000_000),
    version: 1 + (i % 3),
    url: "#",
    propertyId: property.id,
    clientId: at(seedClients, i).id,
    uploadedById: at(seedAgents, i).id,
    createdAt: iso(-Math.floor(rand() * 90)),
  };
});

/* ------------------------------------------------------------------- tasks */

export const seedTasks: AdminTask[] = Array.from({ length: 16 }, (_, i) => {
  const lead = at(seedLeads, i);
  const priorities = ["low", "normal", "high", "urgent"] as const;
  const titles = [
    "Rappeler le client après la visite",
    "Envoyer le rapport d'estimation",
    "Relancer pour les pièces du dossier",
    "Préparer le mandat de vente",
    "Confirmer le rendez-vous de signature",
    "Mettre à jour les photos du bien",
  ];
  return {
    id: `task-${i + 1}`,
    title: at(titles, i),
    status: i % 4 === 0 ? "done" : i % 3 === 0 ? "doing" : "todo",
    priority: at(priorities, i),
    dueAt: iso((i % 9) - 3, 12),
    assigneeId: lead.agentId,
    entity: { kind: "lead", id: lead.id },
    createdAt: iso(-Math.floor(rand() * 20)),
  };
});

/* ------------------------------------------------------------ transactions */

export const seedTransactions: Transaction[] = Array.from({ length: 8 }, (_, i) => {
  const property = at(seedProperties, i * 2);
  const stages = [
    "interest",
    "visit",
    "offer",
    "negotiation",
    "agreement",
    "contract",
    "payment",
    "closing",
  ] as const;
  const amount = Math.round(property.price * (0.92 + rand() * 0.08));
  return {
    id: `txn-${i + 1}`,
    reference: `TX-${2026}-${String(i + 1).padStart(3, "0")}`,
    stage: at(stages, i),
    propertyId: property.id,
    buyerClientId: at(seedClients, i).id,
    sellerClientId: at(seedClients, i + 7).id,
    agentId: property.agentId,
    amount,
    commission: Math.round(amount * 0.025),
    payments: [
      {
        id: `pay-${i + 1}-1`,
        label: "Acompte",
        amount: Math.round(amount * 0.1),
        dueAt: iso(-15 + i),
        paidAt: i % 2 === 0 ? iso(-14 + i) : undefined,
      },
      {
        id: `pay-${i + 1}-2`,
        label: "Solde à la signature",
        amount: Math.round(amount * 0.9),
        dueAt: iso(20 + i),
      },
    ],
    openedAt: iso(-40 - i * 5),
    closedAt: i % 8 === 7 ? iso(-2) : undefined,
  };
});

/* --------------------------------------------------------------- marketing */

export const seedCampaigns: MarketingCampaign[] = [
  {
    id: "camp-1",
    name: "Coup de cœur Marina — Août",
    subject: "3 biens d'exception face à la Marina d'Agadir",
    channel: "email",
    status: "sent",
    audience: "Acheteurs Marina — budget ≥ 2 M MAD",
    audienceCount: 240,
    sentAt: iso(-8, 9),
    opens: 142,
    clicks: 51,
    conversions: 6,
    createdAt: iso(-14),
  },
  {
    id: "camp-2",
    name: "Relance WhatsApp — visiteurs du salon",
    subject: "Suite à votre visite sur le salon immobilier…",
    channel: "whatsapp",
    status: "sent",
    audience: "Leads salons (Juin) sans suite",
    audienceCount: 86,
    sentAt: iso(-3, 14),
    opens: 80,
    clicks: 33,
    conversions: 4,
    createdAt: iso(-5),
  },
  {
    id: "camp-3",
    name: "Investisseurs — Taghazout Bay",
    subject: "Rentabilité locative : le dossier complet",
    channel: "portail",
    status: "draft",
    audience: "Investisseurs — budget 1,5–4 M MAD",
    audienceCount: 132,
    opens: 0,
    clicks: 0,
    conversions: 0,
    createdAt: iso(-1),
  },
];

export const seedFeatured: FeaturedProperty[] = [
  { propertyId: seedProperties[0]!.id, since: iso(-6), until: iso(9) },
  { propertyId: seedProperties[3]!.id, since: iso(-3), until: iso(12) },
];

/* ------------------------------------------------------------ notifications */

export const seedNotifications: AppNotification[] = [
  {
    id: "notif-1",
    kind: "lead",
    title: "Nouveau lead — Villa Founty",
    body: "Leïla Tazi a demandé une visite depuis le site web.",
    read: false,
    createdAt: iso(0, 8, 40),
    href: "/admin/crm",
  },
  {
    id: "notif-2",
    kind: "appointment",
    title: "Visite dans 1 heure",
    body: "Youssef Bennani — Appartement Marina, 10h00.",
    read: false,
    createdAt: iso(0, 8, 10),
    href: "/admin/agenda",
  },
  {
    id: "notif-3",
    kind: "task",
    title: "Tâche en retard",
    body: "Envoyer le rapport d'estimation à Fatima El Fassi.",
    read: false,
    createdAt: iso(-1, 16, 30),
    href: "/admin/taches",
  },
  {
    id: "notif-4",
    kind: "transaction",
    title: "Paiement reçu",
    body: "Acompte de 340 000 MAD encaissé sur TX-2026-003.",
    read: true,
    createdAt: iso(-1, 11, 5),
    href: "/admin/transactions",
  },
  {
    id: "notif-5",
    kind: "system",
    title: "Bien publié",
    body: "Riad Talborjt est maintenant visible sur le site public.",
    read: true,
    createdAt: iso(-2, 9, 20),
    href: "/admin/proprietes",
  },
];
