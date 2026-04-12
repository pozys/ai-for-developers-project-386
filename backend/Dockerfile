FROM php:8.4-cli

RUN apt-get update && apt-get install -y unzip libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

ENV APP_ENV=prod \
    APP_DEBUG=0 \
    DATABASE_URL="sqlite:///%kernel.project_dir%/var/data/app.db"

COPY . .

RUN mkdir -p var/data \
    && rm -f var/data/app.db \
    && composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-progress \
    && php bin/console doctrine:migrations:migrate --no-interaction \
    && APP_ENV=dev php bin/console doctrine:fixtures:load --no-interaction

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
