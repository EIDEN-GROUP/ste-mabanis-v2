import logo from "@/assets/mabanis-logo.png";
import { cn } from "@/lib/utils";

/**
 * Le pictogramme seul, découpé dans le logo complet.
 *
 * Le PNG fait 1254 × 717 et son fond est transparent : la `viewBox` cadre juste
 * le bâtiment (288, 32 → 670 × 454) et laisse la signature « STE GESTION ET
 * SERVICES · MABANIS.AU » hors champ. Pas de second fichier à maintenir.
 *
 * `brightness-0 invert` repeint le tracé bleu nuit en blanc   il n'y a rien
 * d'autre dans le cadre, donc seul le pictogramme change de couleur.
 */
export function LogoMark({
  className,
  tone = "white",
}: {
  className?: string;
  tone?: "white" | "brand";
}) {
  return (
    <svg
      viewBox="288 32 670 454"
      className={cn("block w-full", tone === "white" && "brightness-0 invert", className)}
      aria-hidden
      focusable="false"
    >
      <image href={logo} x="0" y="0" width="1254" height="717" />
    </svg>
  );
}
