import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  addMonth,
  formatCalendarDayLabel,
  formatMonthLabel,
  getCalendarDays,
  getWeekdayLabels,
  getMonthStart,
  hasSelectableDaysInMonth,
} from "@/lib/bookingDate";

interface CalendarGridProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  now?: Date;
}

export default function CalendarGrid({
  selectedDate,
  onSelectDate,
  now = new Date(),
}: CalendarGridProps) {
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    getMonthStart(selectedDate),
  );
  const previousMonth = addMonth(displayedMonth, -1);
  const nextMonth = addMonth(displayedMonth, 1);
  const days = getCalendarDays(displayedMonth, now);

  useEffect(() => {
    setDisplayedMonth(getMonthStart(selectedDate));
  }, [selectedDate]);

  return (
    <section aria-labelledby="calendar-grid-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="calendar-grid-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Выберите дату
          </h2>
          <p className="text-sm text-muted-foreground">
            Доступны только будни в пределах 14 дней.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Предыдущий месяц"
            disabled={!hasSelectableDaysInMonth(previousMonth, now)}
            onClick={() => setDisplayedMonth(previousMonth)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Следующий месяц"
            disabled={!hasSelectableDaysInMonth(nextMonth, now)}
            onClick={() => setDisplayedMonth(nextMonth)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 text-card-foreground shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
        <p
          className="mb-4 text-center text-base font-heading font-medium capitalize tracking-tight"
          role="heading"
          aria-level={3}
          aria-live="polite"
        >
          {formatMonthLabel(displayedMonth)}
        </p>

        <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {getWeekdayLabels().map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const isSelected = day.dateKey === selectedDate;

            return (
              <Button
                key={day.dateKey}
                type="button"
                variant={isSelected ? "default" : "ghost"}
                className="h-11 w-full rounded-xl px-0 text-sm"
                aria-label={formatCalendarDayLabel(day.dateKey)}
                aria-pressed={isSelected}
                disabled={!day.isSelectable}
                onClick={() => onSelectDate(day.dateKey)}
              >
                <span
                  className={
                    day.isCurrentMonth
                      ? "text-sm font-medium"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {day.dayOfMonth}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
