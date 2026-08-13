import { FaWhatsapp } from "react-icons/fa";
import { agency } from "@/lib/site-data";

export function WhatsAppButton({ message }: { message?: string }) {
  const href = `https://wa.me/${agency.whatsapp}?text=${encodeURIComponent(
    message ?? "Bonjour STE MABANIS, je souhaite obtenir des informations.",
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Écrire sur WhatsApp"
      className="fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full bg-navy text-white shadow-elegant transition-transform duration-300 hover:scale-105 hover:bg-gold hover:text-navy sm:right-6 sm:bottom-6 sm:size-12"
    >
      <FaWhatsapp className="size-5 text-white sm:size-5" />
    </a>
  );
}
