import { useEffect, useState } from "react";
import logo from "@/assets/mabanis-favicon.png";

export function BrandLoader() {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");

  useEffect(() => {
    if (sessionStorage.getItem("mabanis:loaded")) {
      setPhase("done");
      return;
    }
    const t1 = setTimeout(() => setPhase("out"), 1350);
    const t2 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("mabanis:loaded", "1");
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy transition-[opacity,clip-path] duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
      style={
        phase === "out"
          ? { opacity: 0, clipPath: "inset(0 0 100% 0)", pointerEvents: "none" }
          : { clipPath: "inset(0 0 0 0)" }
      }
    >
      <div className="flex flex-col items-center gap-7 px-8">
        <img
          src={logo}
          alt=""
          width={220}
          height={220}
          className="w-40 animate-rise sm:w-52"
        />
        <div className="relative h-px w-40 overflow-hidden bg-white/15 sm:w-56">
          <span className="loader-sweep absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
        <p className="animate-rise text-[0.65rem] tracking-[0.34em] text-white/45 uppercase">
          Agadir · Immobilier
        </p>
      </div>
    </div>
  );
}
