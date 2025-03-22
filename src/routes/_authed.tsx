import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "~/components/SignIn";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      console.log("Not authenticated", context);
      throw new Error("Not authenticated");
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return <SignIn />;
    }

    throw error;
  },
});
