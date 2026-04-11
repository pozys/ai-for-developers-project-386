import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBooking,
  createEventType,
  getAdminBookings,
  getAdminEventTypes,
  getEventTypes,
  getSlots,
  updateEventType,
} from './client';
import { ApiError } from './errors';
import { makeBooking, makeEventType, makeTimeSlot } from '@/test/fixtures';

function mockFetch(status: number, body: unknown): void {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

  vi.mocked(fetch).mockResolvedValueOnce(response);
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getEventTypes', () => {
  it('запрашивает GET /api/event-types и возвращает массив', async () => {
    const eventTypes = [makeEventType(), makeEventType({ id: 'evt-type-2', name: 'Демо' })];
    mockFetch(200, eventTypes);

    const result = await getEventTypes();

    expect(fetch).toHaveBeenCalledWith('/api/event-types', undefined);
    expect(result).toEqual(eventTypes);
  });
});

describe('getSlots', () => {
  it('запрашивает GET /api/event-types/{id}/slots без даты', async () => {
    const slots = [makeTimeSlot()];
    mockFetch(200, slots);

    const result = await getSlots('evt-type-1');

    expect(fetch).toHaveBeenCalledWith('/api/event-types/evt-type-1/slots', undefined);
    expect(result).toEqual(slots);
  });

  it('добавляет параметр date в URL', async () => {
    mockFetch(200, []);

    await getSlots('evt-type-1', '2026-04-14');

    expect(fetch).toHaveBeenCalledWith('/api/event-types/evt-type-1/slots?date=2026-04-14', undefined);
  });

  it('бросает ApiError при 404', async () => {
    mockFetch(404, { message: 'Тип события не найден' });

    await expect(getSlots('unknown-id')).rejects.toThrow(ApiError);
  });
});

describe('createBooking', () => {
  it('отправляет POST /api/bookings с телом и возвращает бронь', async () => {
    const booking = makeBooking();
    mockFetch(201, booking);

    const data = {
      guestName: 'Иван Петров',
      guestEmail: 'ivan@example.com',
      eventTypeId: 'evt-type-1',
      startTime: '2026-04-14T09:00:00+03:00',
    };

    const result = await createBooking(data);

    expect(fetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(booking);
  });

  it('бросает ApiError со статусом 409 при занятом слоте', async () => {
    const errorBody = { message: 'Слот уже занят' };
    mockFetch(409, errorBody);

    let error!: ApiError;

    try {
      await createBooking({
        guestName: 'Иван',
        guestEmail: 'ivan@example.com',
        eventTypeId: 'evt-type-1',
        startTime: '2026-04-14T09:00:00+03:00',
      });
    } catch (e) {
      error = e as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.errorResponse).toEqual(errorBody);
  });

  it('бросает ApiError со статусом 422 при ошибках валидации', async () => {
    const errorBody = {
      message: 'Ошибка валидации',
      errors: [{ field: 'guestEmail', message: 'Некорректный email' }],
    };
    mockFetch(422, errorBody);

    let error!: ApiError;

    try {
      await createBooking({
        guestName: 'Иван',
        guestEmail: 'not-an-email',
        eventTypeId: 'evt-type-1',
        startTime: '2026-04-14T09:00:00+03:00',
      });
    } catch (e) {
      error = e as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.errorResponse.errors).toHaveLength(1);
    expect(error.errorResponse.errors![0].field).toBe('guestEmail');
  });
});

describe('getAdminEventTypes', () => {
  it('запрашивает GET /api/admin/event-types', async () => {
    const eventTypes = [makeEventType()];
    mockFetch(200, eventTypes);

    const result = await getAdminEventTypes();

    expect(fetch).toHaveBeenCalledWith('/api/admin/event-types', undefined);
    expect(result).toEqual(eventTypes);
  });
});

describe('createEventType', () => {
  it('отправляет POST /api/admin/event-types и возвращает созданный тип', async () => {
    const eventType = makeEventType();
    mockFetch(201, eventType);

    const data = { name: 'Консультация', description: 'Описание', durationMinutes: 60 };
    const result = await createEventType(data);

    expect(fetch).toHaveBeenCalledWith('/api/admin/event-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(eventType);
  });

  it('бросает ApiError со статусом 422', async () => {
    const errorBody = { message: 'Ошибка валидации', errors: [{ field: 'name', message: 'Обязательное поле' }] };
    mockFetch(422, errorBody);

    let error!: ApiError;

    try {
      await createEventType({ name: '', description: '', durationMinutes: 0 });
    } catch (e) {
      error = e as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
  });
});

describe('updateEventType', () => {
  it('отправляет PUT /api/admin/event-types/{id} и возвращает обновлённый тип', async () => {
    const eventType = makeEventType({ name: 'Новое название' });
    mockFetch(200, eventType);

    const data = { name: 'Новое название' };
    const result = await updateEventType('evt-type-1', data);

    expect(fetch).toHaveBeenCalledWith('/api/admin/event-types/evt-type-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(result).toEqual(eventType);
  });

  it('бросает ApiError со статусом 404 при несуществующем типе', async () => {
    mockFetch(404, { message: 'Тип события не найден' });

    let error!: ApiError;

    try {
      await updateEventType('unknown-id', { name: 'Тест' });
    } catch (e) {
      error = e as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
  });
});

describe('getAdminBookings', () => {
  it('запрашивает GET /api/admin/bookings и возвращает массив', async () => {
    const bookings = [makeBooking(), makeBooking({ id: 'booking-2', guestName: 'Мария Иванова' })];
    mockFetch(200, bookings);

    const result = await getAdminBookings();

    expect(fetch).toHaveBeenCalledWith('/api/admin/bookings', undefined);
    expect(result).toEqual(bookings);
  });
});
