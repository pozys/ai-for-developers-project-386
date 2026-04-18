FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM php:8.4-cli AS runtime
RUN apt-get update && apt-get install -y unzip libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY backend/ .
COPY --from=frontend-build /frontend/dist/ public/
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-progress
RUN chmod +x docker-entrypoint.sh
ENV APP_ENV=prod \
    APP_DEBUG=0 \
    DATABASE_URL="sqlite:///%kernel.project_dir%/var/data/app.db" \
    CORS_ALLOW_ORIGIN="*" \
    PORT=8000
EXPOSE 8000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
