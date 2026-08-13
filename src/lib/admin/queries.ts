/**
 * TanStack Query bindings for the admin. Screens import these, never the
 * server functions directly, so cache keys stay consistent.
 */

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ActivityInput,
  AppointmentInput,
  CampaignInput,
  ClientInput,
  ClientQuery,
  DocumentInput,
  LeadInput,
  MediaInput,
  NotificationInput,
  Patch,
  PropertyInput,
  PropertyQuery,
  PublicLeadInput,
  ReportQuery,
  TaskInput,
  TransactionInput,
} from "./repository";
import {
  addActivity,
  addPayment,
  addPropertyMedia,
  createAppointment,
  createCallbackTask,
  createCampaign,
  createClient,
  createDocument,
  createLead,
  createNotification,
  createProperty,
  createPublicLead,
  createTask,
  createTransaction,
  deleteCampaign,
  deleteDocument,
  fetchActivities,
  fetchAgents,
  fetchAppointments,
  fetchAutomations,
  fetchCampaigns,
  fetchClient,
  fetchClients,
  fetchDashboard,
  fetchDocuments,
  fetchInactiveLeads,
  fetchLead,
  fetchLeads,
  fetchMarketingStats,
  fetchMatchesForClient,
  fetchMatchesForProperty,
  fetchNotifications,
  fetchPriorities,
  fetchProperties,
  fetchProperty,
  fetchReport,
  fetchTasks,
  fetchTransactions,
  markPaymentPaid,
  moveLead,
  movePropertyMedia,
  moveTransactionStage,
  readAllNotifications,
  readNotification,
  removeFeatured,
  removePropertyMedia,
  saveViewingReport,
  sendCampaign,
  sendMatchesToClient,
  setAppointmentStatus,
  setAutomationFlag,
  setFeatured,
  setPropertyStatus,
  updateAppointment,
  updateClient,
  updateLead,
  updateProperty,
  updatePropertyMedia,
  updateTask,
} from "./server";
import type {
  AutomationRuleKey,
  PipelineStage,
  PropertyStatus,
  ReportKey,
  TransactionStage,
} from "./types";

export const adminKeys = {
  all: ["admin"] as const,
  properties: (q: PropertyQuery = {}) => ["admin", "properties", q] as const,
  property: (id: string) => ["admin", "property", id] as const,
  clients: (q: ClientQuery = {}) => ["admin", "clients", q] as const,
  client: (id: string) => ["admin", "client", id] as const,
  leads: () => ["admin", "leads"] as const,
  lead: (id: string) => ["admin", "lead", id] as const,
  agents: () => ["admin", "agents"] as const,
  activities: (f: Record<string, string | undefined> = {}) => ["admin", "activities", f] as const,
  appointments: () => ["admin", "appointments"] as const,
  documents: () => ["admin", "documents"] as const,
  tasks: () => ["admin", "tasks"] as const,
  transactions: () => ["admin", "transactions"] as const,
  notifications: () => ["admin", "notifications"] as const,
  dashboard: () => ["admin", "dashboard"] as const,
  priorities: (agentId?: string) => ["admin", "priorities", agentId] as const,
  campaigns: () => ["admin", "campaigns"] as const,
  marketingStats: () => ["admin", "marketingStats"] as const,
  featured: () => ["admin", "featured"] as const,
  matchesForClient: (clientId: string) => ["admin", "matches", "client", clientId] as const,
  matchesForProperty: (propertyId: string) => ["admin", "matches", "property", propertyId] as const,
  automations: () => ["admin", "automations"] as const,
  inactiveLeads: () => ["admin", "inactiveLeads"] as const,
  report: (key: string, from?: string, to?: string) => ["admin", "report", key, from, to] as const,
};

export const propertiesQuery = (q: PropertyQuery = {}) =>
  queryOptions({
    queryKey: adminKeys.properties(q),
    queryFn: () => fetchProperties({ data: q }),
  });

export const propertyQuery = (id: string) =>
  queryOptions({
    queryKey: adminKeys.property(id),
    queryFn: () => fetchProperty({ data: id }),
  });

export const clientsQuery = (q: ClientQuery = {}) =>
  queryOptions({
    queryKey: adminKeys.clients(q),
    queryFn: () => fetchClients({ data: q }),
  });

export const clientQuery = (id: string) =>
  queryOptions({
    queryKey: adminKeys.client(id),
    queryFn: () => fetchClient({ data: id }),
  });

export const leadsQuery = () =>
  queryOptions({ queryKey: adminKeys.leads(), queryFn: () => fetchLeads() });

export const leadQuery = (id: string) =>
  queryOptions({ queryKey: adminKeys.lead(id), queryFn: () => fetchLead({ data: id }) });

export const agentsQuery = () =>
  queryOptions({ queryKey: adminKeys.agents(), queryFn: () => fetchAgents() });

export const activitiesQuery = (
  f: { clientId?: string; leadId?: string; propertyId?: string } = {},
) =>
  queryOptions({
    queryKey: adminKeys.activities(f),
    queryFn: () => fetchActivities({ data: f }),
  });

export const appointmentsQuery = () =>
  queryOptions({ queryKey: adminKeys.appointments(), queryFn: () => fetchAppointments() });

export const documentsQuery = () =>
  queryOptions({ queryKey: adminKeys.documents(), queryFn: () => fetchDocuments() });

export const tasksQuery = () =>
  queryOptions({ queryKey: adminKeys.tasks(), queryFn: () => fetchTasks() });

export const transactionsQuery = () =>
  queryOptions({ queryKey: adminKeys.transactions(), queryFn: () => fetchTransactions() });

export const notificationsQuery = () =>
  queryOptions({ queryKey: adminKeys.notifications(), queryFn: () => fetchNotifications() });

export const dashboardQuery = () =>
  queryOptions({ queryKey: adminKeys.dashboard(), queryFn: () => fetchDashboard() });

export const prioritiesQuery = (agentId?: string) =>
  queryOptions({
    queryKey: adminKeys.priorities(agentId),
    queryFn: () => fetchPriorities({ data: { agentId } }),
  });

export const campaignsQuery = () =>
  queryOptions({ queryKey: adminKeys.campaigns(), queryFn: () => fetchCampaigns() });

export const marketingStatsQuery = () =>
  queryOptions({ queryKey: adminKeys.marketingStats(), queryFn: () => fetchMarketingStats() });

export const automationsQuery = () =>
  queryOptions({ queryKey: adminKeys.automations(), queryFn: () => fetchAutomations() });

export const inactiveLeadsQuery = () =>
  queryOptions({ queryKey: adminKeys.inactiveLeads(), queryFn: () => fetchInactiveLeads() });

export const matchesForClientQuery = (clientId: string) =>
  queryOptions({
    queryKey: adminKeys.matchesForClient(clientId),
    queryFn: () => fetchMatchesForClient({ data: { clientId } }),
    enabled: Boolean(clientId),
  });

export const matchesForPropertyQuery = (propertyId: string) =>
  queryOptions({
    queryKey: adminKeys.matchesForProperty(propertyId),
    queryFn: () => fetchMatchesForProperty({ data: { propertyId } }),
    enabled: Boolean(propertyId),
  });

export const reportQuery = (key: ReportKey, from?: string, to?: string) =>
  queryOptions({
    queryKey: adminKeys.report(key, from, to),
    queryFn: () => fetchReport({ data: { key, q: { from, to } } }),
  });

/* -------------------------------------------------------------- mutations */

/** Invalidate every list that a write can affect. */
function invalidateAfterWrite(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: adminKeys.all });
}

export function useSetPropertyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: PropertyStatus }) => setPropertyStatus({ data: vars }),
    // A status change can remove a property from public results, so refresh
    // the dashboard counts alongside the lists.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: PropertyInput) => createProperty({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: Patch<PropertyInput> }) =>
      updateProperty({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useAddPropertyMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { propertyId: string; items: MediaInput[] }) =>
      addPropertyMedia({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdatePropertyMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: { label?: string; isCover?: boolean } }) =>
      updatePropertyMedia({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useMovePropertyMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; direction: -1 | 1 }) => movePropertyMedia({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useRemovePropertyMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removePropertyMedia({ data: { id } }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: ClientInput) => createClient({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: Patch<ClientInput> }) => updateClient({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useAddActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: ActivityInput) => addActivity({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: LeadInput) => createLead({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreatePublicLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: PublicLeadInput) => createPublicLead({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: Patch<LeadInput> }) => updateLead({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useMoveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; stage: PipelineStage }) => moveLead({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: AppointmentInput) => createAppointment({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: Patch<AppointmentInput> }) =>
      updateAppointment({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useSetAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: string }) => setAppointmentStatus({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useSaveViewingReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      report: { interest: number; outcome: string; nextAction?: string };
    }) => saveViewingReport({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: DocumentInput) => createDocument({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument({ data: id }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TaskInput) => createTask({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: Patch<TaskInput> }) => updateTask({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TransactionInput) => createTransaction({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useMoveTransactionStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; stage: TransactionStage }) =>
      moveTransactionStage({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { transactionId: string; label: string; amount: number; dueAt: string }) =>
      addPayment({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useMarkPaymentPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { transactionId: string; paymentId: string }) =>
      markPaymentPaid({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: NotificationInput) => createNotification({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useReadNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readNotification({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.notifications() }),
  });
}

export function useReadAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => readAllNotifications(),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.notifications() }),
  });
}

/* ---------------------------------------------------------------- marketing */

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CampaignInput) => createCampaign({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendCampaign({ data: { id } }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampaign({ data: { id } }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useSetFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { propertyId: string; until: string }) => setFeatured({ data: vars }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

export function useRemoveFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => removeFeatured({ data: { propertyId } }),
    onSuccess: () => invalidateAfterWrite(qc),
  });
}

/* ---------------------------------------------------------------- matching */

export function useSendMatches() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { clientId: string; propertyIds: string[] }) =>
      sendMatchesToClient({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

/* -------------------------------------------------------------- automations */

export function useSetAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { key: AutomationRuleKey; enabled: boolean }) =>
      setAutomationFlag({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.automations() });
    },
  });
}

export function useCreateCallbackTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => createCallbackTask({ data: { leadId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
