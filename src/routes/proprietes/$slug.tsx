import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Phone,
  Mail,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { Section, SectionHeading } from "@/components/layout-bits";
import { PropertyCard } from "@/components/property-card";
import { LeadForm } from "@/components/lead-form";
import { useFavorites } from "@/hooks/use-favorites";
import { agency, formatMAD, getAgent, getProperty, properties } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proprietes/$slug")({
  loader: ({ params }) => {
    const property = getProperty(params.slug);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Bien indisponible   STE MABANIS" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.property;
    const title = `${p.title}   ${formatMAD(p.price)} MAD | STE MABANIS`;
    const description = `${p.type} de ${p.surface} m² à ${p.neighborhood}, ${p.city}. ${p.bedrooms} chambres, ${p.bathrooms} salles de bain. Référence ${p.reference}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PropertyDetail,
});

function PropertyDetail() {
  const { property } = Route.useLoaderData();
  const agent = getAgent(property.agentSlug);
  const [active, setActive] = useState(0);
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(property.slug);

  const similar = properties
    .filter((p) => p.slug !== property.slug && p.transaction === property.transaction)
    .slice(0, 3);

  return (
    <>
      {/* Gallery */}
      <section className="bg-navy pt-24 sm:pt-28">
        <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-21/9">
          {property.images.map((src: string, i: number) => (
            <img
              key={src + i}
              src={src}
              alt={`${property.title}   photo ${i + 1}`}
              width={1280}
              height={960}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                i === active ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/30" />

          <button
            type="button"
            aria-label="Photo précédente"
            onClick={() =>
              setActive((a) => (a - 1 + property.images.length) % property.images.length)
            }
            className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center bg-white/85 text-navy transition-colors hover:bg-gold sm:left-6"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={() => setActive((a) => (a + 1) % property.images.length)}
            className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center bg-white/85 text-navy transition-colors hover:bg-gold sm:right-6"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {property.images.map((src: string, i: number) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Voir la photo ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1 transition-all duration-500",
                  i === active ? "w-10 bg-gold" : "w-5 bg-white/50",
                )}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-[100rem] grid-cols-4 gap-2 px-5 py-4 sm:px-8 lg:px-12">
          {property.images.map((src: string, i: number) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-4/3 overflow-hidden transition-opacity",
                i === active ? "opacity-100 ring-1 ring-gold" : "opacity-50 hover:opacity-85",
              )}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                width={320}
                height={240}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[100rem] gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-navy px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-white uppercase">
                  {property.transaction === "vente" ? "À vendre" : "À louer"}
                </span>
                <span className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                  Réf. {property.reference}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(property.slug)}
                  className="ml-auto inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors hover:border-gold"
                >
                  <Heart className={cn("size-3.5", fav ? "fill-gold text-gold" : "text-navy/60")} />
                  {fav ? "Enregistré" : "Enregistrer"}
                </button>
              </div>

              <h1 className="display mt-5 text-[clamp(2.25rem,5vw,4rem)]">{property.title}</h1>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-gold" />
                {property.neighborhood}, {property.city}
              </p>
              <p className="display mt-6 text-4xl text-blue">
                {formatMAD(property.price)} MAD
                {property.priceNote ? (
                  <span className="ml-2 font-sans text-sm text-muted-foreground">
                    {property.priceNote}
                  </span>
                ) : null}
              </p>
            </Reveal>

            <Reveal className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              <Spec
                icon={<Maximize className="size-4 text-gold" />}
                value={`${property.surface} m²`}
                label="Surface habitable"
              />
              <Spec
                icon={<BedDouble className="size-4 text-gold" />}
                value={`${property.bedrooms}`}
                label="Chambres"
              />
              <Spec
                icon={<Bath className="size-4 text-gold" />}
                value={`${property.bathrooms}`}
                label="Salles de bain"
              />
              <Spec
                icon={<CalendarClock className="size-4 text-gold" />}
                value={`${property.year}`}
                label="Année"
              />
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="display rule-gold text-3xl">Le bien</h2>
              <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-foreground/85">
                {property.description.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="display rule-gold text-3xl">Prestations</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {property.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="display rule-gold text-3xl">Situation</h2>
              <div className="mt-5 aspect-16/9 w-full overflow-hidden rounded-md border border-line">
                <iframe
                  title={`Carte   ${property.neighborhood}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property.mapQuery)}&output=embed`}
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {agent ? (
              <div className="rounded-md border border-line bg-card p-6 shadow-card">
                <p className="eyebrow">Votre interlocuteur</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="display grid size-14 place-items-center bg-navy text-xl text-gold">
                    {agent.initials}
                  </span>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <a
                    href={`tel:${agent.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Phone className="size-3.5 text-gold" /> {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <Mail className="size-3.5 text-gold" /> {agent.email}
                  </a>
                </div>
                <Link
                  to="/equipe/$slug"
                  params={{ slug: agent.slug }}
                  className="link-underline mt-5 inline-block text-xs tracking-[0.16em] uppercase"
                >
                  Voir son profil
                </Link>
              </div>
            ) : null}

            <div className="mt-6">
              <LeadForm
                intent={`property:${property.reference}`}
                submitLabel="Planifier une visite"
                note={`Réf. ${property.reference}   nous vous proposons deux créneaux sous 24 h.`}
                fields={[
                  { name: "nom", label: "Nom et prénom", required: true },
                  { name: "telephone", label: "Téléphone", type: "tel", required: true },
                  { name: "email", label: "E-mail", type: "email", required: true, full: true },
                  {
                    name: "creneau",
                    label: "Créneau souhaité",
                    type: "select",
                    options: [
                      "En semaine, matin",
                      "En semaine, après-midi",
                      "Samedi matin",
                      "Visite en visioconférence",
                    ],
                    required: true,
                    full: true,
                  },
                  {
                    name: "message",
                    label: "Demander plus d'informations",
                    type: "textarea",
                    placeholder: "Charges, travaux, titre foncier, financement…",
                  },
                ]}
              />
            </div>

            <a
              href={`https://wa.me/${agency.whatsapp}?text=${encodeURIComponent(
                `Bonjour, je suis intéressé par le bien ${property.reference}   ${property.title}.`,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 block rounded-md border border-navy px-6 py-3.5 text-center text-[0.7rem] tracking-[0.18em] uppercase transition-colors hover:bg-navy hover:text-white"
            >
              Échanger sur WhatsApp
            </a>
          </aside>
        </div>
      </section>

      <Section tone="sand">
        <SectionHeading eyebrow="À découvrir aussi" title="Biens similaires" />
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {similar.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <PropertyCard property={p} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

function Spec({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-background p-5">
      {icon}
      <p className="display mt-2 text-2xl">{value}</p>
      <p className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
