import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { ApiError } from '@/api/errors'
import type { CreateEventTypeRequest } from '@/types/api'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EventTypeFormProps {
  title: string
  description: string
  submitLabel: string
  initialValues?: CreateEventTypeRequest
  onSubmit: (values: CreateEventTypeRequest) => Promise<void>
  onCancel: () => void
  cancelLabel?: string
  getErrorMessage?: (error: unknown) => string
}

type EventTypeField = keyof CreateEventTypeRequest
type EventTypeFieldErrors = Partial<Record<EventTypeField, string>>

const defaultValues: CreateEventTypeRequest = {
  name: '',
  description: '',
  durationMinutes: 60,
}

function isEventTypeField(field: string): field is EventTypeField {
  return field === 'name' || field === 'description' || field === 'durationMinutes'
}

function getValidationErrors(values: {
  name: string
  description: string
  durationMinutes: string
}): EventTypeFieldErrors {
  const errors: EventTypeFieldErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Укажите название типа события'
  }

  if (!values.description.trim()) {
    errors.description = 'Укажите описание типа события'
  }

  if (!values.durationMinutes.trim()) {
    errors.durationMinutes = 'Укажите длительность встречи'
  } else {
    const durationMinutes = Number(values.durationMinutes)

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      errors.durationMinutes = 'Длительность должна быть положительным числом'
    }
  }

  return errors
}

export default function EventTypeForm({
  title,
  description,
  submitLabel,
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  cancelLabel = 'Отмена',
  getErrorMessage,
}: EventTypeFormProps) {
  const [name, setName] = useState(initialValues.name)
  const [descriptionValue, setDescriptionValue] = useState(initialValues.description)
  const [durationMinutes, setDurationMinutes] = useState(initialValues.durationMinutes.toString())
  const [fieldErrors, setFieldErrors] = useState<EventTypeFieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(initialValues.name)
    setDescriptionValue(initialValues.description)
    setDurationMinutes(initialValues.durationMinutes.toString())
    setFieldErrors({})
    setSubmitError(null)
  }, [initialValues])

  function handleFieldChange(field: EventTypeField, nextValue: string) {
    setSubmitError(null)
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))

    if (field === 'name') {
      setName(nextValue)
    }

    if (field === 'description') {
      setDescriptionValue(nextValue)
    }

    if (field === 'durationMinutes') {
      setDurationMinutes(nextValue)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextValues = {
      name,
      description: descriptionValue,
      durationMinutes,
    }
    const validationErrors = getValidationErrors(nextValues)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSubmitError('Проверьте форму и исправьте ошибки')
      return
    }

    setIsSubmitting(true)
    setFieldErrors({})
    setSubmitError(null)

    try {
      await onSubmit({
        name: name.trim(),
        description: descriptionValue.trim(),
        durationMinutes: Number(durationMinutes),
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const nextFieldErrors: EventTypeFieldErrors = {}

        for (const validationError of error.errorResponse.errors ?? []) {
          if (isEventTypeField(validationError.field)) {
            nextFieldErrors[validationError.field] = validationError.message
          }
        }

        setFieldErrors(nextFieldErrors)
        setSubmitError(error.errorResponse.message)
        return
      }

      if (getErrorMessage) {
        setSubmitError(getErrorMessage(error))
        return
      }

      if (error instanceof ApiError) {
        setSubmitError(error.errorResponse.message)
        return
      }

      setSubmitError(error instanceof Error ? error.message : 'Не удалось сохранить тип события')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
          Настройки события
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {submitError ? (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTitle>Не удалось сохранить тип события</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="event-type-name">Название</Label>
            <Input
              id="event-type-name"
              name="name"
              value={name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? 'event-type-name-error' : undefined}
              placeholder="Например, Консультация"
              disabled={isSubmitting}
            />
            {fieldErrors.name ? (
              <p id="event-type-name-error" className="text-sm text-destructive">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-type-description">Описание</Label>
            <Textarea
              id="event-type-description"
              name="description"
              value={descriptionValue}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              aria-invalid={fieldErrors.description ? true : undefined}
              aria-describedby={fieldErrors.description ? 'event-type-description-error' : undefined}
              placeholder="Коротко опишите, что обсудите на встрече"
              disabled={isSubmitting}
            />
            {fieldErrors.description ? (
              <p id="event-type-description-error" className="text-sm text-destructive">
                {fieldErrors.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-type-duration">Длительность, минут</Label>
            <Input
              id="event-type-duration"
              name="durationMinutes"
              type="number"
              min="1"
              step="1"
              value={durationMinutes}
              onChange={(event) => handleFieldChange('durationMinutes', event.target.value)}
              aria-invalid={fieldErrors.durationMinutes ? true : undefined}
              aria-describedby={fieldErrors.durationMinutes ? 'event-type-duration-error' : undefined}
              disabled={isSubmitting}
            />
            {fieldErrors.durationMinutes ? (
              <p id="event-type-duration-error" className="text-sm text-destructive">
                {fieldErrors.durationMinutes}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
