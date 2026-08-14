import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The services now live in the agency page, alongside the team. The URL stays
 * alive   it is indexed and printed   and hands visitors to the right band.
 */
export const Route = createFileRoute("/services")({
  beforeLoad: () => {
    throw redirect({ to: "/agence", hash: "services" });
  },
});
