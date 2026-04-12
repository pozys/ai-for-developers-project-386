<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

abstract class AbstractApiController extends AbstractController
{
    public function __construct(
        protected readonly ValidatorInterface $validator,
    ) {
    }

    protected function validationErrorResponse(ConstraintViolationListInterface $violations): JsonResponse
    {
        $errors = [];

        /** @var ConstraintViolationInterface $violation */
        foreach ($violations as $violation) {
            $errors[] = [
                'field' => trim($violation->getPropertyPath(), '[]'),
                'message' => $violation->getMessage(),
            ];
        }

        return $this->json([
            'message' => 'Validation failed',
            'errors' => $errors,
        ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * @param array<string> $submittedFields
     */
    protected function validateDto(object $dto, array $submittedFields = []): ?JsonResponse
    {
        $violations = $this->validator->validate($dto);

        if ($submittedFields !== []) {
            $submittedFields = array_fill_keys($submittedFields, true);
            $filtered = [];

            foreach ($violations as $violation) {
                $field = trim($violation->getPropertyPath(), '[]');

                if (isset($submittedFields[$field])) {
                    $filtered[] = $violation;
                }
            }

            $violations = new \Symfony\Component\Validator\ConstraintViolationList($filtered);
        }

        if (count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    protected function decodeJson(Request $request): array
    {
        $content = trim($request->getContent());

        if ($content === '') {
            return [];
        }

        $decoded = json_decode($content, true);

        return is_array($decoded) ? $decoded : [];
    }
}
