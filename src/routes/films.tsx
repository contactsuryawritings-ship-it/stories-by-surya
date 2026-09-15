import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/films")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "films" });
  },
});
