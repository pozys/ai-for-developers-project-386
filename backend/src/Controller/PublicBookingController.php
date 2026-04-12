<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\CreateBookingRequest;
use App\Entity\Booking;
use App\Exception\EventTypeNotFoundException;
use App\Exception\SlotAlreadyBookedException;
use App\Service\BookingService;
use JsonException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/bookings')]
final class PublicBookingController extends AbstractApiController
{
    public function __construct(
        ValidatorInterface $validator,
        private readonly BookingService $bookingService,
    ) {
        parent::__construct($validator);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $payload = $this->decodeJson($request);
        } catch (JsonException) {
            return $this->malformedJsonResponse();
        }

        $dto = $this->hydrateCreateRequest($payload);

        if ($response = $this->validateDto($dto)) {
            return $response;
        }

        try {
            $booking = $this->bookingService->createBooking($dto);
        } catch (EventTypeNotFoundException) {
            return $this->validationErrorResponseFromErrors([
                [
                    'field' => 'eventTypeId',
                    'message' => 'This value is not valid.',
                ],
            ]);
        } catch (SlotAlreadyBookedException) {
            return $this->json(['message' => 'This time slot is already booked'], Response::HTTP_CONFLICT);
        }

        return $this->json($this->bookingToArray($booking), Response::HTTP_CREATED);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function hydrateCreateRequest(array $payload): CreateBookingRequest
    {
        $dto = new CreateBookingRequest();
        $dto->guestName = $payload['guestName'] ?? null;
        $dto->guestEmail = $payload['guestEmail'] ?? null;
        $dto->comment = array_key_exists('comment', $payload) ? $payload['comment'] : null;
        $dto->eventTypeId = $payload['eventTypeId'] ?? null;
        $dto->startTime = $payload['startTime'] ?? null;

        return $dto;
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingToArray(Booking $booking): array
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
