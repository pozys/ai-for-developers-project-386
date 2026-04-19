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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Публичная запись
            </Badge>
            <Badge variant="outline">Без регистрации</Badge>
            <Badge variant="outline">14 дней вперёд</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Типы событий
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              Выберите формат встречи, затем удобную дату и свободный слот в календаре. Вся запись
              занимает несколько кликов и не требует регистрации.
            </p>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Как это работает</CardTitle>
            <CardDescription>Ориентир для гостей перед выбором конкретного формата.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>Рабочие дни</span>
              <span className="font-medium text-foreground">Пн - Пт</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Время</span>
              <span className="font-medium text-foreground">09:00 - 17:00</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Часовой пояс</span>
              <span className="font-medium text-foreground">Europe/Moscow</span>
            </div>
          </CardContent>
        </Card>
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
              <CardHeader className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-11 w-full rounded-xl" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && eventTypes.length === 0 ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
              Пустой список
            </Badge>
            <CardTitle className="text-2xl">Пока нет доступных слотов</CardTitle>
            <CardDescription>
              Когда владелец календаря добавит типы событий, они появятся на этой странице.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && eventTypes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((eventType) => (
            <Card key={eventType.id} className="h-full transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-2xl">{eventType.name}</CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {eventType.durationMinutes} мин
                  </Badge>
                </div>
                <CardDescription className="text-pretty">{eventType.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  type="button"
                  className="h-11 w-full"
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
