import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEventTypes } from "@/api/client";
import { renderApp } from "@/test/renderApp";

vi.mock("@/api/client", () => ({
  getEventTypes: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEventTypes).mockResolvedValue([]);
  });

  it("renders home route with navigation shell", async () => {
    renderApp();

    expect(screen.getByText("Главная")).toBeInTheDocument();
    expect(screen.getByText("Админка")).toBeInTheDocument();
    expect(
      await screen.findByText("Пока нет доступных слотов"),
    ).toBeInTheDocument();
  });

  it("renders not found page for unknown routes", async () => {
    renderApp({ initialEntries: ["/does-not-exist"] });

    expect(
      screen.getByRole("heading", { name: "Страница не найдена" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "К списку событий" }),
    ).toBeInTheDocument();
  });
});
