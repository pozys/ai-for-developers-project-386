<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\DataFixtures\OwnerFixture;
use App\Entity\EventType;
use Symfony\Component\HttpFoundation\Response;

class AdminEventTypeControllerTest extends ApiTestCase
{
    public function testListEventTypesEmpty(): void
    {
        $response = $this->requestJson('GET', '/api/admin/event-types');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertStringStartsWith('application/json', (string) $response->headers->get('Content-Type'));
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testCreateEventType(): void
    {
        $response = $this->requestJson('POST', '/api/admin/event-types', [
            'name' => 'Консультация',
            'description' => '30 минут',
            'durationMinutes' => 30,
        ]);

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertArrayHasKey('id', $data);
        self::assertSame(OwnerFixture::OWNER_ID, $data['ownerId']);
        self::assertSame('Консультация', $data['name']);
        self::assertSame('30 минут', $data['description']);
        self::assertSame(30, $data['durationMinutes']);
    }

    public function testCreateEventTypeValidationErrors(): void
    {
        $response = $this->requestJson('POST', '/api/admin/event-types', []);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame('Validation failed', $data['message']);
        self::assertCount(3, $data['errors']);
        self::assertContains('name', array_column($data['errors'], 'field'));
        self::assertContains('description', array_column($data['errors'], 'field'));
        self::assertContains('durationMinutes', array_column($data['errors'], 'field'));
    }

    public function testCreateEventTypeInvalidDuration(): void
    {
        $response = $this->requestJson('POST', '/api/admin/event-types', [
            'name' => 'Консультация',
            'description' => '30 минут',
            'durationMinutes' => 0,
        ]);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame(['durationMinutes'], array_values(array_intersect(array_column($data['errors'], 'field'), ['durationMinutes'])));
    }

    public function testUpdateEventType(): void
    {
        $eventType = $this->createEventType('Первичное название', 'Старое описание', 30);

        $response = $this->requestJson('PUT', '/api/admin/event-types/'.$eventType->getId(), [
            'name' => 'Обновлённое название',
        ]);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame($eventType->getId(), $data['id']);
        self::assertSame(OwnerFixture::OWNER_ID, $data['ownerId']);
        self::assertSame('Обновлённое название', $data['name']);
        self::assertSame('Старое описание', $data['description']);
        self::assertSame(30, $data['durationMinutes']);
    }

    public function testUpdateEventTypeNotFound(): void
    {
        $response = $this->requestJson('PUT', '/api/admin/event-types/00000000-0000-0000-0000-000000000000', [
            'name' => 'Обновлённое название',
        ]);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        self::assertSame(['message' => 'Event type not found'], $this->jsonResponse($response));
    }

    public function testUpdateEventTypeValidation(): void
    {
        $eventType = $this->createEventType();

        $response = $this->requestJson('PUT', '/api/admin/event-types/'.$eventType->getId(), [
            'durationMinutes' => 0,
        ]);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertSame('Validation failed', $data['message']);
        self::assertSame(['durationMinutes'], array_column($data['errors'], 'field'));
    }

    public function testListEventTypesReturnsAll(): void
    {
        $first = $this->createEventType('Alpha', 'First', 15);
        $second = $this->createEventType('Beta', 'Second', 30);

        $response = $this->requestJson('GET', '/api/admin/event-types');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertCount(2, $data);
        self::assertSame(['Alpha', 'Beta'], array_column($data, 'name'));
        self::assertContains($first->getId(), array_column($data, 'id'));
        self::assertContains($second->getId(), array_column($data, 'id'));
    }
}
