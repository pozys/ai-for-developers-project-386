<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\HttpFoundation\Response;

class AdminBookingControllerTest extends ApiTestCase
{
    public function testListBookingsEmpty(): void
    {
        $response = $this->requestJson('GET', '/api/admin/bookings');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertSame([], $this->jsonResponse($response));
    }

    public function testListBookingsSortedByStartTime(): void
    {
        $eventType = $this->createEventType();
        $late = $this->createBooking($eventType, '2026-04-14 12:00:00 UTC', '2026-04-14 12:30:00 UTC', 'Late Guest');
        $early = $this->createBooking($eventType, '2026-04-14 09:00:00 UTC', '2026-04-14 09:30:00 UTC', 'Early Guest');

        $response = $this->requestJson('GET', '/api/admin/bookings');

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $data = $this->jsonResponse($response);
        self::assertCount(2, $data);
        self::assertSame([$early->getId(), $late->getId()], array_column($data, 'id'));
        self::assertSame(['Early Guest', 'Late Guest'], array_column($data, 'guestName'));
    }
}
