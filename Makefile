.PHONY: \
	install \
	serve \
	db-migrate db-fixtures \
	test test-coverage \
	e2e e2e-ui e2e-report \
	dev build

# ─── Backend ────────────────────────────────────────────────────────────────

install:
	cd backend && composer install

serve:
	cd backend && composer serve

db-migrate:
	cd backend && composer db:migrate

db-fixtures:
	cd backend && composer db:fixtures

test:
	cd backend && composer test

test-coverage:
	cd backend && composer coverage

# ─── Frontend ───────────────────────────────────────────────────────────────

dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

e2e:
	cd frontend && npx playwright test

e2e-ui:
	cd frontend && npx playwright test --ui

e2e-report:
	cd frontend && npx playwright show-report
