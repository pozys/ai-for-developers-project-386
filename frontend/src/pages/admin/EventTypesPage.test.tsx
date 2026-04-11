import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAdminEventTypes } from '@/api/client'
import { makeEventType } from '@/test/fixtures'

import AdminEventTypesPage from './EventTypesPage'

vi.mock('@/api/client', () => ({
  getAdminEventTypes: vi.fn(),
}))

function renderAdminEventTypesPage(initialEntries = ['/admin/event-types']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
        <Route path="/admin/event-types/new" element={<div>Новая форма</div>} />
        <Route path="/admin/event-types/:id/edit" element={<div>Редактирование</div>} />
        <Route path="/admin/bookings" element={<div>Бронирования</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminEventTypesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('рендерит список типов событий и открывает редактирование', async () => {
    const user = userEvent.setup()

    vi.mocked(getAdminEventTypes).mockResolvedValue([
      makeEventType(),
      makeEventType({ id: 'evt-type-2', name: 'Демо-звонок' }),
    ])

    renderAdminEventTypesPage()

    expect(await screen.findByText('Консультация')).toBeInTheDocument()
    expect(screen.getByText('Демо-звонок')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Редактировать' })[0])

    expect(await screen.findByText('Редактирование')).toBeInTheDocument()
  })

  it('показывает пустое состояние', async () => {
    vi.mocked(getAdminEventTypes).mockResolvedValue([])

    renderAdminEventTypesPage()

    await waitFor(() => {
      expect(screen.getByText('Пока нет типов событий')).toBeInTheDocument()
    })
  })
})
