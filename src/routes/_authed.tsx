import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      console.log("Not authenticated", context);
      throw redirect({
        to: "/sign-in",
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
