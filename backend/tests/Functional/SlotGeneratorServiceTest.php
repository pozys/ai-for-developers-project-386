<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Service\SlotGeneratorService;
use DateTimeImmutable;
use DateTimeZone;

class SlotGeneratorServiceTest extends ApiTestCase
{
    public function testGenerateSlotsForWeekday(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $slots = $this->slotGeneratorService()->generateSlots($eventType, '2026-04-13');

        self::assertCount(16, $slots);
        self::assertSame('2026-04-13T06:00:00+00:00', $slots[0]['startTime']);
        self::assertSame('2026-04-13T14:00:00+00:00', $slots[15]['endTime']);
        self::assertTrue(array_reduce($slots, static fn (bool $carry, array $slot): bool => $carry && $slot['available'], true));
    }

    public function testGenerateSlotsMarksBookedSlotUnavailable(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $this->createBooking($eventType, '2026-04-13 06:00:00 UTC', '2026-04-13 06:30:00 UTC');

        $slots = $this->slotGeneratorService()->generateSlots($eventType, '2026-04-13');

        self::assertFalse($slots[0]['available']);
        self::assertTrue($slots[1]['available']);
    }

    public function testGenerateSlotsForNoDateUsesNextWeekday(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $slots = $this->slotGeneratorService()->generateSlots($eventType, null);

        self::assertNotEmpty($slots);

        $expectedDate = $this->nextWeekday(new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('Y-m-d');
        self::assertSame($expectedDate, (new DateTimeImmutable($slots[0]['startTime']))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('Y-m-d'));
    }

    public function testGenerateSlotsForWeekendReturnsEmpty(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        self::assertSame([], $this->slotGeneratorService()->generateSlots($eventType, '2026-04-18'));
    }

    public function testGenerateSlotsForSixtyMinutes(): void
    {
        $eventType = $this->createEventType('Strategy session', 'Sixty minutes', 60);

        self::assertCount(8, $this->slotGeneratorService()->generateSlots($eventType, '2026-04-13'));
    }

    public function testGenerateSlotsOutsideWindowReturnsEmpty(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $date = $this->todayMoscow()->modify('+14 days')->format('Y-m-d');

        self::assertSame([], $this->slotGeneratorService()->generateSlots($eventType, $date));
    }

    private function slotGeneratorService(): SlotGeneratorService
    {
        return static::getContainer()->get(SlotGeneratorService::class);
    }

    private function todayMoscow(): DateTimeImmutable
    {
        return new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow'));
    }

    private function nextWeekday(DateTimeImmutable $date): DateTimeImmutable
    {
        while (in_array($date->format('N'), ['6', '7'], true)) {
            $date = $date->modify('+1 day');
        }

        return $date;
    }
}
