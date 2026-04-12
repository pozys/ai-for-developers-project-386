<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\HttpFoundation\Response;

class CorsTest extends ApiTestCase
{
    public function testPreflightRequestReturnsCorsHeaders(): void
    {
        $this->client->request(
            'OPTIONS',
            '/api/event-types',
            server: [
                'HTTP_ORIGIN' => 'http://localhost:5173',
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
                'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Content-Type',
            ],
        );

        $response = $this->client->getResponse();

        self::assertContains($response->getStatusCode(), [Response::HTTP_OK, Response::HTTP_NO_CONTENT]);
        self::assertSame('http://localhost:5173', $response->headers->get('Access-Control-Allow-Origin'));

        $allowMethods = (string) $response->headers->get('Access-Control-Allow-Methods');
        self::assertStringContainsString('GET', $allowMethods);
        self::assertStringContainsString('POST', $allowMethods);
        self::assertStringContainsString('PUT', $allowMethods);
    }
}
