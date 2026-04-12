<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260412174915 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE booking (id VARCHAR(36) NOT NULL, guest_name VARCHAR(255) NOT NULL, guest_email VARCHAR(255) NOT NULL, comment CLOB DEFAULT NULL, event_type_name VARCHAR(255) NOT NULL, start_time DATETIME NOT NULL, end_time DATETIME NOT NULL, event_type_id VARCHAR(36) NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_E00CEDDE401B253C FOREIGN KEY (event_type_id) REFERENCES event_type (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_E00CEDDE401B253C ON booking (event_type_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_booking_start_time ON booking (start_time)');
        $this->addSql('CREATE TABLE event_type (id VARCHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, description CLOB NOT NULL, duration_minutes INTEGER NOT NULL, owner_id VARCHAR(36) NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_93151B827E3C61F9 FOREIGN KEY (owner_id) REFERENCES owner (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_93151B827E3C61F9 ON event_type (owner_id)');
        $this->addSql('CREATE TABLE owner (id VARCHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, PRIMARY KEY (id))');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE booking');
        $this->addSql('DROP TABLE event_type');
        $this->addSql('DROP TABLE owner');
    }
}
