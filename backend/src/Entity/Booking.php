<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'booking')]
#[ORM\UniqueConstraint(name: 'uniq_booking_start_time', columns: ['start_time'])]
class Booking
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\Column(length: 255)]
    private string $guestName;

    #[ORM\Column(length: 255)]
    private string $guestEmail;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comment = null;

    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    private EventType $eventType;

    #[ORM\Column(length: 255)]
    private string $eventTypeName;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $startTime;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $endTime;

    public function __construct(string $id)
    {
        $this->id = $id;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getGuestName(): string
    {
        return $this->guestName;
    }

    public function setGuestName(string $guestName): self
    {
        $this->guestName = $guestName;

        return $this;
    }

    public function getGuestEmail(): string
    {
        return $this->guestEmail;
    }

    public function setGuestEmail(string $guestEmail): self
    {
        $this->guestEmail = $guestEmail;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): self
    {
        $this->comment = $comment;

        return $this;
    }

    public function getEventType(): EventType
    {
        return $this->eventType;
    }

    public function setEventType(EventType $eventType): self
    {
        $this->eventType = $eventType;

        return $this;
    }

    public function getEventTypeName(): string
    {
        return $this->eventTypeName;
    }

    public function setEventTypeName(string $eventTypeName): self
    {
        $this->eventTypeName = $eventTypeName;

        return $this;
    }

    public function getStartTime(): \DateTimeImmutable
    {
        return $this->startTime;
    }

    public function setStartTime(\DateTimeImmutable $startTime): self
    {
        $this->startTime = $startTime;

        return $this;
    }

    public function getEndTime(): \DateTimeImmutable
    {
        return $this->endTime;
    }

    public function setEndTime(\DateTimeImmutable $endTime): self
    {
        $this->endTime = $endTime;

        return $this;
    }
}
