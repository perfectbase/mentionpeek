import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      console.log("Not authenticated", context);
      throw redirect({
        to: "/sign-in",
      });
    }
  },
});
