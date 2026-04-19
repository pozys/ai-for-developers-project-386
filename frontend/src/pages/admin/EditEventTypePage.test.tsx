import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminEventTypes, updateEventType } from "@/api/client";
import { ApiError } from "@/api/errors";
import { makeEventType } from "@/test/fixtures";

import EditEventTypePage from "./EditEventTypePage";

vi.mock("@/api/client", () => ({
  getAdminEventTypes: vi.fn(),
  updateEventType: vi.fn(),
}));

function renderEditEventTypePage(
  initialEntries = ["/admin/event-types/evt-type-1/edit"],
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/admin/event-types/:id/edit"
          element={<EditEventTypePage />}
        />
        <Route path="/admin/event-types" element={<div>Список типов</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EditEventTypePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminEventTypes).mockResolvedValue([makeEventType()]);
  });

  it("обновляет только измененные поля и возвращает на список", async () => {
    const user = userEvent.setup();

    vi.mocked(updateEventType).mockResolvedValue(
      makeEventType({ description: "Обновленное описание" }),
    );

    renderEditEventTypePage();

    await screen.findByDisplayValue("Консультация");
    await user.clear(screen.getByLabelText("Описание"));
    await user.type(screen.getByLabelText("Описание"), "Обновленное описание");
    await user.click(
      screen.getByRole("button", { name: "Сохранить изменения" }),
    );

    await waitFor(() => {
      expect(updateEventType).toHaveBeenCalledWith("evt-type-1", {
        description: "Обновленное описание",
      });
    });

    expect(await screen.findByText("Список типов")).toBeInTheDocument();
  });

  it("показывает локальное not found состояние", async () => {
    vi.mocked(getAdminEventTypes).mockResolvedValue([]);

    renderEditEventTypePage(["/admin/event-types/missing/edit"]);

    expect(
      await screen.findByText("Тип события не найден"),
    ).toBeInTheDocument();
  });

  it("показывает ошибку 404 при сохранении", async () => {
    const user = userEvent.setup();

    vi.mocked(updateEventType).mockRejectedValue(
      new ApiError(404, { message: "Не найдено" }),
    );

    renderEditEventTypePage();

    await screen.findByDisplayValue("Консультация");
    await user.clear(screen.getByLabelText("Описание"));
    await user.type(screen.getByLabelText("Описание"), "Новое описание");
    await user.click(
      screen.getByRole("button", { name: "Сохранить изменения" }),
    );

    expect(
      await screen.findByText("Тип события не найден или уже был удалён"),
    ).toBeInTheDocument();
  });
});
