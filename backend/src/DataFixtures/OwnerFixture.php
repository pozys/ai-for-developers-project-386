<?php

namespace App\DataFixtures;

use App\Entity\Owner;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class OwnerFixture extends Fixture implements FixtureGroupInterface
{
    public const OWNER_ID = '11111111-1111-4111-8111-111111111111';

    public function load(ObjectManager $manager): void
    {
        $owner = new Owner(self::OWNER_ID);
        $owner
            ->setName('Booking Owner')
            ->setEmail('owner@example.com');

        $manager->persist($owner);
        $manager->flush();
    }

    public static function getGroups(): array
    {
        return ['required', 'demo'];
    }
}
