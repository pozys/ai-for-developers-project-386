import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { getAdminEventTypes } from '@/api/client'
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

export default function AdminEventTypesPage() {
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
        const data = await getAdminEventTypes()

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
          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
            Админ-панель
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">Admin: типы событий</h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              Управляйте доступными форматами встреч: создавайте новые карточки и обновляйте
              текущие настройки без выхода из админки.
            </p>
          </div>
        </div>
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Быстрые действия</CardTitle>
            <CardDescription>Частые переходы в админке из одного места.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button type="button" variant="outline" className="h-11" onClick={() => navigate('/admin/bookings')}>
              Открыть бронирования
            </Button>
            <Button type="button" className="h-11" onClick={() => navigate('/admin/event-types/new')}>
              Новый тип события
            </Button>
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
                <Skeleton className="h-5 w-40" />
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
            <CardTitle className="text-2xl">Пока нет типов событий</CardTitle>
            <CardDescription>
              Создайте первый тип события, чтобы он появился на публичной странице бронирования.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" className="h-11" onClick={() => navigate('/admin/event-types/new')}>
              Создать тип события
            </Button>
          </CardFooter>
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
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Идентификатор типа события: {eventType.id}</p>
                <p>Используется в публичной странице и в форме создания бронирования.</p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => navigate(`/admin/event-types/${eventType.id}/edit`)}
                >
                  Редактировать
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
