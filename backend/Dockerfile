FROM php:8.4-cli

RUN apt-get update && apt-get install -y unzip libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-interaction --prefer-dist --no-progress

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
