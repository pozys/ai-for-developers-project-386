import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { getEventTypes } from '@/api/client'
import type { EventType } from '@/types/api'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventTypesPage() {
  const navigate = useNavigate()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    setErrorMessage(null)
    setIsLoading(true)

    async function loadEventTypes() {
      try {
        const data = await getEventTypes()

        if (isMounted) {
          setEventTypes(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить типы событий')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadEventTypes()

    return () => {
      isMounted = false
    }
  }, [requestKey])

  return (
    <div className="space-y-8" aria-busy={isLoading}>
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Типы событий</h1>
        <p className="max-w-2xl text-muted-foreground">
          Выберите формат звонка, а затем удобную дату и свободный слот в календаре.
        </p>
      </section>

      {errorMessage ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Не удалось загрузить типы событий</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" onClick={() => setRequestKey((value) => value + 1)}>
            Повторить загрузку
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && eventTypes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Пока нет доступных слотов</CardTitle>
            <CardDescription>
              Когда владелец календаря добавит типы событий, они появятся на этой странице.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && eventTypes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((eventType) => (
            <Card key={eventType.id} className="h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{eventType.name}</CardTitle>
                  <Badge variant="secondary">{eventType.durationMinutes} мин</Badge>
                </div>
                <CardDescription>{eventType.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Доступно для бронирования в ближайшие 14 дней по рабочим дням.
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate(`/event-types/${eventType.id}/book`)}
                >
                  Выбрать время
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
