<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Booking;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    /**
     * @return array<int, Booking>
     */
    public function findAllOrderedByStartTime(): array
    {
        return $this->findBy([], ['startTime' => 'ASC']);
    }

    public function hasOverlappingBookings(DateTimeImmutable $start, DateTimeImmutable $end): bool
    {
        $count = (int) $this->createQueryBuilder('booking')
            ->select('COUNT(booking.id)')
            ->andWhere('booking.startTime < :end')
            ->andWhere('booking.endTime > :start')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }
}
