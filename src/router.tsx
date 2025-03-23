import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    scrollRestoration: true,
  });

  return router;
}

declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
