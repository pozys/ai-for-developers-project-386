import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminEventTypes, updateEventType } from "@/api/client";
import { ApiError } from "@/api/errors";
import type {
  CreateEventTypeRequest,
  EventType,
  UpdateEventTypeRequest,
} from "@/types/api";

import EventTypeForm from "@/components/admin/EventTypeForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function buildUpdatePayload(
  initialValues: EventType,
  nextValues: CreateEventTypeRequest,
): UpdateEventTypeRequest {
  const payload: UpdateEventTypeRequest = {};

  if (initialValues.name !== nextValues.name) {
    payload.name = nextValues.name;
  }

  if (initialValues.description !== nextValues.description) {
    payload.description = nextValues.description;
  }

  if (initialValues.durationMinutes !== nextValues.durationMinutes) {
    payload.durationMinutes = nextValues.durationMinutes;
  }

  return payload;
}

export default function EditEventTypePage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setEventType(null);
    setLoadError(null);
    setIsLoading(true);

    async function loadEventType() {
      try {
        const eventTypes = await getAdminEventTypes();
        const currentEventType = eventTypes.find((item) => item.id === id);

        if (!isMounted) {
          return;
        }

        if (!currentEventType) {
          setLoadError("Тип события не найден");
          return;
        }

        setEventType(currentEventType);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить тип события",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEventType();

    return () => {
      isMounted = false;
    };
  }, [id, requestKey]);

  async function handleSubmit(values: CreateEventTypeRequest) {
    if (!eventType) {
      return;
    }

    const payload = buildUpdatePayload(eventType, values);

    if (Object.keys(payload).length === 0) {
      navigate("/admin/event-types");
      return;
    }

    await updateEventType(eventType.id, payload);
    navigate("/admin/event-types");
  }

  function getSubmitErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return "Тип события не найден или уже был удалён";
    }

    if (error instanceof ApiError) {
      return error.errorResponse.message;
    }

    return error instanceof Error
      ? error.message
      : "Не удалось сохранить изменения";
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  if (loadError || !eventType) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Не удалось открыть тип события</AlertTitle>
          <AlertDescription>
            {loadError ?? "Тип события не найден"}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => navigate("/admin/event-types")}
          >
            К списку типов событий
          </Button>
          <Button
            type="button"
            className="sm:flex-1"
            onClick={() => setRequestKey((value) => value + 1)}
          >
            Повторить загрузку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EventTypeForm
      title="Редактирование типа события"
      description="Обновите параметры встречи. Изменённые поля будут отправлены частичным обновлением."
      submitLabel="Сохранить изменения"
      initialValues={{
        name: eventType.name,
        description: eventType.description,
        durationMinutes: eventType.durationMinutes,
      }}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin/event-types")}
      cancelLabel="Назад к списку"
      getErrorMessage={getSubmitErrorMessage}
    />
  );
}
