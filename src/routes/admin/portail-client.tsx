import { createFileRoute } from "@tanstack/react-router";
import { Heart, CalendarDays, FolderOpen, GitBranch, ExternalLink } from "lucide-react";
import { Panel } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/portail-client")({
  head: () => ({
    meta: [
      { title: "Portail client   STE MABANIS" },
      { name: "description", content: "Architecture du portail client." },
    ],
  }),
  component: PortailClientPage,
});

const MODULES = [
  {
    icon: Heart,
    title: "Biens favoris",
    detail: "Le client épinglera ses biens préférés pour les retrouver à tout moment.",
    status: "Prévu",
  },
  {
    icon: CalendarDays,
    title: "Mes visites",
    detail: "Récapitulatif des visites programmées, passées et à venir, avec notes de visite.",
    status: "Prévu",
  },
  {
    icon: FolderOpen,
    title: "Mes documents",
    detail: "Pièces du dossier (compromis, contrats, relevés) partagées en un clic par l'agence.",
    status: "Prévu",
  },
  {
    icon: GitBranch,
    title: "Suivi de ma transaction",
    detail:
      "Suivi pas à pas : offre, compromis, financement, acte. Statut mis à jour par l'agence.",
    status: "Prévu",
  },
] as const;

function PortailClientPage() {
  return (
    <div className="space-y-6">
      <Panel>
        <header className="border-b border-line px-5 py-4">
          <h2 className="display text-xl">Portail client</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Espace privé des clients MABANIS : un accès sécurisé pour suivre ses biens favoris, ses
            visites, ses documents et l'avancement de sa transaction. L'espace public sera servi sur
            une route dédiée, alimenté par les mêmes données que le back-office.
          </p>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="flex items-start gap-4 rounded-md border border-line bg-admin-bg/40 p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-sand text-gold">
                <m.icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-navy">{m.title}</h3>
                  <span className="rounded-md border border-gold/50 px-2 py-0.5 text-[0.55rem] tracking-[0.14em] text-gold uppercase">
                    {m.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <header className="border-b border-line px-5 py-4">
          <h2 className="display text-xl">Prochaines étapes</h2>
        </header>
        <ul className="divide-y divide-line overflow-hidden text-sm">
          <li className="flex items-center gap-3 px-5 py-3.5">
            <span className="size-1.5 shrink-0 rounded-full bg-gold" />
            <span className="text-navy">Table clients enrichi</span>
            <span className="ml-auto text-xs text-muted-foreground">
              email vérifié + statut d'invitation
            </span>
          </li>
          <li className="flex items-center gap-3 px-5 py-3.5">
            <span className="size-1.5 shrink-0 rounded-full bg-gold" />
            <span className="text-navy">Page publique /portail/:id</span>
            <span className="ml-auto text-xs text-muted-foreground">accès par lien sécurisé</span>
          </li>
          <li className="flex items-center gap-3 px-5 py-3.5">
            <span className="size-1.5 shrink-0 rounded-full bg-gold" />
            <span className="text-navy">Envoi automatique du lien</span>
            <span className="ml-auto text-xs text-muted-foreground">à la création du client</span>
          </li>
          <li className="flex items-center gap-3 px-5 py-3.5">
            <span className="size-1.5 shrink-0 rounded-full bg-gold" />
            <span className="text-navy">Actions agents</span>
            <span className="ml-auto text-xs text-muted-foreground">
              partage de documents, mise à jour du suivi
            </span>
          </li>
        </ul>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            L'architecture de données (clients, visites, documents, transactions) est déjà en place
              le portail viendra la consommer telle quelle.
          </p>
          <a
            href="/admin/clients"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-2 text-xs tracking-[0.12em] text-navy uppercase transition-colors hover:border-gold hover:text-gold"
          >
            <ExternalLink className="size-3.5" /> Voir les clients
          </a>
        </div>
      </Panel>
    </div>
  );
}
