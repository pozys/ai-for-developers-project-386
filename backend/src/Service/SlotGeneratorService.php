<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\EventType;
use App\Repository\BookingRepository;
use DateTimeImmutable;
use DateTimeZone;

final class SlotGeneratorService
{
    private const MOSCOW_TIMEZONE = 'Europe/Moscow';
    private const UTC_TIMEZONE = 'UTC';
    private const WORKDAY_START_HOUR = 9;
    private const WORKDAY_END_HOUR = 17;
    private const WINDOW_DAYS = 14;

    public function __construct(
        private readonly BookingRepository $bookingRepository,
    ) {
    }

    /**
     * @return list<array{startTime: string, endTime: string, available: bool}>
     */
    public function generateSlots(EventType $eventType, ?string $date): array
    {
        $moscowTimezone = new DateTimeZone(self::MOSCOW_TIMEZONE);
        $utcTimezone = new DateTimeZone(self::UTC_TIMEZONE);
        $today = new DateTimeImmutable('now', $moscowTimezone);
        $todayMidnight = $today->setTime(0, 0);

        $targetDate = $date === null
            ? $this->findNextWeekday($todayMidnight)
            : DateTimeImmutable::createFromFormat('!Y-m-d', $date, $moscowTimezone);

        if (!$targetDate instanceof DateTimeImmutable) {
            return [];
        }

        if ($targetDate < $todayMidnight || $targetDate > $todayMidnight->modify('+' . (self::WINDOW_DAYS - 1) . ' days')) {
            return [];
        }

        if ($this->isWeekend($targetDate)) {
            return [];
        }

        $slotStart = $targetDate->setTime(self::WORKDAY_START_HOUR, 0);
        $workdayEnd = $targetDate->setTime(self::WORKDAY_END_HOUR, 0);
        $slotDurationMinutes = $eventType->getDurationMinutes();

        if ($slotDurationMinutes <= 0) {
            return [];
        }

        $slots = [];
        while (true) {
            $slotEnd = $slotStart->modify(sprintf('+%d minutes', $slotDurationMinutes));
            if ($slotEnd > $workdayEnd) {
                break;
            }

            $slotStartUtc = $slotStart->setTimezone($utcTimezone);
            $slotEndUtc = $slotEnd->setTimezone($utcTimezone);
            $available = !$this->bookingRepository->hasOverlappingBookings($slotStartUtc, $slotEndUtc);

            $slots[] = [
                'startTime' => $slotStartUtc->format(DATE_ATOM),
                'endTime' => $slotEndUtc->format(DATE_ATOM),
                'available' => $available,
            ];

            $slotStart = $slotEnd;
        }

        return $slots;
    }

    private function findNextWeekday(DateTimeImmutable $date): DateTimeImmutable
    {
        while ($this->isWeekend($date)) {
            $date = $date->modify('+1 day');
        }

        return $date;
    }

    private function isWeekend(DateTimeImmutable $date): bool
    {
        return in_array($date->format('N'), ['6', '7'], true);
    }
}
