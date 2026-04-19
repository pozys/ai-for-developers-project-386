import { useEffect, useState } from "react";

import { getAdminBookings } from "@/api/client";
import type { Booking } from "@/types/api";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateLabel, formatSlotRange } from "@/lib/date";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setErrorMessage(null);
    setIsLoading(true);

    async function loadBookings() {
      try {
        const data = await getAdminBookings();

        if (isMounted) {
          setBookings(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить бронирования",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      isMounted = false;
    };
  }, [requestKey]);

  return (
    <div className="space-y-8" aria-busy={isLoading}>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
        <div className="space-y-4">
          <Badge
            variant="secondary"
            className="w-fit bg-primary/10 text-primary"
          >
            Админ-панель
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              Бронирования
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              Просматривайте предстоящие встречи с деталями по гостю, типу
              события и комментарию к записи.
            </p>
          </div>
        </div>
        <div />
      </section>

      {errorMessage ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Не удалось загрузить бронирования</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRequestKey((value) => value + 1)}
          >
            Повторить загрузку
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <Card className="border-border/70 bg-card/90">
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
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <Badge
              variant="secondary"
              className="w-fit bg-primary/10 text-primary"
            >
              Пустой список
            </Badge>
            <CardTitle className="text-2xl">
              Пока нет предстоящих встреч
            </CardTitle>
            <CardDescription>
              Новые записи появятся здесь сразу после успешного бронирования на
              публичной странице.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && bookings.length > 0 ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Предстоящие встречи</CardTitle>
                <CardDescription>
                  Все бронирования отображаются по московскому времени.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-muted/40">
                {bookings.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption className="sr-only">
                Предстоящие встречи с датой, временем, типом события и
                контактами гостя.
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
                    <TableCell>
                      {formatSlotRange(booking.startTime, booking.endTime)}
                    </TableCell>
                    <TableCell>{booking.eventTypeName}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell>{booking.guestEmail}</TableCell>
                    <TableCell>{booking.comment || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
