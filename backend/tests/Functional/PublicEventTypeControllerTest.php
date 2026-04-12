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

        $data = $this->jsonResponse($response);
        self::assertCount(2, $data);
        self::assertSame(['Alpha', 'Beta'], array_column($data, 'name'));
        self::assertContains($first->getId(), array_column($data, 'id'));
        self::assertContains($second->getId(), array_column($data, 'id'));
    }

    public function testListSlotsForWeekday(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date=2026-04-13');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonResponse($response);
        self::assertCount(16, $slots);
        self::assertSame('2026-04-13T06:00:00+00:00', $slots[0]['startTime']);
        self::assertSame('2026-04-13T14:00:00+00:00', $slots[15]['endTime']);
        self::assertTrue(array_reduce($slots, static fn (bool $carry, array $slot): bool => $carry && $slot['available'], true));
    }

    public function testListSlotsWithBooking(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $this->createBooking($eventType, '2026-04-13 06:00:00 UTC', '2026-04-13 06:30:00 UTC');

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date=2026-04-13');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonResponse($response);
        self::assertFalse($slots[0]['available']);
        self::assertTrue($slots[1]['available']);
    }

    public function testListSlotsNoDateParam(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $slots = $this->jsonResponse($response);
        self::assertCount(16, $slots);

        $expectedDate = $this->nextWeekday(new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('Y-m-d');
        self::assertSame($expectedDate, (new DateTimeImmutable($slots[0]['startTime']))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('Y-m-d'));
    }

    public function testListSlotsForWeekend(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date=2026-04-18');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testListSlotsOutsideWindow(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $outOfWindowDate = $this->todayMoscow()->modify('+14 days')->format('Y-m-d');

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date='.$outOfWindowDate);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testListSlots60MinDuration(): void
    {
        $eventType = $this->createEventType('Strategy session', 'Sixty minutes', 60);

        $response = $this->requestJson('GET', '/api/event-types/'.$eventType->getId().'/slots?date=2026-04-13');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertCount(8, $this->jsonResponse($response));
    }

    public function testListSlotsEventTypeNotFound(): void
    {
        $response = $this->requestJson('GET', '/api/event-types/00000000-0000-0000-0000-000000000000/slots');

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        self::assertSame(['message' => 'Event type not found'], $this->jsonResponse($response));
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
