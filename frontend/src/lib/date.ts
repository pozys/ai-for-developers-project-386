const MOSCOW_TIME_ZONE = "Europe/Moscow";

function getUtcDateFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ru-RU", options).format(date);
}

export function formatDateLabel(dateKey: string) {
  return formatDate(getUtcDateFromDateKey(dateKey), {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTimeLabel(dateTime: string) {
  return formatDate(new Date(dateTime), {
    timeZone: MOSCOW_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTimeLabel(dateTime: string) {
  return `${formatDateLabel(dateTime.slice(0, 10))}, ${formatTimeLabel(dateTime)}`;
}

export function formatSlotRange(startTime: string, endTime: string) {
  return `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;
}

export { MOSCOW_TIME_ZONE };
