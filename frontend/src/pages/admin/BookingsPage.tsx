import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { getAdminBookings } from '@/api/client'
import type { Booking } from '@/types/api'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateLabel, formatSlotRange } from '@/lib/date'

export default function BookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    setErrorMessage(null)
    setIsLoading(true)

    async function loadBookings() {
      try {
        const data = await getAdminBookings()

        if (isMounted) {
          setBookings(data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить бронирования')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBookings()

    return () => {
      isMounted = false
    }
  }, [requestKey])

  return (
    <div className="space-y-8" aria-busy={isLoading}>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Admin: бронирования</h1>
          <p className="max-w-2xl text-muted-foreground">
            Просматривайте предстоящие встречи с деталями по гостю, типу события и комментарию к
            записи.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/event-types')}>
          Управлять типами событий
        </Button>
      </section>

      {errorMessage ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Не удалось загрузить бронирования</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" onClick={() => setRequestKey((value) => value + 1)}>
            Повторить загрузку
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Пока нет предстоящих встреч</CardTitle>
            <CardDescription>
              Новые записи появятся здесь сразу после успешного бронирования на публичной странице.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/event-types')}>
              К типам событий
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && bookings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Предстоящие встречи</CardTitle>
            <CardDescription>Все бронирования отображаются по московскому времени.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption className="sr-only">
                Предстоящие встречи с датой, временем, типом события и контактами гостя.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Время</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead>Гость</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="min-w-40 font-medium">
                      {formatDateLabel(booking.startTime.slice(0, 10))}
                    </TableCell>
                    <TableCell>{formatSlotRange(booking.startTime, booking.endTime)}</TableCell>
                    <TableCell>{booking.eventTypeName}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell>{booking.guestEmail}</TableCell>
                    <TableCell>{booking.comment || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
