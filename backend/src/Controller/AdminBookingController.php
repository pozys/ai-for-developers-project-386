<?php

namespace App\Controller;

use App\Repository\BookingRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/bookings')]
class AdminBookingController extends AbstractApiController
{
    public function __construct(
        ValidatorInterface $validator,
        private readonly BookingRepository $bookingRepository,
    ) {
        parent::__construct($validator);
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $bookings = $this->bookingRepository->findAllOrderedByStartTime();

        return $this->json(array_map([$this, 'bookingToArray'], $bookings));
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingToArray(\App\Entity\Booking $booking): array
    {
        return [
            'id' => $booking->getId(),
            'guestName' => $booking->getGuestName(),
            'guestEmail' => $booking->getGuestEmail(),
            'comment' => $booking->getComment(),
            'eventTypeId' => $booking->getEventType()->getId(),
            'eventTypeName' => $booking->getEventTypeName(),
            'startTime' => $booking->getStartTime()->format(DATE_ATOM),
            'endTime' => $booking->getEndTime()->format(DATE_ATOM),
        ];
    }
}
