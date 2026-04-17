<?php

namespace App\DataFixtures;

use App\Entity\EventType;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EventTypeFixture extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $owner = $manager->getReference(\App\Entity\Owner::class, OwnerFixture::OWNER_ID);

        $consultations = [
            ['22222222-2222-2222-2222-222222222221', 'Быстрая консультация', 'Короткая встреча для обсуждения конкретного вопроса.', 30],
            ['22222222-2222-2222-2222-222222222222', 'Стандартная встреча', 'Полноценное обсуждение задачи или проекта.', 60],
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
}
