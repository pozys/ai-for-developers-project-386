import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createBooking, createEventType, getAdminEventTypes, getEventTypes, getSlots } from '@/api/client'
import { ApiError } from '@/api/errors'
import { appRoutes } from '@/router'
import { renderApp } from '@/test/renderApp'
import { makeEventType, makeTimeSlot } from '@/test/fixtures'

vi.mock('@/api/client', () => ({
  createBooking: vi.fn(),
  createEventType: vi.fn(),
  getAdminEventTypes: vi.fn(),
  getEventTypes: vi.fn(),
  getSlots: vi.fn(),
}))

function createCrashRoutes() {
  const rootRoute = appRoutes[0] as RouteObject & { children: RouteObject[] }

  return [
    {
      ...rootRoute,
      children: rootRoute.children.map((route) => (
        route.index
          ? ({ ...route, element: <CrashRoute /> } as RouteObject)
          : route
      )),
    },
  ]
}

function CrashRoute(): never {
  throw new Error('Тестовая ошибка маршрута')
}

describe('error handling integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows conflict message for taken slots', async () => {
    const user = userEvent.setup()
    const slot = makeTimeSlot({
      startTime: '2026-04-15T09:00:00+03:00',
      endTime: '2026-04-15T10:00:00+03:00',
    })

    vi.mocked(getEventTypes).mockResolvedValue([makeEventType()])
    vi.mocked(getSlots).mockResolvedValue([slot])
    vi.mocked(createBooking).mockRejectedValue(new ApiError(409, { message: 'Слот уже занят' }))

    renderApp({ initialEntries: ['/event-types/evt-type-1/book'] })

    await user.click(await screen.findByRole('button', { name: /выбрать слот 09:00 - 10:00/i }))
    await user.type(screen.getByLabelText('Имя'), 'Иван Петров')
    await user.type(screen.getByLabelText('Email'), 'ivan@example.com')
    await user.click(screen.getByRole('button', { name: 'Подтвердить запись' }))

    expect(await screen.findByText('Это время уже забронировано')).toBeInTheDocument()
  })

  it('shows validation errors for admin create flow', async () => {
    const user = userEvent.setup()

    vi.mocked(createEventType).mockRejectedValue(
      new ApiError(422, {
        message: 'Ошибка валидации',
        errors: [{ field: 'name', message: 'Название уже занято' }],
      }),
    )

    renderApp({ initialEntries: ['/admin/event-types/new'] })

    await user.type(screen.getByLabelText('Название'), 'Демо-звонок')
    await user.type(screen.getByLabelText('Описание'), 'Короткая синхронизация')
    await user.clear(screen.getByLabelText('Длительность, минут'))
    await user.type(screen.getByLabelText('Длительность, минут'), '30')
    await user.click(screen.getByRole('button', { name: 'Создать тип события' }))

    expect(await screen.findByText('Название уже занято')).toBeInTheDocument()
  })

  it('shows local 404 state for missing admin event type', async () => {
    vi.mocked(getAdminEventTypes).mockResolvedValue([])

    renderApp({ initialEntries: ['/admin/event-types/missing/edit'] })

    expect(await screen.findByText('Тип события не найден')).toBeInTheDocument()
  })

  it('shows not found page for unknown routes', () => {
    renderApp({ initialEntries: ['/totally-missing'] })

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })

  it('shows router error fallback for render crashes', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderApp({ routes: createCrashRoutes() })

    expect(await screen.findByRole('heading', { name: 'Что-то пошло не так' })).toBeInTheDocument()
    expect(screen.getByText('Тестовая ошибка маршрута')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
