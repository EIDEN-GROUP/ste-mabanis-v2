import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, BedDouble, Bath, Maximize } from "lucide-react";
import { EASE } from "@/components/motion";
import { formatMAD, type Property } from "@/lib/site-data";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(property.slug);

  return (
    <motion.article
      className={cn("group relative flex flex-col rounded-md bg-card shadow-card", className)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <Link
        to="/proprietes/$slug"
        params={{ slug: property.slug }}
        className="zoom-frame relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          width={1280}
          height={960}
          className="h-full w-full rounded-md object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-navy/90 px-3 py-1.5 text-[0.6rem] tracking-[0.18em] rounded-md text-white uppercase backdrop-blur">
            {property.transaction === "vente" ? "À vendre" : "À louer"}
          </span>
          {property.isNew ? (
            <span className="bg-gold rounded-md px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-navy uppercase">
              Nouveau
            </span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={fav}
        onClick={() => toggle(property.slug)}
        className="absolute rounded-full top-3.5 right-3.5 grid size-9 place-items-center bg-white/90 backdrop-blur transition-colors hover:bg-white"
      >
        <Heart
          className={cn("size-4 transition-colors", fav ? "fill-gold text-gold" : "text-navy/60")}
        />
      </button>

      <div className="flex flex-1 flex-col border-line p-5 sm:p-6">
        <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
          {property.type} · {property.neighborhood}
        </p>
        <h3 className="display mt-2.5 text-2xl">
          <Link to="/proprietes/$slug" params={{ slug: property.slug }} className="link-underline">
            {property.title}
          </Link>
        </h3>
        <p className="mt-3 text-lg font-medium tracking-tight text-blue">
          {formatMAD(property.price)} MAD
          {property.priceNote ? (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {property.priceNote}
            </span>
          ) : null}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Maximize className="size-3.5 text-gold" /> {property.surface} m²
          </span>
          {property.bedrooms > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-gold" /> {property.bedrooms} ch.
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-3.5 text-gold" /> {property.bathrooms} sdb
          </span>
          <span className="ml-auto tracking-[0.12em]">{property.reference}</span>
        </div>
      </div>
    </motion.article>
  );
}
