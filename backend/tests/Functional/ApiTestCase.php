<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\DataFixtures\OwnerFixture;
use App\Entity\Booking;
use App\Entity\EventType;
use App\Entity\Owner;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Uid\Uuid;

abstract class ApiTestCase extends WebTestCase
{
    private const MOSCOW_TIMEZONE = 'Europe/Moscow';
    private const UTC_TIMEZONE = 'UTC';

    protected KernelBrowser $client;
    protected EntityManagerInterface $entityManager;
    protected DateTimeImmutable $referenceNowMoscow;

    protected function setUp(): void
    {
        self::ensureKernelShutdown();
        $this->client = static::createClient();
        $this->client->disableReboot();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $this->referenceNowMoscow = new DateTimeImmutable('now', new DateTimeZone(self::MOSCOW_TIMEZONE));

        $this->resetDatabase();
        $this->loadFixtures();
    }

    protected function tearDown(): void
    {
        unset($this->client, $this->entityManager, $this->referenceNowMoscow);
        self::ensureKernelShutdown();
    }

    /**
     * @return array<string, mixed>
     */
    protected function jsonResponse(Response $response): array
    {
        $decoded = json_decode($response->getContent() ?: '[]', true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param array<string, mixed> $payload
     */
    protected function requestJson(string $method, string $uri, array $payload = []): Response
    {
        $this->client->request(
            $method,
            $uri,
            server: [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );

        return $this->client->getResponse();
    }

    protected function createEventType(
        string $name = 'Discovery call',
        string $description = '30 minutes',
        int $durationMinutes = 30,
    ): EventType {
        $owner = $this->entityManager->getRepository(Owner::class)->find(OwnerFixture::OWNER_ID);
        if (!$owner instanceof Owner) {
            throw new \RuntimeException('Owner fixture was not loaded.');
        }

        $eventType = new EventType(Uuid::v4()->toRfc4122());
        $eventType
            ->setOwner($owner)
            ->setName($name)
            ->setDescription($description)
            ->setDurationMinutes($durationMinutes);

        $this->entityManager->persist($eventType);
        $this->entityManager->flush();

        return $eventType;
    }

    protected function createBooking(
        EventType $eventType,
        string $startTime,
        string $endTime,
        string $guestName = 'Jane Doe',
        string $guestEmail = 'jane@example.com',
        ?string $comment = null,
    ): Booking {
        $booking = new Booking(Uuid::v4()->toRfc4122());
        $booking
            ->setEventType($eventType)
            ->setEventTypeName($eventType->getName())
            ->setGuestName($guestName)
            ->setGuestEmail($guestEmail)
            ->setComment($comment)
            ->setStartTime(new \DateTimeImmutable($startTime))
            ->setEndTime(new \DateTimeImmutable($endTime));

        $this->entityManager->persist($booking);
        $this->entityManager->flush();

        return $booking;
    }

    protected function todayMoscow(): DateTimeImmutable
    {
        return $this->referenceNowMoscow->setTime(0, 0);
    }

    protected function inWindowWeekdayDate(): DateTimeImmutable
    {
        return $this->nextWeekday($this->todayMoscow());
    }

    protected function nextWeekendDate(): DateTimeImmutable
    {
        $date = $this->todayMoscow();
        while (!in_array($date->format('N'), ['6', '7'], true)) {
            $date = $date->modify('+1 day');
        }

        return $date;
    }

    protected function outsideWindowDate(): DateTimeImmutable
    {
        return $this->todayMoscow()->modify('+14 days');
    }

    protected function nextWeekday(DateTimeImmutable $date): DateTimeImmutable
    {
        while (in_array($date->format('N'), ['6', '7'], true)) {
            $date = $date->modify('+1 day');
        }

        return $date;
    }

    protected function moscowDateToUtc(int $hour, int $minute, DateTimeImmutable $moscowDate): DateTimeImmutable
    {
        return $moscowDate
            ->setTime($hour, $minute)
            ->setTimezone(new DateTimeZone(self::UTC_TIMEZONE));
    }

    protected function moscowDateToUtcAtom(int $hour, int $minute, DateTimeImmutable $moscowDate): string
    {
        return $this->moscowDateToUtc($hour, $minute, $moscowDate)->format(DATE_ATOM);
    }

    private function resetDatabase(): void
    {
        $schemaTool = new SchemaTool($this->entityManager);
        $metadata = $this->entityManager->getMetadataFactory()->getAllMetadata();

        if ($metadata !== []) {
            $schemaTool->dropSchema($metadata);
            $schemaTool->createSchema($metadata);
        }
    }

    private function loadFixtures(): void
    {
        (new OwnerFixture())->load($this->entityManager);
    }
}
