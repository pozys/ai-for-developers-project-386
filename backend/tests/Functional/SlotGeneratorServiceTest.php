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
        $date = $this->inWindowWeekdayDate();

        $slots = $this->slotGeneratorService()->generateSlots($eventType, $date->format('Y-m-d'));

        self::assertCount(16, $slots);
        self::assertSame($this->moscowDateToUtcAtom(9, 0, $date), $slots[0]['startTime']);
        self::assertSame($this->moscowDateToUtcAtom(17, 0, $date), $slots[15]['endTime']);
        self::assertTrue(array_reduce($slots, static fn (bool $carry, array $slot): bool => $carry && $slot['available'], true));
    }

    public function testGenerateSlotsMarksBookedSlotUnavailable(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $date = $this->inWindowWeekdayDate();
        $bookingStart = $this->moscowDateToUtc(9, 0, $date);
        $bookingEnd = $bookingStart->modify('+30 minutes');
        $this->createBooking(
            $eventType,
            $bookingStart->format('Y-m-d H:i:s').' UTC',
            $bookingEnd->format('Y-m-d H:i:s').' UTC',
        );

        $slots = $this->slotGeneratorService()->generateSlots($eventType, $date->format('Y-m-d'));

        self::assertFalse($slots[0]['available']);
        self::assertTrue($slots[1]['available']);
    }

    public function testGenerateSlotsForNoDateUsesNextWeekday(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $slots = $this->slotGeneratorService()->generateSlots($eventType, null);

        self::assertNotEmpty($slots);

        $expectedDate = $this->nextWeekday($this->todayMoscow())->format('Y-m-d');
        self::assertSame($expectedDate, (new DateTimeImmutable($slots[0]['startTime']))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('Y-m-d'));
    }

    public function testGenerateSlotsForWeekendReturnsEmpty(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $weekendDate = $this->nextWeekendDate()->format('Y-m-d');

        self::assertSame([], $this->slotGeneratorService()->generateSlots($eventType, $weekendDate));
    }

    public function testGenerateSlotsForSixtyMinutes(): void
    {
        $eventType = $this->createEventType('Strategy session', 'Sixty minutes', 60);
        $date = $this->inWindowWeekdayDate()->format('Y-m-d');

        self::assertCount(8, $this->slotGeneratorService()->generateSlots($eventType, $date));
    }

    public function testGenerateSlotsForFortyFiveMinutes(): void
    {
        $eventType = $this->createEventType('Workshop', 'Forty five minutes', 45);
        $date = $this->inWindowWeekdayDate();

        $slots = $this->slotGeneratorService()->generateSlots($eventType, $date->format('Y-m-d'));

        self::assertCount(10, $slots);
        self::assertSame($this->moscowDateToUtcAtom(9, 45, $date), $slots[1]['startTime']);
        self::assertSame($this->moscowDateToUtcAtom(16, 30, $date), $slots[9]['endTime']);
    }

    public function testGenerateSlotsOutsideWindowReturnsEmpty(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $date = $this->outsideWindowDate()->format('Y-m-d');

        self::assertSame([], $this->slotGeneratorService()->generateSlots($eventType, $date));
    }

    private function slotGeneratorService(): SlotGeneratorService
    {
        return static::getContainer()->get(SlotGeneratorService::class);
    }
}
