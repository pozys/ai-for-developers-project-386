#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="ai-for-developers-project-386-backend-tools"
DOCKERFILE_PATH="$ROOT_DIR/backend/Dockerfile.tools"
BACKEND_DIR="$ROOT_DIR/backend"

build_image() {
	docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" "$ROOT_DIR" >/dev/null
}

run_backend() {
	local command="$1"
	shift || true
	docker run --rm \
		-v "$BACKEND_DIR:/app" \
		-w /app \
		"$IMAGE_NAME" \
		sh -lc "$command" -- "$@"
}

bootstrap='composer install --no-interaction --prefer-dist --no-progress --no-scripts >/dev/null'

case "${1:-}" in
	lint)
		build_image
		run_backend "$bootstrap && composer lint"
		;;
	format)
		build_image
		run_backend "$bootstrap && composer cs:fix"
		;;
	test)
		build_image
		run_backend "$bootstrap && composer test"
		;;
	coverage)
		build_image
		run_backend "$bootstrap && php -d pcov.enabled=1 bin/phpunit --coverage-text"
		;;
	fix-staged)
		shift || true
		if [ "$#" -eq 0 ]; then
			exit 0
		fi

		build_image
		run_backend \
			"$bootstrap && vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --path-mode=intersection --allow-risky=yes \"\$@\"" \
			"$@"
		;;
	*)
		cat <<'EOF' >&2
Usage: scripts/backend-quality.sh {lint|format|test|coverage|fix-staged [paths...]}
EOF
		exit 2
		;;
esac
