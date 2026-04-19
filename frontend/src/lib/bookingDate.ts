import { MOSCOW_TIME_ZONE } from "@/lib/date";

const BOOKING_WINDOW_DAYS = 14;
const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarDay {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isSelectable: boolean;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getUtcDateFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysToUtcDate(date: Date, days: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

function getDateKeyParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: parts.find(({ type }) => type === "year")?.value ?? "1970",
    month: parts.find(({ type }) => type === "month")?.value ?? "01",
    day: parts.find(({ type }) => type === "day")?.value ?? "01",
  };
}

function formatUtcDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getTodayDateKey(now = new Date()) {
  const { year, month, day } = getDateKeyParts(now, MOSCOW_TIME_ZONE);

  return `${year}-${month}-${day}`;
}

export function getFirstAvailableDateKey(now = new Date()) {
  const startDate = getUtcDateFromDateKey(getTodayDateKey(now));

  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
    const currentDate = addDaysToUtcDate(startDate, offset);
    const currentDateKey = formatUtcDateKey(currentDate);

    if (isWeekdayDateKey(currentDateKey)) {
      return currentDateKey;
    }
  }

  return getTodayDateKey(now);
}

export function isWeekdayDateKey(dateKey: string) {
  const dayOfWeek = getUtcDateFromDateKey(dateKey).getUTCDay();

  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function isDateKeyWithinBookingWindow(
  dateKey: string,
  now = new Date(),
) {
  const windowStart = getTodayDateKey(now);
  const windowEnd = addDateKey(windowStart, BOOKING_WINDOW_DAYS - 1);

  return dateKey >= windowStart && dateKey <= windowEnd;
}

export function addDateKey(dateKey: string, days: number) {
  return formatUtcDateKey(
    addDaysToUtcDate(getUtcDateFromDateKey(dateKey), days),
  );
}

export function getMonthStart(dateKey: string) {
  const date = getUtcDateFromDateKey(dateKey);

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonth(date: Date, months: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

export function hasSelectableDaysInMonth(monthStart: Date, now = new Date()) {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();

  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
    const currentDateKey = addDateKey(getTodayDateKey(now), offset);
    const currentDate = getUtcDateFromDateKey(currentDateKey);

    if (
      currentDate.getUTCFullYear() === year &&
      currentDate.getUTCMonth() === month &&
      isWeekdayDateKey(currentDateKey)
    ) {
      return true;
    }
  }

  return false;
}

export function getCalendarDays(
  monthStart: Date,
  now = new Date(),
): CalendarDay[] {
  const offsetToMonday = (monthStart.getUTCDay() + 6) % 7;
  const gridStart = addDaysToUtcDate(monthStart, -offsetToMonday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDaysToUtcDate(gridStart, index);
    const dateKey = formatUtcDateKey(date);

    return {
      dateKey,
      dayOfMonth: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
      isSelectable:
        isDateKeyWithinBookingWindow(dateKey, now) && isWeekdayDateKey(dateKey),
    };
  });
}

export function formatMonthLabel(monthStart: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(monthStart);
}

export function formatCalendarDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(getUtcDateFromDateKey(dateKey));
}

export function getWeekdayLabels() {
  return WEEKDAY_LABELS;
}
