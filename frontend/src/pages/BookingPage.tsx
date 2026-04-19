import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getEventTypes, getSlots } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { Booking, EventType, TimeSlot } from "@/types/api";

import BookingForm from "@/components/BookingForm";
import CalendarGrid from "@/components/CalendarGrid";
import TimeSlotList from "@/components/TimeSlotList";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirstAvailableDateKey } from "@/lib/bookingDate";
import { formatDateLabel, formatSlotRange } from "@/lib/date";

type BookingStep = "select" | "form" | "confirmed";

export default function BookingPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [step, setStep] = useState<BookingStep>("select");
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [isEventTypeLoading, setIsEventTypeLoading] = useState(true);
  const [eventTypeError, setEventTypeError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    getFirstAvailableDateKey(),
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [eventTypeRequestKey, setEventTypeRequestKey] = useState(0);
  const [slotsRequestKey, setSlotsRequestKey] = useState(0);
  const stepItems = [
    { key: "select", label: "Дата и слот" },
    { key: "form", label: "Контакты" },
    { key: "confirmed", label: "Подтверждение" },
  ] as const;

  useEffect(() => {
    let isMounted = true;

    setStep("select");
    setEventType(null);
    setEventTypeError(null);
    setIsEventTypeLoading(true);
    setSelectedDate(getFirstAvailableDateKey());
    setSelectedSlot(null);
    setConfirmedBooking(null);

    async function loadEventType() {
      try {
        const eventTypes = await getEventTypes();
        const currentEventType = eventTypes.find((item) => item.id === id);

        if (!isMounted) {
          return;
        }

        if (!currentEventType) {
          setEventTypeError("Тип события не найден");
          return;
        }

        setEventType(currentEventType);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setEventTypeError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить тип события",
        );
      } finally {
        if (isMounted) {
          setIsEventTypeLoading(false);
        }
      }
    }

    void loadEventType();

    return () => {
      isMounted = false;
    };
  }, [id, eventTypeRequestKey]);

  useEffect(() => {
    if (!eventType) {
      return;
    }

    const eventTypeId = eventType.id;
    let isMounted = true;

    setSlotsLoading(true);
    setSlotsError(null);

    async function loadSlots() {
      try {
        const nextSlots = await getSlots(eventTypeId, selectedDate);

        if (isMounted) {
          setSlots(nextSlots);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError) {
          setSlotsError(error.errorResponse.message);
        } else {
          setSlotsError("Не удалось загрузить слоты");
        }

        setSlots([]);
      } finally {
        if (isMounted) {
          setSlotsLoading(false);
        }
      }
    }

    void loadSlots();

    return () => {
      isMounted = false;
    };
  }, [eventType, selectedDate, slotsRequestKey]);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedSlot(null);
    setStep("select");
  }

  function handleSelectSlot(slot: TimeSlot) {
    if (!slot.available) {
      return;
    }

    setSelectedSlot(slot);
    setStep("form");
  }

  function handleBookingSuccess(booking: Booking) {
    setConfirmedBooking(booking);
    setStep("confirmed");
  }

  if (isEventTypeLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-7 w-full max-w-2xl" />
        </section>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Skeleton className="h-[460px] w-full rounded-2xl" />
          <Skeleton className="h-[460px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (eventTypeError || !eventType) {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Бронирование
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Страница не смогла загрузить выбранный тип события.
          </p>
        </section>
        <Alert variant="destructive">
          <AlertTitle>Не удалось открыть страницу бронирования</AlertTitle>
          <AlertDescription>
            {eventTypeError ?? "Тип события не найден"}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => navigate("/")}
          >
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
    );
  }

  if (step === "confirmed" && confirmedBooking) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="space-y-4">
          <Badge
            variant="secondary"
            className="w-fit bg-primary/10 text-primary"
          >
            Успешно
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight">
            Запись подтверждена
          </h1>
          <p className="text-muted-foreground">
            Подтверждение сохранено, а слот больше не доступен для повторного
            бронирования.
          </p>
        </section>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
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
                <p className="font-medium">
                  {formatDateLabel(confirmedBooking.startTime.slice(0, 10))}
                </p>
                <p>
                  {formatSlotRange(
                    confirmedBooking.startTime,
                    confirmedBooking.endTime,
                  )}
                </p>
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
          <Button
            type="button"
            className="sm:flex-1"
            onClick={() => navigate("/")}
          >
            Вернуться к списку событий
          </Button>
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => {
              setStep("select");
              setConfirmedBooking(null);
              setSelectedSlot(null);
            }}
          >
            Забронировать ещё
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {stepItems.map((item, index) => {
              const isActive =
                (step === "select" && item.key === "select") ||
                (step === "form" && item.key === "form") ||
                (step === "confirmed" && item.key === "confirmed");

              return (
                <Badge
                  key={item.key}
                  variant={isActive ? "secondary" : "outline"}
                  className={isActive ? "bg-primary/10 text-primary" : ""}
                >
                  {index + 1}. {item.label}
                </Badge>
              );
            })}
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              Бронирование
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              Выберите рабочий день в ближайшие 14 дней, свободный слот и
              заполните контактные данные.
            </p>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">{eventType.name}</CardTitle>
            <CardDescription>{eventType.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>Длительность</span>
              <span className="font-medium text-foreground">
                {eventType.durationMinutes} мин
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Окно записи</span>
              <span className="font-medium text-foreground">14 дней</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Рабочие часы</span>
              <span className="font-medium text-foreground">09:00 - 17:00</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            К списку событий
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">Сейчас выбрано</CardTitle>
              <CardDescription>
                Выбор обновляется по мере перехода между датами и слотами.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {eventType.durationMinutes} мин
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
            <p className="text-muted-foreground">Длительность</p>
            <p className="font-medium text-foreground">
              {eventType.durationMinutes} мин
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
            <p className="text-muted-foreground">Выбранная дата</p>
            <p className="font-medium text-foreground">
              {formatDateLabel(selectedDate)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
            <p className="text-muted-foreground">Рабочие дни</p>
            <p className="font-medium text-foreground">Понедельник - пятница</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
            <p className="text-muted-foreground">Часовой пояс</p>
            <p className="font-medium text-foreground">Europe/Moscow</p>
          </div>
        </CardContent>
      </Card>

      {step === "form" && selectedSlot ? (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <BookingForm
              eventType={eventType}
              slot={selectedSlot}
              onBack={() => setStep("select")}
              onSuccess={handleBookingSuccess}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === "select" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <CalendarGrid
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
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
  );
}
