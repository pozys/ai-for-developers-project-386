<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateBookingRequest
{
    #[Assert\NotBlank]
    public ?string $guestName = null;

    #[Assert\NotBlank]
    #[Assert\Email]
    public ?string $guestEmail = null;

    public ?string $comment = null;

    #[Assert\NotBlank]
    #[Assert\Uuid]
    public ?string $eventTypeId = null;

    #[Assert\NotBlank]
    #[Assert\DateTime(format: DATE_ATOM)]
    public ?string $startTime = null;
}
