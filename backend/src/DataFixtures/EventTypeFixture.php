<?php

namespace App\DataFixtures;

use App\Entity\EventType;
use App\Entity\Owner;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EventTypeFixture extends Fixture implements DependentFixtureInterface, FixtureGroupInterface
{
    public function load(ObjectManager $manager): void
    {
        $owner = $manager->getRepository(Owner::class)->find(OwnerFixture::OWNER_ID);
        if (!$owner instanceof Owner) {
            throw new \RuntimeException('Owner fixture was not loaded.');
        }

        $consultations = [
            ['22222222-2222-4222-8222-222222222221', 'Быстрая консультация', 'Короткая встреча для обсуждения конкретного вопроса.', 30],
            ['22222222-2222-4222-8222-222222222222', 'Стандартная встреча', 'Полноценное обсуждение задачи или проекта.', 60],
        ];

        foreach ($consultations as [$id, $name, $description, $duration]) {
            $eventType = new EventType($id);
            $eventType
                ->setOwner($owner)
                ->setName($name)
                ->setDescription($description)
                ->setDurationMinutes($duration);

            $manager->persist($eventType);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [OwnerFixture::class];
    }

    public static function getGroups(): array
    {
        return ['demo'];
    }
}
