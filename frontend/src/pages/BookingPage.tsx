import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { getEventTypes, getSlots } from '@/api/client'
import { ApiError } from '@/api/errors'
import type { Booking, EventType, TimeSlot } from '@/types/api'

import BookingForm from '@/components/BookingForm'
import CalendarGrid from '@/components/CalendarGrid'
import TimeSlotList from '@/components/TimeSlotList'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getFirstAvailableDateKey } from '@/lib/bookingDate'
import { formatDateLabel, formatSlotRange } from '@/lib/date'

type BookingStep = 'select' | 'form' | 'confirmed'

export default function BookingPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const [step, setStep] = useState<BookingStep>('select')
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [isEventTypeLoading, setIsEventTypeLoading] = useState(true)
  const [eventTypeError, setEventTypeError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => getFirstAvailableDateKey())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [eventTypeRequestKey, setEventTypeRequestKey] = useState(0)
  const [slotsRequestKey, setSlotsRequestKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    setStep('select')
    setEventType(null)
    setEventTypeError(null)
    setIsEventTypeLoading(true)
    setSelectedDate(getFirstAvailableDateKey())
    setSelectedSlot(null)
    setConfirmedBooking(null)

    async function loadEventType() {
      try {
        const eventTypes = await getEventTypes()
        const currentEventType = eventTypes.find((item) => item.id === id)

        if (!isMounted) {
          return
        }

        if (!currentEventType) {
          setEventTypeError('Тип события не найден')
          return
        }

        setEventType(currentEventType)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setEventTypeError(error instanceof Error ? error.message : 'Не удалось загрузить тип события')
      } finally {
        if (isMounted) {
          setIsEventTypeLoading(false)
        }
      }
    }

    void loadEventType()

    return () => {
      isMounted = false
    }
  }, [id, eventTypeRequestKey])

  useEffect(() => {
    if (!eventType) {
      return
    }

    const eventTypeId = eventType.id
    let isMounted = true

    setSlotsLoading(true)
    setSlotsError(null)

    async function loadSlots() {
      try {
        const nextSlots = await getSlots(eventTypeId, selectedDate)

        if (isMounted) {
          setSlots(nextSlots)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error instanceof ApiError) {
          setSlotsError(error.errorResponse.message)
        } else {
          setSlotsError('Не удалось загрузить слоты')
        }

        setSlots([])
      } finally {
        if (isMounted) {
          setSlotsLoading(false)
        }
      }
    }

    void loadSlots()

    return () => {
      isMounted = false
    }
  }, [eventType, selectedDate, slotsRequestKey])

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey)
    setSelectedSlot(null)
    setStep('select')
  }

  function handleSelectSlot(slot: TimeSlot) {
    if (!slot.available) {
      return
    }

    setSelectedSlot(slot)
    setStep('form')
  }

  function handleBookingSuccess(booking: Booking) {
    setConfirmedBooking(booking)
    setStep('confirmed')
  }

  if (isEventTypeLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Бронирование</h1>
          <p className="max-w-2xl text-muted-foreground">
            Загружаем тип события, доступные даты и свободные интервалы по московскому времени.
          </p>
        </section>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Skeleton className="h-[420px] w-full rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (eventTypeError || !eventType) {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Бронирование</h1>
          <p className="max-w-2xl text-muted-foreground">
            Страница не смогла загрузить выбранный тип события.
          </p>
        </section>
        <Alert variant="destructive">
          <AlertTitle>Не удалось открыть страницу бронирования</AlertTitle>
          <AlertDescription>{eventTypeError ?? 'Тип события не найден'}</AlertDescription>
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" className="sm:flex-1" onClick={() => navigate('/')}>
            Вернуться к списку
          </Button>
          <Button
            type="button"
            className="sm:flex-1"
            onClick={() => setEventTypeRequestKey((value) => value + 1)}
          >
            Повторить загрузку
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'confirmed' && confirmedBooking) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Запись подтверждена</h1>
          <p className="text-muted-foreground">
            Подтверждение сохранено, а слот больше не доступен для повторного бронирования.
          </p>
        </section>

        <Card>
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">Успешно</Badge>
            <CardTitle className="text-2xl">Детали бронирования</CardTitle>
            <CardDescription>
              Мы сохранили ваше бронирование и зарезервировали выбранное время.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Тип события</p>
                <p className="font-medium">{confirmedBooking.eventTypeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Дата и время</p>
                <p className="font-medium">{formatDateLabel(confirmedBooking.startTime.slice(0, 10))}</p>
                <p>{formatSlotRange(confirmedBooking.startTime, confirmedBooking.endTime)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Имя</p>
                <p className="font-medium">{confirmedBooking.guestName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{confirmedBooking.guestEmail}</p>
              </div>
            </div>

            {confirmedBooking.comment ? (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="text-muted-foreground">Комментарий</p>
                  <p>{confirmedBooking.comment}</p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="sm:flex-1" onClick={() => navigate('/')}>
            Вернуться к списку событий
          </Button>
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => {
              setStep('select')
              setConfirmedBooking(null)
              setSelectedSlot(null)
            }}
          >
            Забронировать ещё
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Бронирование</h1>
        <p className="max-w-2xl text-muted-foreground">
          Выберите рабочий день в ближайшие 14 дней, свободный слот и заполните контактные данные.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            К списку событий
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{eventType.name}</CardTitle>
              <CardDescription>{eventType.description}</CardDescription>
            </div>
            <Badge variant="secondary">{eventType.durationMinutes} мин</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Рабочие дни: понедельник - пятница, 09:00 - 17:00 (Europe/Moscow).
          </p>
          <p className="text-muted-foreground capitalize">
            Выбранная дата: <span className="font-medium text-foreground">{formatDateLabel(selectedDate)}</span>
          </p>
        </CardContent>
      </Card>

      {step === 'form' && selectedSlot ? (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <BookingForm
              eventType={eventType}
              slot={selectedSlot}
              onBack={() => setStep('select')}
              onSuccess={handleBookingSuccess}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === 'select' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <CalendarGrid selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          <TimeSlotList
            slots={slots}
            selectedDate={selectedDate}
            selectedSlotStartTime={selectedSlot?.startTime ?? null}
            isLoading={slotsLoading}
            errorMessage={slotsError}
            onRetry={() => setSlotsRequestKey((value) => value + 1)}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      ) : null}
    </div>
  )
}
