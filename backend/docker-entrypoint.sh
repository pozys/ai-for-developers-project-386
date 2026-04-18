#!/bin/sh
set -e

mkdir -p var/data
rm -f var/data/app.db
php bin/console doctrine:migrations:migrate --no-interaction
APP_ENV=dev php bin/console doctrine:fixtures:load --no-interaction
APP_ENV=prod php bin/console cache:clear

exec php -S "0.0.0.0:${PORT:-8000}" -t public public/router.php
