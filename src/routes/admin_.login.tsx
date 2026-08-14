import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/mabanis-logo.png";
import { EASE } from "@/components/motion";
import { readSignedIn, signIn, verifyLogin, type AdminAccount } from "@/lib/admin/auth";
import { images } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Connexion | Administration STE MABANIS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

const SLIDES = [
  {
    src: images.locationMarina,
    title: "Tout le portefeuille, au même endroit.",
    text: "Biens, mandats, photos et statuts une seule fiche par adresse.",
  },
  {
    src: images.property1,
    title: "Chaque client suivi de bout en bout.",
    text: "Leads, visites et relances dans un pipeline qui ne perd rien.",
  },
  {
    src: images.locationTaghazout,
    title: "Les chiffres de l'agence, en clair.",
    text: "Transactions, honoraires et objectifs, à jour à la minute.",
  },
];

const SLIDE_MS = 5200;

const card = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delayChildren: 0.15, staggerChildren: 0.07 } },
};

const line = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function AdminLogin() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | null>(null);

  // Déjà connecté : la page de garde n'a rien à demander.
  useEffect(() => {
    if (readSignedIn()) navigate({ to: "/admin" });
  }, [navigate]);

  // Défilement automatique du carrousel.
  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current ?? undefined), []);

  /** Petit délai avant d'ouvrir : le bouton a le temps de dire qu'il travaille. */
  const enter = (account: AdminAccount) => {
    setBusy(true);
    setError(null);
    timer.current = window.setTimeout(() => {
      signIn(account, remember);
      navigate({ to: "/admin" });
    }, 550);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const account = await verifyLogin({ data: { email, password } });
    if (!account) {
      setBusy(false);
      setError("Identifiants incorrects. Vérifiez l'adresse et le mot de passe.");
      return;
    }
    enter(account);
  };

  return (
    /* Le rembourrage de lg pose la carte en médaillon ; les calques en
       `absolute inset-0` couvrent quand même l'écran entier   ils se calent sur
       la boîte de padding, pas sur le contenu. */
    <div className="relative flex h-[100svh] flex-col overflow-hidden bg-navy lg:block lg:p-6">
      {/* Plein cadre à partir de lg, bandeau en tête sur téléphone. */}
      <Slides index={slide} className="hidden lg:block" />
      <div className="relative h-[24svh] shrink-0 overflow-hidden lg:hidden">
        <Slides index={slide} />
        <BrandRow className="absolute inset-x-0 top-0 px-5 pt-5" />
      </div>

      <BrandRow className="absolute inset-x-0 top-0 z-20 hidden px-8 pt-8 lg:flex xl:px-12 xl:pt-10" />

      {/* Le discours de la vitrine, calé sur la diapositive affichée. */}
      <div className="absolute bottom-0 left-0 z-20 hidden w-[46%] px-8 pb-10 lg:block xl:px-12 xl:pb-14">
        <motion.p
          key={`title-${slide}`}
          className="display text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[1.05] text-white"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {SLIDES[slide]!.title}
        </motion.p>
        <motion.p
          key={`text-${slide}`}
          className="mt-3 max-w-md text-sm leading-relaxed text-white/65"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
        >
          {SLIDES[slide]!.text}
        </motion.p>

        {/* Trois traits : celui de la diapositive en cours se remplit. */}
        <div className="mt-8 flex items-center gap-3">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Vue ${i + 1}`}
              aria-current={i === slide}
              className="h-px w-14 bg-white/25 transition-colors hover:bg-white/50"
            >
              <span className="block h-px origin-left bg-gold">
                {i === slide ? (
                  <motion.span
                    key={`bar-${slide}`}
                    className="block h-px origin-left bg-gold"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                  />
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex lg:min-h-screen items-center lg:pr-20">
        <motion.div
          className="scrollbar-gold relative z-10 flex flex-1 flex-col overflow-y-auto bg-white [--scroll-track:var(--color-white)] lg:ml-auto lg:w-[44%] lg:max-w-[38rem] lg:flex-none lg:rounded-lg"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div
            className="flex flex-col justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
            variants={card}
            initial="hidden"
            animate="show"
          >
            <div className="mx-auto w-full max-w-[26rem]">
              <motion.h1
                variants={line}
                className="display text-[clamp(1.7rem,3vw,2.2rem)] uppercase text-navy"
              >
                Connexion
              </motion.h1>
              <motion.p variants={line} className="mt-2 text-[0.85rem] text-muted-foreground">
                Connectez-vous pour reprendre la main sur le portefeuille et les clients.
              </motion.p>

              <form onSubmit={submit} className="mt-6">
                <motion.label variants={line} className="block">
                  <span className="text-[0.78rem] font-semibold text-navy">Adresse e-mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="direction@mabanis.au"
                    className="mt-1.5 h-11 w-full rounded-md border border-line bg-white px-4 text-sm text-navy transition-[border-color,box-shadow] duration-300 outline-none placeholder:text-muted-foreground/60 hover:border-navy/30 focus:border-gold focus:ring-2 focus:ring-gold/25"
                  />
                </motion.label>

                <motion.label variants={line} className="mt-4 block">
                  <span className="text-[0.78rem] font-semibold text-navy">Mot de passe</span>
                  <span className="relative mt-1.5 block">
                    <input
                      type={reveal ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 w-full rounded-md border border-line bg-white pr-12 pl-4 text-sm text-navy transition-[border-color,box-shadow] duration-300 outline-none placeholder:text-muted-foreground/60 hover:border-navy/30 focus:border-gold focus:ring-2 focus:ring-gold/25"
                    />
                    <button
                      type="button"
                      onClick={() => setReveal((v) => !v)}
                      aria-label={reveal ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-navy"
                    >
                      {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </span>
                </motion.label>

                <motion.div
                  variants={line}
                  className="mt-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <label className="flex cursor-pointer items-center gap-2.5 text-[0.8rem] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 cursor-pointer accent-navy"
                    />
                    Rester connecté
                  </label>
                  <Link
                    to="/contact"
                    className="link-underline text-[0.8rem] text-navy transition-colors hover:text-gold"
                  >
                    Mot de passe oublié ?
                  </Link>
                </motion.div>

                {/* Le message d'erreur pousse le bouton vers le bas au lieu de le recouvrir. */}
                <motion.p
                  initial={false}
                  animate={
                    error
                      ? { opacity: 1, height: "auto", marginTop: 16 }
                      : { opacity: 0, height: 0, marginTop: 0 }
                  }
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden text-[0.8rem] text-negative"
                  role={error ? "alert" : undefined}
                >
                  {error}
                </motion.p>

                <motion.button
                  variants={line}
                  type="submit"
                  disabled={busy}
                  whileHover={busy ? {} : { y: -2 }}
                  whileTap={busy ? {} : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="btn-sheen group mt-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-md bg-navy text-[0.82rem] font-medium text-white transition-colors duration-500 hover:bg-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </form>

              <motion.p
                variants={line}
                className="mt-6 text-center text-[0.75rem] text-muted-foreground"
              >
                Besoin d'un accès ?{" "}
                <Link to="/contact" className="link-underline text-navy hover:text-gold">
                  Contactez la direction
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/** Logo à gauche, retour au site à droite   la barre qui coiffe la vitrine. */
function BrandRow({ className }: { className?: string }) {
  return (
    <div className={cn("z-20 flex items-center justify-between gap-4", className)}>
      <Link to="/" aria-label="STE MABANIS accueil">
        <img
          src={logo}
          alt="STE MABANIS"
          width={220}
          height={126}
          className="w-28 brightness-0 invert sm:w-32"
        />
      </Link>
      <Link
        to="/"
        className="group inline-flex items-center gap-2 text-[0.72rem] lg:pr-15 tracking-[0.14em] text-white/70 uppercase transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
        Retour au site
      </Link>
    </div>
  );
}

/** Fondu enchaîné entre les trois vues, avec un lent zoom sur celle qui passe. */
function Slides({ index, className }: { index: number; className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-navy", className)}>
      {SLIDES.map((s, i) => (
        <motion.img
          key={s.src}
          src={s.src}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1.09 : 1 }}
          transition={{
            opacity: { duration: 1.2, ease: EASE },
            scale: { duration: SLIDE_MS / 1000 + 1.5, ease: "linear" },
          }}
        />
      ))}
      {/* Voiles : le texte blanc doit tenir sur les trois photos. */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/10" />
      <div className="absolute inset-0 bg-navy/25" />
    </div>
  );
}
