import { useState } from "react";
import type { FormEvent } from "react";

import { createBooking } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { Booking, EventType, TimeSlot } from "@/types/api";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateLabel, formatSlotRange } from "@/lib/date";

interface BookingFormProps {
  eventType: EventType;
  slot: TimeSlot;
  onBack: () => void;
  onSuccess: (booking: Booking) => void;
}

type FieldErrors = Partial<
  Record<"guestName" | "guestEmail" | "comment", string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getValidationErrors(
  guestName: string,
  guestEmail: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!guestName.trim()) {
    errors.guestName = "Введите имя";
  }

  if (!EMAIL_PATTERN.test(guestEmail.trim())) {
    errors.guestEmail = "Введите корректный email";
  }

  return errors;
}

export default function BookingForm({
  eventType,
  slot,
  onBack,
  onSuccess,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [comment, setComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientErrors = getValidationErrors(guestName, guestEmail);

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setSubmitError(null);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(null);

    try {
      const booking = await createBooking({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        comment: comment.trim() || undefined,
        eventTypeId: eventType.id,
        startTime: slot.startTime,
      });

      onSuccess(booking);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setSubmitError("Это время уже забронировано");
        } else if (error.status === 422 && error.errorResponse.errors) {
          const nextFieldErrors =
            error.errorResponse.errors.reduce<FieldErrors>(
              (accumulator, item) => {
                if (
                  item.field === "guestName" ||
                  item.field === "guestEmail" ||
                  item.field === "comment"
                ) {
                  accumulator[item.field] = item.message;
                }

                return accumulator;
              },
              {},
            );

          setFieldErrors(nextFieldErrors);
          setSubmitError(error.errorResponse.message);
        } else {
          setSubmitError(error.errorResponse.message);
        }
      } else {
        setSubmitError("Не удалось отправить бронирование");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(fieldName: keyof FieldErrors) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));
  }

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Шаг 3
          </Badge>
          <Badge variant="outline">Имя, email и комментарий</Badge>
        </div>
        <CardTitle className="text-2xl">Данные для бронирования</CardTitle>
        <CardDescription>
          {eventType.name} · {formatDateLabel(slot.startTime.slice(0, 10))} ·{" "}
          {formatSlotRange(slot.startTime, slot.endTime)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          {submitError ? (
            <Alert variant="destructive" aria-live="assertive">
              <AlertTitle>Не удалось создать бронирование</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guestName">Имя</Label>
              <Input
                id="guestName"
                name="guestName"
                value={guestName}
                required
                aria-invalid={fieldErrors.guestName ? true : undefined}
                aria-describedby={
                  fieldErrors.guestName ? "guestName-error" : undefined
                }
                onChange={(event) => {
                  setGuestName(event.target.value);
                  clearFieldError("guestName");
                }}
              />
              {fieldErrors.guestName ? (
                <p id="guestName-error" className="text-sm text-destructive">
                  {fieldErrors.guestName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                name="guestEmail"
                type="email"
                inputMode="email"
                value={guestEmail}
                required
                aria-invalid={fieldErrors.guestEmail ? true : undefined}
                aria-describedby={
                  fieldErrors.guestEmail ? "guestEmail-error" : undefined
                }
                onChange={(event) => {
                  setGuestEmail(event.target.value);
                  clearFieldError("guestEmail");
                }}
              />
              {fieldErrors.guestEmail ? (
                <p id="guestEmail-error" className="text-sm text-destructive">
                  {fieldErrors.guestEmail}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              name="comment"
              value={comment}
              placeholder="Если есть детали, напишите их здесь"
              aria-invalid={fieldErrors.comment ? true : undefined}
              aria-describedby={
                fieldErrors.comment ? "comment-error" : undefined
              }
              onChange={(event) => {
                setComment(event.target.value);
                clearFieldError("comment");
              }}
            />
            {fieldErrors.comment ? (
              <p id="comment-error" className="text-sm text-destructive">
                {fieldErrors.comment}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="h-11 sm:flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Сохраняем..." : "Подтвердить запись"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:flex-1"
              onClick={onBack}
            >
              Выбрать другой слот
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
