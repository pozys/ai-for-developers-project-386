import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBooking, getEventTypes, getSlots } from "@/api/client";
import { ApiError } from "@/api/errors";
import { makeBooking, makeEventType, makeTimeSlot } from "@/test/fixtures";

import BookingPage from "./BookingPage";

vi.mock("@/api/client", () => ({
  createBooking: vi.fn(),
  getEventTypes: vi.fn(),
  getSlots: vi.fn(),
}));

function renderBookingPage() {
  return render(
    <MemoryRouter initialEntries={["/event-types/evt-type-1/book"]}>
      <Routes>
        <Route path="/event-types/:id/book" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BookingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEventTypes).mockResolvedValue([makeEventType()]);
  });

  it("проходит полный сценарий бронирования от даты до подтверждения", async () => {
    const user = userEvent.setup();
    const selectedSlot = makeTimeSlot({
      startTime: "2026-04-15T09:00:00+03:00",
      endTime: "2026-04-15T10:00:00+03:00",
    });

    vi.mocked(getSlots).mockResolvedValue([selectedSlot]);

    vi.mocked(createBooking).mockResolvedValue(
      makeBooking({
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        comment: "Нужно обсудить интеграцию",
      }),
    );

    renderBookingPage();

    await screen.findByText("Консультация");
    await user.click(
      await screen.findByRole("button", { name: /09:00 - 10:00/i }),
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

    expect(await screen.findByText("Запись подтверждена")).toBeInTheDocument();
    expect(screen.getByText("Иван Петров")).toBeInTheDocument();
  });

  it("показывает сообщение о конфликте слота при 409", async () => {
    const user = userEvent.setup();
    const selectedSlot = makeTimeSlot({
      startTime: "2026-04-15T09:00:00+03:00",
      endTime: "2026-04-15T10:00:00+03:00",
    });

    vi.mocked(getSlots).mockResolvedValue([selectedSlot]);
    vi.mocked(createBooking).mockRejectedValue(
      new ApiError(409, { message: "Слот уже занят" }),
    );

    renderBookingPage();

    await user.click(
      await screen.findByRole("button", { name: /09:00 - 10:00/i }),
    );
    await user.type(screen.getByLabelText("Имя"), "Иван Петров");
    await user.type(screen.getByLabelText("Email"), "ivan@example.com");
    await user.click(
      screen.getByRole("button", { name: "Подтвердить запись" }),
    );

    expect(
      await screen.findByText("Это время уже забронировано"),
    ).toBeInTheDocument();
  });

  it("отображает field-level ошибки сервера при 422", async () => {
    const user = userEvent.setup();
    const selectedSlot = makeTimeSlot({
      startTime: "2026-04-15T09:00:00+03:00",
      endTime: "2026-04-15T10:00:00+03:00",
    });

    vi.mocked(getSlots).mockResolvedValue([selectedSlot]);
    vi.mocked(createBooking).mockRejectedValue(
      new ApiError(422, {
        message: "Ошибка валидации",
        errors: [{ field: "guestEmail", message: "Некорректный email" }],
      }),
    );

    renderBookingPage();

    await user.click(
      await screen.findByRole("button", { name: /09:00 - 10:00/i }),
    );
    await user.type(screen.getByLabelText("Имя"), "Иван Петров");
    await user.type(screen.getByLabelText("Email"), "ivan@example.com");
    await user.click(
      screen.getByRole("button", { name: "Подтвердить запись" }),
    );

    expect(await screen.findByText("Некорректный email")).toBeInTheDocument();
  });
});
