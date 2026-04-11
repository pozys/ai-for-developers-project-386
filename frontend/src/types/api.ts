export interface EventType {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  comment?: string;
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  guestName: string;
  guestEmail: string;
  comment?: string;
  eventTypeId: string;
  startTime: string;
}

export interface CreateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationError[];
}
