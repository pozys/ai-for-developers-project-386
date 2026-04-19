import { render } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import type { RouteObject } from "react-router";

import App from "@/App";
import { appRoutes } from "@/router";

interface RenderAppOptions {
  initialEntries?: string[];
  routes?: RouteObject[];
}

export function renderApp({
  initialEntries = ["/"],
  routes = appRoutes,
}: RenderAppOptions = {}) {
  const router = createMemoryRouter(routes, { initialEntries });

  return {
    router,
    ...render(<App router={router} />),
  };
}
