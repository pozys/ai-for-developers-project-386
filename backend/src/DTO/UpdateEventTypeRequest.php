<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateEventTypeRequest
{
    #[Assert\NotBlank]
    public ?string $name = null;

    #[Assert\NotBlank]
    public ?string $description = null;

    #[Assert\Type('integer')]
    #[Assert\Positive]
    public mixed $durationMinutes = null;
}
