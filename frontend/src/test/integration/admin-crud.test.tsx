import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createEventType, getAdminEventTypes, updateEventType } from '@/api/client'
import { renderApp } from '@/test/renderApp'
import { makeEventType } from '@/test/fixtures'

vi.mock('@/api/client', () => ({
  createEventType: vi.fn(),
  getAdminEventTypes: vi.fn(),
  updateEventType: vi.fn(),
}))

describe('admin crud integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates and edits event types through the app shell', async () => {
    const user = userEvent.setup()
    const existingEventType = makeEventType()
    const createdEventType = makeEventType({
      id: 'evt-type-2',
      name: 'Демо-звонок',
      description: 'Короткая синхронизация по статусу',
      durationMinutes: 30,
    })
    const updatedEventType = {
      ...createdEventType,
      description: 'Обновленное описание демо-звонка',
    }

    vi.mocked(getAdminEventTypes)
      .mockResolvedValueOnce([existingEventType])
      .mockResolvedValueOnce([existingEventType, createdEventType])
      .mockResolvedValueOnce([existingEventType, createdEventType])
      .mockResolvedValueOnce([existingEventType, updatedEventType])
    vi.mocked(createEventType).mockResolvedValue(createdEventType)
    vi.mocked(updateEventType).mockResolvedValue(updatedEventType)

    renderApp({ initialEntries: ['/admin/event-types'] })

    expect(await screen.findByText('Консультация')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Новый тип события' }))
    expect(await screen.findByRole('heading', { name: 'Новый тип события' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Название'), 'Демо-звонок')
    await user.type(screen.getByLabelText('Описание'), 'Короткая синхронизация по статусу')
    await user.clear(screen.getByLabelText('Длительность, минут'))
    await user.type(screen.getByLabelText('Длительность, минут'), '30')
    await user.click(screen.getByRole('button', { name: 'Создать тип события' }))

    expect(await screen.findByText('Демо-звонок')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Редактировать' })[1])
    expect(await screen.findByRole('heading', { name: 'Редактирование типа события' })).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Описание'))
    await user.type(screen.getByLabelText('Описание'), 'Обновленное описание демо-звонка')
    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }))

    await waitFor(() => {
      expect(updateEventType).toHaveBeenCalledWith('evt-type-2', {
        description: 'Обновленное описание демо-звонка',
      })
    })

    expect(await screen.findByText('Обновленное описание демо-звонка')).toBeInTheDocument()
  })
})
