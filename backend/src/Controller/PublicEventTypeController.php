<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\EventType;
use App\Repository\EventTypeRepository;
use App\Service\SlotGeneratorService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/event-types')]
final class PublicEventTypeController extends AbstractApiController
{
    public function __construct(
        ValidatorInterface $validator,
        private readonly EventTypeRepository $eventTypeRepository,
        private readonly SlotGeneratorService $slotGeneratorService,
    ) {
        parent::__construct($validator);
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $eventTypes = $this->eventTypeRepository->findBy([], ['name' => 'ASC']);

        return $this->json(array_map([$this, 'eventTypeToArray'], $eventTypes));
    }

    #[Route('/{id}/slots', methods: ['GET'])]
    public function listSlots(string $id, Request $request): JsonResponse
    {
        $eventType = $this->eventTypeRepository->find($id);
        if (!$eventType instanceof EventType) {
            return $this->json(['message' => 'Event type not found'], Response::HTTP_NOT_FOUND);
        }

        $date = $request->query->get('date');
        $date = is_string($date) && $date !== '' ? $date : null;

        return $this->json($this->slotGeneratorService->generateSlots($eventType, $date));
    }

    /**
     * @return array<string, mixed>
     */
    private function eventTypeToArray(EventType $eventType): array
    {
        return [
            'id' => $eventType->getId(),
            'ownerId' => $eventType->getOwner()->getId(),
            'name' => $eventType->getName(),
            'description' => $eventType->getDescription(),
            'durationMinutes' => $eventType->getDurationMinutes(),
        ];
    }
}
