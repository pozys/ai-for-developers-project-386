import type { Booking, EventType, TimeSlot } from "@/types/api";

export function makeEventType(overrides?: Partial<EventType>): EventType {
  return {
    id: "evt-type-1",
    ownerId: "owner-1",
    name: "Консультация",
    description: "Часовая консультация по проекту",
    durationMinutes: 60,
    ...overrides,
  };
}

export function makeTimeSlot(overrides?: Partial<TimeSlot>): TimeSlot {
  return {
    startTime: "2026-04-14T09:00:00+03:00",
    endTime: "2026-04-14T10:00:00+03:00",
    available: true,
    ...overrides,
  };
}

export function makeBooking(overrides?: Partial<Booking>): Booking {
  return {
    id: "booking-1",
    guestName: "Иван Петров",
    guestEmail: "ivan@example.com",
    eventTypeId: "evt-type-1",
    eventTypeName: "Консультация",
    startTime: "2026-04-14T09:00:00+03:00",
    endTime: "2026-04-14T10:00:00+03:00",
    ...overrides,
  };
}
