import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The team listing was folded into the agency page. Individual profiles keep
 * their own pages at /equipe/$slug   only this index is a redirect.
 */
export const Route = createFileRoute("/equipe/")({
  beforeLoad: () => {
    throw redirect({ to: "/agence", hash: "equipe" });
  },
});
