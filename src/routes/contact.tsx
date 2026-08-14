import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AtSign,
  Building2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Section } from "@/components/layout-bits";
import { MaskReveal, Reveal, TextReveal } from "@/components/motion";
import { LeadForm } from "@/components/lead-form";
import { agency, socials } from "@/lib/site-data";

/** Lucide has no Threads glyph; the @ mark stands in for the handle. */
const SOCIAL_ICONS = { Instagram, Threads: AtSign, Facebook } as const;

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(agency.mapQuery)}&z=14&output=embed`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.mapQuery)}`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact   STE MABANIS, agence immobilière à Anza, Agadir" },
      {
        name: "description",
        content:
          "Contactez STE MABANIS à Anza, Agadir : adresse, téléphone, WhatsApp, e-mail et formulaire de demande. Un conseiller vous répond sous 24 heures ouvrées.",
      },
      { property: "og:title", content: "Contact   STE MABANIS Agadir" },
      {
        property: "og:description",
        content: "Un conseiller vous répond sous 24 heures ouvrées.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      {/* The map is the hero. It stays interactive: the veil above it is inert
          and only exists so the transparent header keeps its contrast. */}
      <section className="relative h-[58svh] min-h-[30rem] w-full overflow-hidden bg-navy sm:h-[62svh]">
        <iframe
          title={`Localisation de ${agency.name} à ${agency.area}`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="map-dark absolute inset-0 size-full border-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/10 to-ink/70"
        />
      </section>

      {/* The card climbs over the map, as in the reference. */}
      <section className="relative z-10 -mt-28 px-5 sm:-mt-36 sm:px-8 lg:px-12">
        <MaskReveal className="mx-auto max-w-3xl rounded-md bg-ink text-white shadow-elegant">
          <div className="p-7 sm:p-10 lg:p-14">
            <p className="eyebrow flex items-center gap-4">
              <span className="h-px w-10 bg-gold" />
              Contact
            </p>
            <h1 className="display mt-6 text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.98]">
              <TextReveal text="Écrivez-nous" delay={120} />
            </h1>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/65">
              Achat, vente, location, gestion ou simple question sur le marché d'Agadir : dites-nous
              où vous en êtes. La première conversation est toujours gratuite, et un conseiller vous
              répond sous 24 heures ouvrées.
            </p>

            <div className="mt-10">
              <LeadForm
                tone="navy"
                frame={false}
                intent="contact"
                submitLabel="Envoyer ma demande"
                note="Vos coordonnées ne sont utilisées que pour traiter votre demande."
                fields={[
                  { name: "nom", label: "Nom et prénom", required: true },
                  { name: "telephone", label: "Téléphone", type: "tel", required: true },
                  { name: "email", label: "E-mail", type: "email", required: true, full: true },
                  {
                    name: "sujet",
                    label: "Votre demande",
                    type: "select",
                    required: true,
                    full: true,
                    options: [
                      "Acheter un bien",
                      "Vendre un bien",
                      "Louer un bien",
                      "Demander une estimation",
                      "Confier mon bien en gestion",
                      "Prendre rendez-vous en agence",
                      "Autre question",
                    ],
                  },
                  {
                    name: "message",
                    label: "Message",
                    type: "textarea",
                    required: true,
                    placeholder: "Décrivez votre projet, votre budget et vos délais.",
                  },
                ]}
              />
            </div>
          </div>
        </MaskReveal>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard icon={<MapPin className="size-4" />} title="Adresse" delay={0}>
            <p className="leading-relaxed">{agency.address}</p>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-3 inline-block text-[0.68rem] tracking-[0.16em] uppercase"
            >
              Ouvrir dans Maps
            </a>
          </InfoCard>

          <InfoCard icon={<Phone className="size-4" />} title="Téléphone" delay={70}>
            <a href={`tel:${agency.phone.replace(/\s/g, "")}`} className="block hover:text-gold">
              {agency.phone}
            </a>
            <a
              href={`tel:${agency.mobile.replace(/\s/g, "")}`}
              className="mt-1.5 block hover:text-gold"
            >
              {agency.mobile}
            </a>
            <a
              href={`https://wa.me/${agency.whatsapp}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-2 text-[0.68rem] tracking-[0.16em] uppercase transition-colors hover:text-gold"
            >
              <MessageCircle className="size-3.5 text-gold" /> Écrire sur WhatsApp
            </a>
          </InfoCard>

          <InfoCard icon={<Mail className="size-4" />} title="E-mail" delay={140}>
            <a href={`mailto:${agency.email}`} className="hover:text-gold">
              {agency.email}
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Réponse sous 24 heures ouvrées, pièces jointes bienvenues.
            </p>
          </InfoCard>

          <InfoCard icon={<Clock className="size-4" />} title="Horaires" delay={210}>
            <p className="leading-relaxed">{agency.hours}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Visites possibles hors horaires, sur rendez-vous.
            </p>
          </InfoCard>

          <InfoCard icon={<Building2 className="size-4" />} title="L'entreprise" delay={280}>
            <p className="leading-relaxed">{agency.legalName}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {agency.activity} · {agency.legalForm} · Capital {agency.capital}
            </p>
          </InfoCard>

          <InfoCard icon={<Instagram className="size-4" />} title="Réseaux" delay={350}>
            <ul className="space-y-2">
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.label];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
                    >
                      <Icon className="size-3.5 text-gold" />
                      {social.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </InfoCard>
        </div>
      </Section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  delay,
  children,
}: {
  icon: ReactNode;
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <Reveal
      delay={delay}
      className="rounded-md border border-line bg-card p-7 transition-colors duration-700 hover:border-gold/40"
    >
      <p className="flex items-center gap-3 text-gold">
        {icon}
        <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          {title}
        </span>
      </p>
      <div className="mt-4 text-sm">{children}</div>
    </Reveal>
  );
}
