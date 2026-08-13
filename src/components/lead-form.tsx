import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useCreatePublicLead } from "@/lib/admin/queries";
import { properties as siteProperties } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
};

/**
 * Splits a "Nom et prénom" value into first and last name. Kept forgiving:
 * a single token becomes a first name, "Madame"/"Monsieur" prefixes are
 * dropped, and a trailing family name can be multi-word ("El Amrani").
 */
function splitName(raw: string) {
  let parts = raw
    .trim()
    .replace(/^(madame|monsieur|mme|m\.)\s+/i, "")
    .split(/\s+/);
  parts = parts.filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  const lastName = parts.slice(-2).join(" ");
  return {
    firstName: parts.slice(0, -2).join(" ") || parts[0]!,
    lastName,
  };
}

function contextFromIntent(intent: string): { propertyId?: string; agentId?: string } {
  if (intent.startsWith("property:")) {
    const reference = intent.slice("property:".length);
    const property = siteProperties.find((p) => p.reference === reference);
    // The admin repository keys properties by their public slug.
    return property ? { propertyId: property.slug } : {};
  }
  if (intent.startsWith("agent:")) {
    const slug = intent.slice("agent:".length);
    return slug ? { agentId: slug } : {};
  }
  return {};
}

export function LeadForm({
  fields,
  submitLabel,
  intent,
  note,
  tone = "light",
  frame = true,
  children,
}: {
  fields: Field[];
  submitLabel: string;
  intent: string;
  note?: string;
  tone?: "light" | "navy";
  /** Off when the form already sits inside a card of its own. */
  frame?: boolean;
  children?: ReactNode;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const createLead = useCreatePublicLead();

  const dark = tone === "navy";

  if (sent) {
    return (
      <div
        className={cn(
          "text-center",
          frame && "rounded-md border p-8",
          frame && (dark ? "border-white/15 bg-white/5" : "border-line bg-card"),
        )}
      >
        <p className="eyebrow">Demande enregistrée</p>
        <h3 className="display mt-3 text-3xl">Merci, nous revenons vers vous.</h3>
        <p className={cn("mt-3 text-sm", dark ? "text-white/60" : "text-muted-foreground")}>
          Un conseiller STE MABANIS vous rappelle sous 24 heures ouvrées. Pour une réponse
          immédiate, écrivez-nous sur WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const rawName = String(data.get("nom") ?? data.get("nom_complet") ?? "");
        const { firstName, lastName } = splitName(rawName);
        const email = String(data.get("email") ?? "");
        const phone = String(data.get("telephone") ?? "");
        const message = String(data.get("message") ?? "");
        const ctx = contextFromIntent(intent);

        setSending(true);
        createLead.mutate(
          {
            firstName: firstName || (email.split("@")[0] ?? "Visiteur"),
            lastName,
            email,
            phone,
            message,
            intent,
            ...ctx,
          },
          {
            onSuccess: () => {
              setSending(false);
              setSent(true);
              toast.success("Votre demande a bien été transmise à nos conseillers.");
            },
            onError: (err) => {
              setSending(false);
              toast.error("Envoi impossible", {
                description: "Réessayez dans un instant ou contactez-nous par téléphone.",
              });
              console.error("LeadForm submission failed", err);
            },
          },
        );
      }}
      className={cn(
        frame && "rounded-md border p-6 sm:p-8",
        frame && (dark ? "border-white/15 bg-white/5" : "border-line bg-card shadow-card"),
      )}
    >
      <input type="hidden" name="intent" value={intent} />
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.name}
            className={cn(
              "flex flex-col gap-1.5",
              (f.full || f.type === "textarea") && "sm:col-span-2",
            )}
          >
            <span
              className={cn(
                "text-[0.6rem] tracking-[0.18em] uppercase",
                dark ? "text-white/50" : "text-muted-foreground",
              )}
            >
              {f.label}
              {f.required ? " *" : ""}
            </span>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                required={f.required}
                rows={4}
                placeholder={f.placeholder}
                className={cn(
                  "rounded-md border px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold",
                  dark
                    ? "border-white/20 bg-transparent text-white placeholder:text-white/30"
                    : "border-line bg-background",
                )}
              />
            ) : f.type === "select" ? (
              <select
                name={f.name}
                required={f.required}
                defaultValue=""
                className={cn(
                  "h-11 rounded-md border px-3 text-sm outline-none transition-colors focus:border-gold",
                  dark ? "border-white/20 bg-navy text-white" : "border-line bg-background",
                )}
              >
                <option value="" disabled>
                  Sélectionner…
                </option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type ?? "text"}
                required={f.required}
                placeholder={f.placeholder}
                className={cn(
                  "h-11 rounded-md border px-3 text-sm outline-none transition-colors focus:border-gold",
                  dark
                    ? "border-white/20 bg-transparent text-white placeholder:text-white/30"
                    : "border-line bg-background",
                )}
              />
            )}
          </label>
        ))}
      </div>

      {children}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 w-full rounded-md bg-gold px-6 py-3.5 text-[0.7rem] tracking-[0.18em] text-navy uppercase transition-colors hover:bg-navy hover:text-white disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Envoi en cours…" : submitLabel}
      </button>

      {note ? (
        <p className={cn("mt-4 text-xs", dark ? "text-white/45" : "text-muted-foreground")}>
          {note}
        </p>
      ) : null}
    </form>
  );
}
