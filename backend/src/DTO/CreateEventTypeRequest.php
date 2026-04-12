<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateEventTypeRequest
{
    #[Assert\NotBlank]
    public ?string $name = null;

    #[Assert\NotBlank]
    public ?string $description = null;

    #[Assert\NotBlank]
    #[Assert\Type('integer')]
    #[Assert\Positive]
    public mixed $durationMinutes = null;
}
