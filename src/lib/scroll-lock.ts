/**
 * Gel de la page pendant qu'un panneau la recouvre   menu, tiroir, fiche.
 *
 * `overflow: hidden` sur le corps ne suffit pas sur iOS : Safari continue de
 * faire glisser la page sous le panneau. La parade est de sortir le corps du
 * flux (`position: fixed`) en compensant la position de défilement, puis de la
 * rendre telle quelle à la réouverture.
 *
 * Le compteur permet à deux panneaux de se superposer sans que la fermeture du
 * premier ne dégèle la page sous le second.
 */

type Pauser = (locked: boolean, position: number) => void;

let pauser: Pauser | null = null;
let locks = 0;
let lockedAt = 0;

/**
 * Le défilement inertiel (Lenis) doit s'arrêter en même temps que la page gèle.
 * Il s'inscrit ici pour que ce module n'ait rien à savoir de lui   et pour que
 * le back-office, qui ne l'embarque pas, n'en tire pas la dépendance.
 */
export function registerScrollPauser(fn: Pauser | null) {
  pauser = fn;
}

export function setScrollLocked(locked: boolean) {
  if (typeof document === "undefined") return;
  const body = document.body;

  if (locked) {
    locks += 1;
    if (locks > 1) return;
    lockedAt = window.scrollY;
    pauser?.(true, lockedAt);
    body.style.position = "fixed";
    body.style.top = `-${lockedAt}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return;
  }

  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  window.scrollTo(0, lockedAt);
  pauser?.(false, lockedAt);
}
