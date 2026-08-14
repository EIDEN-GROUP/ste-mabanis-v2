import { createServerFn } from "@tanstack/react-start";
import { ROLE_STORAGE_KEY, AGENT_STORAGE_KEY } from "./session";
import { STAFF_ROLES, type StaffRole } from "./types";

/**
 * Authentification du back-office.
 *
 * La vérification des identifiants vit côté serveur (voir `verifyLogin`), donc
 * la liste des comptes et leurs mots de passe ne sont jamais envoyés au
 * navigateur. Le ticket de session reste un objet stocké dans le navigateur :
 * c'est une porte, pas une serrure   le jour où Supabase Auth prend la main
 * (voir supabase/migrations), ce fichier est le seul à remplacer, l'écran de
 * connexion n'y touche pas.
 */
export const AUTH_STORAGE_KEY = "mabanis:admin:auth";

export type AdminAccount = {
  email: string;
  role: StaffRole;
  /** Nom affiché après la connexion. */
  name: string;
  /** Le commercial travaille sous l'identité d'un agent du portefeuille. */
  agentId?: string | undefined;
};

/** Le compte avec son mot de passe, côté serveur uniquement. */
type StaffAccount = AdminAccount & { password: string };

const STAFF_ACCOUNTS: StaffAccount[] = [
  {
    email: "direction@mabanis.au",
    password: "Direction2026",
    role: "directrice",
    name: "Direction",
  },
  {
    email: "commercial@mabanis.au",
    password: "Commercial2026",
    role: "commercial",
    name: "Salma Bouhaddou",
    agentId: "salma-bouhaddou",
  },
  {
    email: "assistant@mabanis.au",
    password: "Assistant2026",
    role: "assistant",
    name: "Karim Ouhssaine",
  },
];

/** Vérifie les identifiants et rend le compte public, ou `null`. Côté serveur. */
export const verifyLogin = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const q = (raw ?? {}) as Record<string, unknown>;
    return {
      email: typeof q["email"] === "string" ? q["email"].trim().toLowerCase() : "",
      password: typeof q["password"] === "string" ? q["password"].trim() : "",
    };
  })
  .handler(({ data }) => {
    const account = STAFF_ACCOUNTS.find(
      (a) => a.email === data.email && a.password === data.password,
    );
    if (!account) return null;
    const { password: _password, ...publicAccount } = account;
    return publicAccount;
  });

/** Le compte connecté, ou `null`. À n'appeler que côté navigateur. */
export function readSignedIn(): AdminAccount | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminAccount>;
    if (
      typeof parsed.email !== "string" ||
      !(parsed.role && parsed.role in STAFF_ROLES) ||
      typeof parsed.name !== "string"
    ) {
      return null;
    }
    return parsed as AdminAccount;
  } catch {
    return null;
  }
}

/**
 * « Se souvenir de moi » choisit la durée de vie du ticket : le stockage local
 * survit à la fermeture du navigateur, celui de session non. L'espace de
 * travail, lui, reste dans le stockage local   c'est une préférence, pas une
 * identité, et `SessionProvider` le relit au montage.
 */
export function signIn(account: AdminAccount, remember: boolean) {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  store.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
  other.removeItem(AUTH_STORAGE_KEY);

  localStorage.setItem(ROLE_STORAGE_KEY, account.role);
  if (account.agentId) localStorage.setItem(AGENT_STORAGE_KEY, account.agentId);
  else localStorage.removeItem(AGENT_STORAGE_KEY);
}

export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
