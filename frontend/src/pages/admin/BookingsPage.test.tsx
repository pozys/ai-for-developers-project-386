import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminBookings } from "@/api/client";
import { makeBooking } from "@/test/fixtures";

import BookingsPage from "./BookingsPage";

vi.mock("@/api/client", () => ({
  getAdminBookings: vi.fn(),
}));

describe("BookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("рендерит таблицу бронирований", async () => {
    vi.mocked(getAdminBookings).mockResolvedValue([
      makeBooking({ comment: undefined }),
      makeBooking({
        id: "booking-2",
        guestName: "Мария",
        guestEmail: "maria@example.com",
        eventTypeName: "Демо",
        startTime: "2026-04-15T11:00:00+03:00",
        endTime: "2026-04-15T11:30:00+03:00",
        comment: "Нужна запись звонка",
      }),
    ]);

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Предстоящие встречи")).toBeInTheDocument();
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();
    expect(screen.getByText("Мария")).toBeInTheDocument();
    expect(screen.getByText("Нужна запись звонка")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("показывает пустое состояние", async () => {
    vi.mocked(getAdminBookings).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Пока нет предстоящих встреч"),
      ).toBeInTheDocument();
    });
  });
});
