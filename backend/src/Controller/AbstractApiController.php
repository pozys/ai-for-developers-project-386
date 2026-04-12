<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\ConstraintViolationList;
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
        $errors = $this->buildValidationErrors($violations);

        return $this->validationErrorResponseFromErrors($errors);
    }

    /**
     * @param array<int, array{field: string, message: string}> $errors
     */
    protected function validationErrorResponseFromErrors(array $errors): JsonResponse
    {
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

            /** @var ConstraintViolationInterface $violation */
            foreach ($violations as $violation) {
                $field = trim($violation->getPropertyPath(), '[]');

                if (isset($submittedFields[$field])) {
                    $filtered[] = $violation;
                }
            }

            $violations = new ConstraintViolationList($filtered);
        }

        if (count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        return null;
    }

    /**
     * @return array<int, array{field: string, message: string}>
     */
    private function buildValidationErrors(ConstraintViolationListInterface $violations): array
    {
        $errors = [];

        /** @var ConstraintViolationInterface $violation */
        foreach ($violations as $violation) {
            $errors[] = [
                'field' => trim($violation->getPropertyPath(), '[]'),
                'message' => $violation->getMessage(),
            ];
        }

        return $errors;
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
