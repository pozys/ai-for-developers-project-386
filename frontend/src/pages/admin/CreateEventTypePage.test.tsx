import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEventType } from "@/api/client";
import { ApiError } from "@/api/errors";

import CreateEventTypePage from "./CreateEventTypePage";

vi.mock("@/api/client", () => ({
  createEventType: vi.fn(),
}));

function renderCreateEventTypePage() {
  return render(
    <MemoryRouter initialEntries={["/admin/event-types/new"]}>
      <Routes>
        <Route
          path="/admin/event-types/new"
          element={<CreateEventTypePage />}
        />
        <Route path="/admin/event-types" element={<div>Список типов</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CreateEventTypePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("создает тип события и возвращает на список", async () => {
    const user = userEvent.setup();

    vi.mocked(createEventType).mockResolvedValue({
      id: "evt-type-2",
      ownerId: "owner-1",
      name: "Демо",
      description: "Короткий созвон",
      durationMinutes: 30,
    });

    renderCreateEventTypePage();

    await user.type(screen.getByLabelText("Название"), "Демо");
    await user.type(screen.getByLabelText("Описание"), "Короткий созвон");
    await user.clear(screen.getByLabelText("Длительность, минут"));
    await user.type(screen.getByLabelText("Длительность, минут"), "30");
    await user.click(
      screen.getByRole("button", { name: "Создать тип события" }),
    );

    await waitFor(() => {
      expect(createEventType).toHaveBeenCalledWith({
        name: "Демо",
        description: "Короткий созвон",
        durationMinutes: 30,
      });
    });

    expect(await screen.findByText("Список типов")).toBeInTheDocument();
  });

  it("показывает field-level ошибки сервера при 422", async () => {
    const user = userEvent.setup();

    vi.mocked(createEventType).mockRejectedValue(
      new ApiError(422, {
        message: "Ошибка валидации",
        errors: [{ field: "name", message: "Название уже занято" }],
      }),
    );

    renderCreateEventTypePage();

    await user.type(screen.getByLabelText("Название"), "Демо");
    await user.type(screen.getByLabelText("Описание"), "Короткий созвон");
    await user.clear(screen.getByLabelText("Длительность, минут"));
    await user.type(screen.getByLabelText("Длительность, минут"), "30");
    await user.click(
      screen.getByRole("button", { name: "Создать тип события" }),
    );

    expect(await screen.findByText("Название уже занято")).toBeInTheDocument();
  });
});
