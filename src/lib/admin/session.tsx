import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AGENT_STAFF_ROLE, STAFF_ROLES, type RoleInfo, type StaffRole } from "./types";
import { seedAgents } from "./seed";
import { can, type AdminAction } from "./permissions";

export const ROLE_STORAGE_KEY = "mabanis:admin:role";
export const AGENT_STORAGE_KEY = "mabanis:admin:agent";

const VALID_ROLES: StaffRole[] = ["directrice", "commercial", "assistant"];

export type Session = {
  role: StaffRole;
  roleInfo: RoleInfo;
  /** Identity of the logged-in agent (the agent whose records are scoped). */
  agentId: string | null;
  switchRole: (role: StaffRole) => void;
  switchAgent: (agentId: string | null) => void;
  can: (action: AdminAction) => boolean;
};

const SessionContext = createContext<Session | null>(null);

function agentsFor(role: StaffRole) {
  return seedAgents.filter((a) => AGENT_STAFF_ROLE[a.id] === role);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<StaffRole>("directrice");
  const [agentId, setAgentId] = useState<string | null>(null);

  // Read the stored workspace after mount so SSR and hydration agree.
  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    if (VALID_ROLES.includes(savedRole as StaffRole)) {
      setRole(savedRole as StaffRole);
      const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
      if (savedAgent) setAgentId(savedAgent);
    }
  }, []);

  const switchRole = useCallback((next: StaffRole) => {
    setRole(next);
    localStorage.setItem(ROLE_STORAGE_KEY, next);
    if (next !== "commercial") {
      setAgentId(null);
      localStorage.removeItem(AGENT_STORAGE_KEY);
    }
  }, []);

  const switchAgent = useCallback((next: string | null) => {
    setAgentId(next);
    if (next) localStorage.setItem(AGENT_STORAGE_KEY, next);
    else localStorage.removeItem(AGENT_STORAGE_KEY);
  }, []);

  const value = useMemo<Session>(() => {
    // A commercial always acts as one of the commercial agents.
    const effectiveAgent =
      role === "commercial" &&
      agentId &&
      agentsFor("commercial").some((a) => a.id === agentId)
        ? agentId
        : role === "commercial"
          ? (agentsFor("commercial")[0]?.id ?? null)
          : agentId;
    return {
      role,
      roleInfo: STAFF_ROLES[role],
      agentId: effectiveAgent,
      switchRole,
      switchAgent,
      can: (action) => can(role, action),
    };
  }, [role, agentId, switchRole, switchAgent]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

/** True when the current session is scoped to a single agent's records. */
export function useAgentScope(): string | null {
  const { role, agentId } = useSession();
  return role === "commercial" ? agentId : null;
}

export function useCan(action: AdminAction): boolean {
  const { can: has } = useSession();
  return has(action);
}

/** Renders children only when the current role may perform the action. */
export function RoleGate({
  action,
  children,
}: {
  action: AdminAction;
  children: ReactNode;
}) {
  const allowed = useCan(action);
  return allowed ? <>{children}</> : null;
}

export function useAgentsForRole(role: StaffRole) {
  return useMemo(() => agentsFor(role), [role]);
}
