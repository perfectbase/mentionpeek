import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/users/")({
  component: UsersIndexComponent,
});

function UsersIndexComponent() {
  return <div>Select a user.</div>;
}
