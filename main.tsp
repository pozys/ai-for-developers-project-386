import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

/**
 * Booking-Call API
 *
 * Без авторизации. Часовой пояс: Europe/Moscow.
 * Рабочие часы: Пн–Пт, 09:00–17:00. Окно бронирования: 14 дней.
 */
@service(#{ title: "Booking-Call API" })
@server("http://localhost:3000", "Local development server")
namespace BookingCall;

model ValidationError {
  field: string;
  message: string;
}

model ErrorResponse {
  message: string;
  errors?: ValidationError[];
}

model Owner {
  /** UUID, используется в URL. */
  id: string;

  name: string;
  email: string;
}

model EventType {
  id: string;

  /** FK → Owner */
  ownerId: string;

  name: string;
  description: string;
  durationMinutes: int32;
}

model CreateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: int32;
}

model UpdateEventTypeRequest {
  name?: string;
  description?: string;
  durationMinutes?: int32;
}

model TimeSlot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  available: boolean;
}

model Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  comment?: string;
  eventTypeId: string;

  /** Денормализовано для удобства отображения. */
  eventTypeName: string;

  startTime: utcDateTime;
  endTime: utcDateTime;
}

model CreateBookingRequest {
  guestName: string;
  guestEmail: string;
  comment?: string;
  eventTypeId: string;
  startTime: utcDateTime;
}

@route("/api")
namespace PublicApi {
  @route("/event-types")
  interface EventTypes {
    @get
    list(): EventType[];

    /** Опциональный параметр `date` фильтрует слоты по дню (YYYY-MM-DD). */
    @get
    @route("/{id}/slots")
    listSlots(@path id: string, @query date?: plainDate): TimeSlot[] | {
      @statusCode statusCode: 404;
      @body error: ErrorResponse;
    };
  }

  @route("/bookings")
  interface Bookings {
    /** 409 — слот уже занят. 422 — ошибки валидации. */
    @post
    create(@body body: CreateBookingRequest): {
      @statusCode statusCode: 201;
      @body booking: Booking;
    } | {
      @statusCode statusCode: 409;
      @body error: ErrorResponse;
    } | {
      @statusCode statusCode: 422;
      @body error: ErrorResponse;
    };
  }
}

@route("/api/admin")
namespace AdminApi {
  @route("/event-types")
  interface EventTypes {
    @get
    list(): EventType[];

    @post
    create(@body body: CreateEventTypeRequest): {
      @statusCode statusCode: 201;
      @body eventType: EventType;
    } | {
      @statusCode statusCode: 422;
      @body error: ErrorResponse;
    };

    @put
    @route("/{id}")
    update(@path id: string, @body body: UpdateEventTypeRequest): EventType | {
      @statusCode statusCode: 404;
      @body error: ErrorResponse;
    } | {
      @statusCode statusCode: 422;
      @body error: ErrorResponse;
    };
  }

  /** Отсортировано по startTime ASC. */
  @route("/bookings")
  interface Bookings {
    @get
    list(): Booking[];
  }
}
