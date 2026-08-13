import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHero, Section } from "@/components/layout-bits";
import { Reveal } from "@/components/motion";
import { LeadForm } from "@/components/lead-form";
import { agency } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — STE MABANIS, agence immobilière à Agadir" },
      {
        name: "description",
        content:
          "Contactez STE MABANIS : avenue Hassan II à Agadir, téléphone, e-mail, WhatsApp et prise de rendez-vous en agence ou en visioconférence.",
      },
      { property: "og:title", content: "Contact — STE MABANIS Agadir" },
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
      <PageHero
        eyebrow="Contact"
        title="Dites-nous où vous en êtes."
        intro="Achat, vente, location, gestion ou simple question sur le marché : la première conversation est toujours gratuite."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="space-y-8">
            <div>
              <p className="eyebrow">Agence d'Agadir</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>{agency.address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    <a href={`tel:${agency.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                      {agency.phone}
                    </a>
                    <br />
                    <a href={`tel:${agency.mobile.replace(/\s/g, "")}`} className="hover:text-gold">
                      {agency.mobile}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                  <a href={`mailto:${agency.email}`} className="hover:text-gold">
                    {agency.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>{agency.hours}</span>
                </li>
              </ul>

              <a
                href={`https://wa.me/${agency.whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-7 inline-flex items-center gap-2 bg-navy px-6 py-3.5 text-[0.7rem] tracking-[0.18em] text-white uppercase transition-colors hover:bg-gold hover:text-navy"
              >
                <MessageCircle className="size-4" /> Écrire sur WhatsApp
              </a>
            </div>

            <div className="aspect-4/3 w-full overflow-hidden border border-line">
              <iframe
                title="Localisation de l'agence STE MABANIS à Agadir"
                src="https://www.google.com/maps?q=Avenue%20Hassan%20II%2C%20Agadir%2C%20Maroc&output=embed"
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <LeadForm
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
          </Reveal>
        </div>
      </Section>
    </>
  );
}
