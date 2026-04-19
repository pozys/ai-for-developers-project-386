import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  ErrorResponse,
  EventType,
  TimeSlot,
  UpdateEventTypeRequest,
} from "@/types/api";
import { ApiError } from "./errors";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);

  if (!response.ok) {
    const errorResponse: ErrorResponse = await response.json();

    throw new ApiError(response.status, errorResponse);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getEventTypes(): Promise<EventType[]> {
  return apiFetch("/api/event-types");
}

export function getSlots(
  eventTypeId: string,
  date?: string,
): Promise<TimeSlot[]> {
  const url = date
    ? `/api/event-types/${eventTypeId}/slots?date=${date}`
    : `/api/event-types/${eventTypeId}/slots`;

  return apiFetch(url);
}

export function createBooking(data: CreateBookingRequest): Promise<Booking> {
  return apiFetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function getAdminEventTypes(): Promise<EventType[]> {
  return apiFetch("/api/admin/event-types");
}

export function createEventType(
  data: CreateEventTypeRequest,
): Promise<EventType> {
  return apiFetch("/api/admin/event-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateEventType(
  id: string,
  data: UpdateEventTypeRequest,
): Promise<EventType> {
  return apiFetch(`/api/admin/event-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function getAdminBookings(): Promise<Booking[]> {
  return apiFetch("/api/admin/bookings");
}
