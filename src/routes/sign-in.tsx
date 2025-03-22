import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignIn } from "~/components/SignIn";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return <SignIn />;
}
