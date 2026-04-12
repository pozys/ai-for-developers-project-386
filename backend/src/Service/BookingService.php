<?php

declare(strict_types=1);

namespace App\Service;

use App\DTO\CreateBookingRequest;
use App\Entity\Booking;
use App\Entity\EventType;
use App\Exception\EventTypeNotFoundException;
use App\Exception\SlotAlreadyBookedException;
use App\Repository\BookingRepository;
use App\Repository\EventTypeRepository;
use DateTimeImmutable;
use DateTimeZone;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

final class BookingService
{
    private const UTC_TIMEZONE = 'UTC';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly EventTypeRepository $eventTypeRepository,
        private readonly BookingRepository $bookingRepository,
    ) {
    }

    /**
     * @throws EventTypeNotFoundException
     * @throws SlotAlreadyBookedException
     */
    public function createBooking(CreateBookingRequest $dto): Booking
    {
        $eventType = $this->findEventType($dto->eventTypeId);
        $startTime = $this->normalizeToUtc($dto->startTime);
        $endTime = $startTime->modify(sprintf('+%d minutes', $eventType->getDurationMinutes()));

        if ($this->bookingRepository->hasOverlappingBookings($startTime, $endTime)) {
            throw new SlotAlreadyBookedException('This time slot is already booked');
        }

        $booking = new Booking(Uuid::v4()->toRfc4122());
        $booking
            ->setEventType($eventType)
            ->setEventTypeName($eventType->getName())
            ->setGuestName($dto->guestName)
            ->setGuestEmail($dto->guestEmail)
            ->setComment($dto->comment)
            ->setStartTime($startTime)
            ->setEndTime($endTime);

        $this->entityManager->persist($booking);

        try {
            $this->entityManager->flush();
        } catch (UniqueConstraintViolationException $exception) {
            throw new SlotAlreadyBookedException('This time slot is already booked', 0, $exception);
        }

        return $booking;
    }

    /**
     * @throws EventTypeNotFoundException
     */
    private function findEventType(?string $eventTypeId): EventType
    {
        $eventType = $eventTypeId === null ? null : $this->eventTypeRepository->find($eventTypeId);

        if (!$eventType instanceof EventType) {
            throw new EventTypeNotFoundException('Event type not found');
        }

        return $eventType;
    }

    private function normalizeToUtc(string $value): DateTimeImmutable
    {
        $dateTime = new DateTimeImmutable($value, new DateTimeZone(self::UTC_TIMEZONE));

        return $dateTime->setTimezone(new DateTimeZone(self::UTC_TIMEZONE));
    }
}
