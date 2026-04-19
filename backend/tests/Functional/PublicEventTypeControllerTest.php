<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use DateTimeImmutable;
use DateTimeZone;
use Symfony\Component\HttpFoundation\Response;

class PublicEventTypeControllerTest extends ApiTestCase
{
    public function testListEventTypes(): void
    {
        $first = $this->createEventType('Alpha', 'First', 15);
        $second = $this->createEventType('Beta', 'Second', 30);

        $response = $this->requestJson('GET', '/api/event-types');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertStringStartsWith('application/json', (string) $response->headers->get('Content-Type'));

        $data = $this->jsonListResponse($response);
        self::assertCount(2, $data);
        self::assertSame(['Alpha', 'Beta'], array_column($data, 'name'));
        self::assertContains($first->getId(), array_column($data, 'id'));
        self::assertContains($second->getId(), array_column($data, 'id'));
    }

    public function testListSlotsForWeekday(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $date = $this->inWindowWeekdayDate();

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$date->format('Y-m-d'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonListResponse($response);
        self::assertCount(16, $slots);
        self::assertSame($this->moscowDateToUtcAtom(9, 0, $date), $slots[0]['startTime']);
        self::assertSame($this->moscowDateToUtcAtom(17, 0, $date), $slots[15]['endTime']);
        self::assertTrue(array_reduce($slots, static fn (bool $carry, array $slot): bool => $carry && $slot['available'], true));
    }

    public function testListSlotsWithBooking(): void
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

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$date->format('Y-m-d'));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonListResponse($response);
        self::assertFalse($slots[0]['available']);
        self::assertTrue($slots[1]['available']);
    }

    public function testListSlotsNoDateParam(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonListResponse($response);
        self::assertCount(16, $slots);

        $expectedDate = $this->nextWeekday($this->todayMoscow())->format('Y-m-d');
        self::assertSame($expectedDate, (new DateTimeImmutable($slots[0]['startTime']))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('Y-m-d'));
    }

    public function testListSlotsForWeekend(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $date = $this->nextWeekendDate()->format('Y-m-d');

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$date);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testListSlotsOutsideWindow(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $outOfWindowDate = $this->outsideWindowDate()->format('Y-m-d');

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$outOfWindowDate);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testListSlots60MinDuration(): void
    {
        $eventType = $this->createEventType('Strategy session', 'Sixty minutes', 60);
        $date = $this->inWindowWeekdayDate()->format('Y-m-d');

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$date);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(8, $this->jsonListResponse($response));
    }

    public function testListSlotsEventTypeNotFound(): void
    {
        $response = $this->requestJson('GET', '/api/event-types/00000000-0000-0000-0000-000000000000/slots');

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        self::assertSame(['message' => 'Event type not found'], $this->jsonResponse($response));
    }
}
