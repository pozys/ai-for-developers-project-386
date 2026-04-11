import { useNavigate } from 'react-router'

import { createEventType } from '@/api/client'
import type { CreateEventTypeRequest } from '@/types/api'

import EventTypeForm from '@/components/admin/EventTypeForm'

export default function CreateEventTypePage() {
  const navigate = useNavigate()

  async function handleSubmit(values: CreateEventTypeRequest) {
    await createEventType(values)
    navigate('/admin/event-types')
  }

  return (
    <EventTypeForm
      title="Новый тип события"
      description="Заполните основные параметры встречи, чтобы добавить новый формат в расписание."
      submitLabel="Создать тип события"
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/event-types')}
    />
  )
}
