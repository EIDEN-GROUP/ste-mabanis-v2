import type { StaffRole } from "./types";

/**
 * Role matrix for the back office. Screen access and fine-grained actions are
 * declared here so the UI can gate buttons and whole screens from one place.
 * Delete is always reserved for the Directrice.
 */
export type AdminAction =
  | "screen.design"
  | "screen.rapports"
  | "screen.automatisations"
  | "screen.marketing"
  | "screen.portail-client"
  | "screen.matching"
  | "screen.crm"
  | "screen.agenda"
  | "screen.transactions"
  | "screen.documents"
  | "screen.taches"
  | "screen.proprietes"
  | "screen.clients"
  | "property.create"
  | "property.edit"
  | "property.delete"
  | "client.create"
  | "client.edit"
  | "client.delete"
  | "lead.move"
  | "lead.convert"
  | "lead.delete"
  | "appointment.manage"
  | "transaction.manage"
  | "transaction.delete"
  | "document.manage"
  | "task.manage"
  | "report.export"
  | "campaign.manage"
  | "automation.toggle"
  | "match.send";

const ALL: StaffRole[] = ["directrice", "commercial", "assistant"];
const SALES: StaffRole[] = ["directrice", "commercial"];

export const ACTION_ROLES: Record<AdminAction, readonly StaffRole[]> = {
  "screen.design": ["directrice"],
  "screen.rapports": ["directrice"],
  "screen.automatisations": ["directrice"],
  "screen.marketing": ["directrice"],
  "screen.portail-client": ["directrice"],
  "screen.matching": SALES,
  "screen.crm": SALES,
  "screen.agenda": ALL,
  "screen.transactions": ALL,
  "screen.documents": ALL,
  "screen.taches": ALL,
  "screen.proprietes": ALL,
  "screen.clients": ALL,
  "property.create": ["directrice"],
  "property.edit": SALES,
  "property.delete": ["directrice"],
  "client.create": ALL,
  "client.edit": ALL,
  "client.delete": ["directrice"],
  "lead.move": SALES,
  "lead.convert": SALES,
  "lead.delete": ["directrice"],
  "appointment.manage": ALL,
  "transaction.manage": ["directrice"],
  "transaction.delete": ["directrice"],
  "document.manage": ["directrice", "assistant"],
  "task.manage": ALL,
  "report.export": ["directrice"],
  "campaign.manage": ["directrice"],
  "automation.toggle": ["directrice"],
  "match.send": SALES,
};

export function can(role: StaffRole, action: AdminAction): boolean {
  return ACTION_ROLES[action].includes(role);
}
