import type { TimeSlot } from '@/types/api'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
      className="space-y-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div>
        <h2 id="time-slot-list-heading" className="text-lg font-semibold">Свободное время</h2>
        <p className="text-sm text-muted-foreground capitalize">{formatDateLabel(selectedDate)}</p>
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
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
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
                  className="w-full justify-between"
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
