<?php

namespace App\DataFixtures;

use App\Entity\Owner;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class OwnerFixture extends Fixture
{
    public const OWNER_ID = '11111111-1111-1111-1111-111111111111';

    public function load(ObjectManager $manager): void
    {
        $owner = new Owner(self::OWNER_ID);
        $owner
            ->setName('Booking Owner')
            ->setEmail('owner@example.com');

        $manager->persist($owner);
        $manager->flush();
    }
}
