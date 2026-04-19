import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEventTypes } from "@/api/client";
import { makeEventType } from "@/test/fixtures";

import EventTypesPage from "./EventTypesPage";

vi.mock("@/api/client", () => ({
  getEventTypes: vi.fn(),
}));

describe("EventTypesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("рендерит карточки и переходит на страницу бронирования", async () => {
    const user = userEvent.setup();
    vi.mocked(getEventTypes).mockResolvedValue([
      makeEventType(),
      makeEventType({ id: "evt-type-2", name: "Демо" }),
    ]);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<EventTypesPage />} />
          <Route
            path="/event-types/:id/book"
            element={<div>Страница бронирования</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Консультация")).toBeInTheDocument();
    expect(screen.getByText("Демо")).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Выбрать время" })[0],
    );

    expect(
      await screen.findByText("Страница бронирования"),
    ).toBeInTheDocument();
  });

  it("показывает пустое состояние", async () => {
    vi.mocked(getEventTypes).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EventTypesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Пока нет доступных слотов")).toBeInTheDocument();
    });
  });
});
