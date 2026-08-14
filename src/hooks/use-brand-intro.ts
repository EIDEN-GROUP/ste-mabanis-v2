import { useEffect, useState } from "react";

export type IntroPhase = "in" | "out" | "done";

/** Repères de la séquence d'ouverture, en millisecondes. */
const TIMING = {
  /** Le rideau commence à se relever. */
  exit: 1850,
  /** Dernière lame partie : le rideau peut quitter l'arbre. */
  end: 2950,
};

/**
 * L'horloge du rideau d'ouverture, partagée par le rideau lui-même et par la
 * page qui remonte derrière lui   les deux gestes doivent partir ensemble.
 *
 * `skipped` distingue le vrai premier chargement d'un retour dans la même
 * session : là, il n'y a rien à jouer, la page est simplement déjà là.
 */
export function useBrandIntro() {
  const [phase, setPhase] = useState<IntroPhase>("in");
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mabanis:loaded")) {
      setSkipped(true);
      setPhase("done");
      return;
    }
    const t1 = setTimeout(() => setPhase("out"), TIMING.exit);
    const t2 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("mabanis:loaded", "1");
    }, TIMING.end);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return { phase, skipped };
}
