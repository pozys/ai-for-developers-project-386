<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\HttpFoundation\Response;

class PublicBookingControllerTest extends ApiTestCase
{
    public function testCreateBookingSuccess(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $guestName = 'Jane Doe';
        $guestEmail = 'jane@example.com';
        $startTime = '2026-04-13T06:00:00+00:00';
        $endTime = '2026-04-13T06:30:00+00:00';

        $response = $this->requestJson('POST', '/api/bookings', [
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'eventTypeId' => $eventType->getId(),
            'startTime' => $startTime,
        ]);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertStringStartsWith('application/json', (string) $response->headers->get('Content-Type'));

        $data = $this->jsonResponse($response);
        self::assertArrayHasKey('id', $data);
        self::assertSame($eventType->getId(), $data['eventTypeId']);
        self::assertSame($eventType->getName(), $data['eventTypeName']);
        self::assertSame($guestName, $data['guestName']);
        self::assertSame($guestEmail, $data['guestEmail']);
        self::assertNull($data['comment']);
        self::assertSame($startTime, $data['startTime']);
        self::assertSame($endTime, $data['endTime']);
    }

    public function testCreateBookingWithComment(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);

        $guestName = 'Jane Doe';
        $guestEmail = 'jane@example.com';
        $startTime = '2026-04-13T06:30:00+00:00';

        $response = $this->requestJson('POST', '/api/bookings', [
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'comment' => 'Discuss project scope',
            'eventTypeId' => $eventType->getId(),
            'startTime' => $startTime,
        ]);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        self::assertSame('Discuss project scope', $this->jsonResponse($response)['comment']);
    }

    public function testCreateBookingValidationErrors(): void
    {
        $response = $this->requestJson('POST', '/api/bookings', []);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame('Validation failed', $data['message']);
        self::assertContains('guestName', array_column($data['errors'], 'field'));
        self::assertContains('guestEmail', array_column($data['errors'], 'field'));
        self::assertContains('eventTypeId', array_column($data['errors'], 'field'));
        self::assertContains('startTime', array_column($data['errors'], 'field'));
    }

    public function testCreateBookingMalformedJson(): void
    {
        $this->client->request(
            'POST',
            '/api/bookings',
            server: [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            content: '{"guestName":',
        );

        $response = $this->client->getResponse();

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
        self::assertSame([
            'message' => 'Validation failed',
            'errors' => [
                [
                    'field' => 'body',
                    'message' => 'Malformed JSON body.',
                ],
            ],
        ], $this->jsonResponse($response));
    }

    public function testCreateBookingInvalidEventType(): void
    {
        $guestName = 'Jane Doe';
        $guestEmail = 'jane@example.com';
        $startTime = '2026-04-13T06:00:00+00:00';

        $response = $this->requestJson('POST', '/api/bookings', [
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'eventTypeId' => '123e4567-e89b-42d3-a456-426614174000',
            'startTime' => $startTime,
        ]);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame('Validation failed', $data['message']);
        self::assertSame(['eventTypeId'], array_column($data['errors'], 'field'));
    }

    public function testCreateBookingDuplicateSlot(): void
    {
        $eventType = $this->createEventType('Discovery call', 'Thirty minutes', 30);
        $guestName = 'Jane Doe';
        $guestEmail = 'jane@example.com';
        $startTime = '2026-04-13T06:00:00+00:00';

        $payload = [
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'eventTypeId' => $eventType->getId(),
            'startTime' => $startTime,
        ];

        $firstResponse = $this->requestJson('POST', '/api/bookings', $payload);
        self::assertSame(Response::HTTP_CREATED, $firstResponse->getStatusCode());

        $secondResponse = $this->requestJson('POST', '/api/bookings', $payload);
        self::assertSame(Response::HTTP_CONFLICT, $secondResponse->getStatusCode());
        self::assertSame(['message' => 'This time slot is already booked'], $this->jsonResponse($secondResponse));
    }

    public function testCreateBookingCrossEventTypeConflict(): void
    {
        $shortEventType = $this->createEventType('Thirty minutes', 'Short call', 30);
        $longEventType = $this->createEventType('Sixty minutes', 'Long call', 60);

        $guestName = 'Jane Doe';
        $guestEmail = 'jane@example.com';
        $firstStart = '2026-04-13T06:30:00+00:00';

        $firstResponse = $this->requestJson('POST', '/api/bookings', [
            'guestName' => $guestName,
            'guestEmail' => $guestEmail,
            'eventTypeId' => $shortEventType->getId(),
            'startTime' => $firstStart,
        ]);

        self::assertSame(Response::HTTP_CREATED, $firstResponse->getStatusCode());

        $conflictResponse = $this->requestJson('POST', '/api/bookings', [
            'guestName' => 'John Doe',
            'guestEmail' => 'john@example.com',
            'eventTypeId' => $longEventType->getId(),
            'startTime' => '2026-04-13T06:00:00+00:00',
        ]);

        self::assertSame(Response::HTTP_CONFLICT, $conflictResponse->getStatusCode());
        self::assertSame(['message' => 'This time slot is already booked'], $this->jsonResponse($conflictResponse));
    }
}
