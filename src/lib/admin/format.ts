/** Shared formatters for the admin. French locale throughout, like the site. */

import { SEED_NOW } from "./seed";

const madCompact = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const madFull = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatMoney(value: number, compact = false) {
  return `${compact ? madCompact.format(value) : madFull.format(value)} MAD`;
}

export function formatNumber(value: number) {
  return madFull.format(value);
}

export function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  const units = ["Ko", "Mo", "Go"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

/**
 * Relative time against the seed clock, not the wall clock, so the seeded
 * "il y a 2 h" stays truthful while the data is static.
 */
export function relativeTime(iso: string, now: Date = SEED_NOW) {
  const diff = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  return formatDate(iso);
}

/* ----------------------------------------------------------------- labels */

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  available: "Disponible",
  reserved: "Réservé",
  under_offer: "Sous offre",
  sold: "Vendu",
  rented: "Loué",
  archived: "Archivé",
};

export const STAGE_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  viewing: "Visite",
  offer: "Offre",
  negotiation: "Négociation",
  won: "Gagné",
  lost: "Perdu",
};

export const TEMPERATURE_LABELS: Record<string, string> = {
  cold: "Froid",
  warm: "Tiède",
  hot: "Chaud",
};

export const ROLE_LABELS: Record<string, string> = {
  buyer: "Acquéreur",
  seller: "Vendeur",
  tenant: "Locataire",
  landlord: "Propriétaire",
  investor: "Investisseur",
};

export const SOURCE_LABELS: Record<string, string> = {
  site_web: "Site web",
  recommandation: "Recommandation",
  portail: "Portail",
  reseaux_sociaux: "Réseaux sociaux",
  telephone: "Téléphone",
  walk_in: "Visite agence",
};

export const APPOINTMENT_LABELS: Record<string, string> = {
  viewing: "Visite",
  valuation: "Estimation",
  signature: "Signature",
  call: "Appel",
  meeting: "Rendez-vous",
};

export const DOCUMENT_LABELS: Record<string, string> = {
  mandat: "Mandat",
  titre_foncier: "Titre foncier",
  compromis: "Compromis",
  contrat: "Contrat",
  facture: "Facture",
  diagnostic: "Diagnostic",
  autre: "Autre",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export const TRANSACTION_STAGE_LABELS: Record<string, string> = {
  interest: "Intérêt",
  visit: "Visite",
  offer: "Offre",
  negotiation: "Négociation",
  agreement: "Accord",
  contract: "Contrat",
  payment: "Paiement",
  closing: "Clôture",
};

export const label = (map: Record<string, string>, key: string) => map[key] ?? key;
