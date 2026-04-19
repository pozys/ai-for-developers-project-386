import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBooking, getEventTypes, getSlots } from "@/api/client";
import { renderApp } from "@/test/renderApp";
import { makeBooking, makeEventType, makeTimeSlot } from "@/test/fixtures";

vi.mock("@/api/client", () => ({
  createBooking: vi.fn(),
  getEventTypes: vi.fn(),
  getSlots: vi.fn(),
}));

describe("booking flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("goes from event type list to booking confirmation", async () => {
    const user = userEvent.setup();
    const eventType = makeEventType();
    const selectedSlot = makeTimeSlot({
      startTime: "2026-04-15T09:00:00+03:00",
      endTime: "2026-04-15T10:00:00+03:00",
    });

    vi.mocked(getEventTypes).mockResolvedValue([eventType]);
    vi.mocked(getSlots).mockResolvedValue([selectedSlot]);
    vi.mocked(createBooking).mockResolvedValue(
      makeBooking({
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        comment: "Нужно обсудить интеграцию",
      }),
    );

    renderApp({ initialEntries: ["/"] });

    await user.click(
      await screen.findByRole("button", { name: "Выбрать время" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Бронирование" }),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", {
        name: /выбрать слот 09:00 - 10:00/i,
      }),
    );
    await user.type(screen.getByLabelText("Имя"), "Иван Петров");
    await user.type(screen.getByLabelText("Email"), "ivan@example.com");
    await user.type(
      screen.getByLabelText("Комментарий"),
      "Нужно обсудить интеграцию",
    );
    await user.click(
      screen.getByRole("button", { name: "Подтвердить запись" }),
    );

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledWith({
        guestName: "Иван Петров",
        guestEmail: "ivan@example.com",
        comment: "Нужно обсудить интеграцию",
        eventTypeId: "evt-type-1",
        startTime: "2026-04-15T09:00:00+03:00",
      });
    });

    expect(
      await screen.findByRole("heading", { name: "Запись подтверждена" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();
  });
});
