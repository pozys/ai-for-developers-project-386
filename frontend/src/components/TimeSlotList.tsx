import type { TimeSlot } from '@/types/api'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateLabel, formatSlotRange } from '@/lib/date'

interface TimeSlotListProps {
  slots: TimeSlot[]
  selectedDate: string
  selectedSlotStartTime?: string | null
  isLoading: boolean
  errorMessage?: string | null
  onSelectSlot: (slot: TimeSlot) => void
  onRetry?: () => void
}

export default function TimeSlotList({
  slots,
  selectedDate,
  selectedSlotStartTime,
  isLoading,
  errorMessage,
  onSelectSlot,
  onRetry,
}: TimeSlotListProps) {
  const availableSlots = slots.filter((slot) => slot.available)

  return (
    <section
      aria-labelledby="time-slot-list-heading"
      className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4 text-card-foreground shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="time-slot-list-heading" className="text-lg font-semibold tracking-tight">
            Свободное время
          </h2>
          <p className="text-sm text-muted-foreground capitalize">
            {formatDateLabel(selectedDate)}
          </p>
        </div>
        {slots.length > 0 ? (
          <Badge variant="outline" className="bg-muted/40">
            {availableSlots.length} / {slots.length}
          </Badge>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Не удалось загрузить слоты</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              Повторить загрузку слотов
            </Button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">На этот день свободных слотов нет.</p>
      ) : null}

      {!isLoading && !errorMessage && slots.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Свободно слотов: {availableSlots.length} из {slots.length}
          </p>

          <div className="space-y-2">
            {slots.map((slot) => {
              const isSelected = slot.startTime === selectedSlotStartTime
              const slotRange = formatSlotRange(slot.startTime, slot.endTime)

              return (
                <Button
                  key={slot.startTime}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="h-11 w-full justify-between rounded-xl px-4"
                  aria-label={slot.available ? `Выбрать слот ${slotRange}` : `Слот занят ${slotRange}`}
                  aria-pressed={slot.available ? isSelected : undefined}
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slot)}
                >
                  <span>{slotRange}</span>
                  <span className="text-xs text-muted-foreground">
                    {slot.available ? 'Свободно' : 'Занято'}
                  </span>
                </Button>
              )
            })}
          </div>
        </>
      ) : null}
    </section>
  )
}
