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
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{" "}
        <Link
          to="/posts"
          activeProps={{
            className: "font-bold",
          }}
        >
          Posts
        </Link>{" "}
        <Link
          to="/users"
          activeProps={{
            className: "font-bold",
          }}
        >
          Users
        </Link>{" "}
        <Link
          to="/route-a"
          activeProps={{
            className: "font-bold",
          }}
        >
          Pathless Layout
        </Link>{" "}
        <Link
          to="/deferred"
          activeProps={{
            className: "font-bold",
          }}
        >
          Deferred
        </Link>{" "}
        <Link
          // @ts-expect-error - This route does not exist
          to="/this-route-does-not-exist"
          activeProps={{
            className: "font-bold",
          }}
        >
          This Route Does Not Exist
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  );
}
