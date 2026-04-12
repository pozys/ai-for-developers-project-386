<?php

namespace App\Controller;

use App\DTO\CreateEventTypeRequest;
use App\DTO\UpdateEventTypeRequest;
use App\Entity\EventType;
use App\Entity\Owner;
use App\Repository\EventTypeRepository;
use App\Repository\OwnerRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/event-types')]
class AdminEventTypeController extends AbstractApiController
{
    public function __construct(
        ValidatorInterface $validator,
        private readonly EntityManagerInterface $entityManager,
        private readonly EventTypeRepository $eventTypeRepository,
        private readonly OwnerRepository $ownerRepository,
    ) {
        parent::__construct($validator);
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $eventTypes = $this->eventTypeRepository->findBy([], ['name' => 'ASC']);

        return $this->json(array_map([$this, 'eventTypeToArray'], $eventTypes));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = $this->decodeJson($request);
        $dto = $this->hydrateCreateRequest($payload);

        if ($response = $this->validateDto($dto)) {
            return $response;
        }

        $owner = $this->getDefaultOwner();
        if ($owner === null) {
            return $this->json(['message' => 'Owner not found'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $eventType = new EventType(Uuid::v4()->toRfc4122());
        $eventType
            ->setOwner($owner)
            ->setName($dto->name)
            ->setDescription($dto->description)
            ->setDurationMinutes((int) $dto->durationMinutes);

        $this->entityManager->persist($eventType);
        $this->entityManager->flush();

        return $this->json($this->eventTypeToArray($eventType), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $eventType = $this->eventTypeRepository->find($id);
        if (!$eventType instanceof EventType) {
            return $this->json(['message' => 'Event type not found'], Response::HTTP_NOT_FOUND);
        }

        $payload = $this->decodeJson($request);
        $dto = $this->hydrateUpdateRequest($payload);

        if ($response = $this->validateDto($dto, array_keys($payload))) {
            return $response;
        }

        if (array_key_exists('name', $payload)) {
            $eventType->setName($dto->name);
        }

        if (array_key_exists('description', $payload)) {
            $eventType->setDescription($dto->description);
        }

        if (array_key_exists('durationMinutes', $payload)) {
            $eventType->setDurationMinutes((int) $dto->durationMinutes);
        }

        $this->entityManager->flush();

        return $this->json($this->eventTypeToArray($eventType));
    }

    private function getDefaultOwner(): ?Owner
    {
        $owner = $this->ownerRepository->findOneBy([]);

        return $owner instanceof Owner ? $owner : null;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function hydrateCreateRequest(array $payload): CreateEventTypeRequest
    {
        $dto = new CreateEventTypeRequest();
        $dto->name = $payload['name'] ?? null;
        $dto->description = $payload['description'] ?? null;
        $dto->durationMinutes = $payload['durationMinutes'] ?? null;

        return $dto;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function hydrateUpdateRequest(array $payload): UpdateEventTypeRequest
    {
        $dto = new UpdateEventTypeRequest();
        $dto->name = $payload['name'] ?? null;
        $dto->description = $payload['description'] ?? null;
        $dto->durationMinutes = $payload['durationMinutes'] ?? null;

        return $dto;
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
