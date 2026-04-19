import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CalendarGrid from "./CalendarGrid";

describe("CalendarGrid", () => {
  it("вызывает onSelectDate для доступной даты", async () => {
    const onSelectDate = vi.fn();
    const user = userEvent.setup();

    render(
      <CalendarGrid
        selectedDate="2026-04-14"
        now={new Date("2026-04-13T09:00:00+03:00")}
        onSelectDate={onSelectDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: /15 апреля 2026/i }));

    expect(onSelectDate).toHaveBeenCalledWith("2026-04-15");
  });

  it("отключает выходные и даты вне 14-дневного окна", () => {
    render(
      <CalendarGrid
        selectedDate="2026-04-14"
        now={new Date("2026-04-13T09:00:00+03:00")}
        onSelectDate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /19 апреля 2026/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /28 апреля 2026/i }),
    ).toBeDisabled();
  });

  it("позволяет перейти к следующему месяцу, если в нем есть доступные даты", async () => {
    const user = userEvent.setup();

    render(
      <CalendarGrid
        selectedDate="2026-04-30"
        now={new Date("2026-04-28T09:00:00+03:00")}
        onSelectDate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Следующий месяц" }));

    expect(
      screen.getByRole("heading", { name: /май 2026/i }),
    ).toBeInTheDocument();
  });
});
