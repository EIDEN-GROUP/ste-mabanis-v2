import { createFileRoute, notFound } from "@tanstack/react-router";
import { Phone, Mail } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/layout-bits";
import { Reveal } from "@/components/motion";
import { PropertyCard } from "@/components/property-card";
import { LeadForm } from "@/components/lead-form";
import { getAgent, propertiesByAgent } from "@/lib/site-data";

export const Route = createFileRoute("/equipe/$slug")({
  loader: ({ params }) => {
    const agent = getAgent(params.slug);
    if (!agent) throw notFound();
    return { agent, listings: propertiesByAgent(agent.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Conseiller introuvable — STE MABANIS" }, { name: "robots", content: "noindex" }],
      };
    }
    const a = loaderData.agent;
    const title = `${a.name} — ${a.role} | STE MABANIS`;
    const description = `${a.name}, ${a.years} ans d'expérience à Agadir. Spécialités : ${a.expertise}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AgentPage,
});

function AgentPage() {
  const { agent, listings } = Route.useLoaderData();

  return (
    <>
      <PageHero eyebrow={agent.role} title={agent.name} intro={agent.bio}>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/75">
          <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2">
            <Phone className="size-4 text-gold" /> {agent.phone}
          </a>
          <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-2">
            <Mail className="size-4 text-gold" /> {agent.email}
          </a>
          <span>{agent.years} ans d'expérience · {agent.languages}</span>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Portefeuille"
              title={`Les biens suivis par ${agent.name.split(" ")[0]}`}
            />
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {listings.map((p: import("@/lib/site-data").Property, i: number) => (
                <Reveal key={p.slug} delay={i * 70}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <LeadForm
              intent={`agent:${agent.slug}`}
              submitLabel={`Contacter ${agent.name.split(" ")[0]}`}
              note="Réponse sous 24 heures ouvrées."
              fields={[
                { name: "nom", label: "Nom et prénom", required: true },
                { name: "telephone", label: "Téléphone", type: "tel", required: true },
                { name: "email", label: "E-mail", type: "email", required: true, full: true },
                { name: "message", label: "Votre message", type: "textarea", required: true },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
